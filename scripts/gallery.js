const glob = require('glob');
const gallery_dir = hexo.config.gallery_dir || "galleries"

hexo.extend.generator.register(gallery_dir, async function() {
    const themeConfig = hexo.theme.config;
    const gallery_enable = themeConfig.gallery_enable;
    if (!gallery_enable) {
        return;
    }
    const galleries = themeConfig.galleries || [];

    let d = [galleryList(galleries)];
    for (const galleryConfig of galleries) {
        const storeType = galleryConfig.type;
        switch (storeType.toLowerCase()) {
            case "local": storeToLocal(galleryConfig, d); console.log("local done..."); break;
            case "alist": await storeToAlist(galleryConfig, d); console.log("alist done..."); break;
        }
    }
    return d;
});

function buildGallery(dir, files) {
    return {
        path: gallery_dir + "/" +dir.path + '/index.html',
        data: {
            gallery: {
                name: dir.name,
                thumb_first: dir.thumb_first,
                desc: dir.description,
                files: files
            }
        },
        layout: 'gallery'
    };
}

function galleryList(galleries) {
    let g = []
    for (const gallery of galleries) {
        gallery.dirs.forEach(t => g.push({
            path: t.path + "/",
            name: t.name
        }))
    }
    return {
        path: gallery_dir + '/index.html',
        data: {
            galleries: g
        },
        layout: 'galleries'
    };
}

const File = class {
    constructor(path, thumb) {
        this.path = path;
        this.thumb = thumb;
    }
}

const alistCacheFile = "hexo-alist-cache-file.json";

function storeToLocal(galleryConfig, d) {
    galleryConfig.dirs.forEach(pattern => {
        let matchedFiles = glob.sync(pattern.dir, { cwd: hexo.source_dir });
        matchedFiles = matchedFiles.slice(0, galleryConfig.per_dir_limit)
        let files = [];
        matchedFiles.forEach(f => files.push(new File("/" + f, null)))
        d.push(buildGallery(pattern, files))
    });
}

const default_filters = ".(jpg|png|jpeg|bmp|svg)$"

const Alist_Cache = class {
    constructor(cacheMap = new Map()) {
        this.createTime = new Date();
        this.cacheMap = cacheMap;
    }

    toJSON() {
        return {
            createTime: this.createTime,
            cacheMap: [...this.cacheMap]
        };
    }
}

function processEnv(env) {
    if (typeof env === 'string') {
        env = env.replace(/\${(.*?)}/g, (match, envVar) => {
            return process.env[envVar] || match;
        });
    }
    return env;
}

async function storeToAlist(galleryConfig, galleries) {
    const token = processEnv(galleryConfig.token);
    const ignore_ssl_error = galleryConfig.ignore_ssl_error || false;
    const dirs = galleryConfig.dirs || [];
    const enable_cache = galleryConfig.enable_cache || true;

    if (ignore_ssl_error) {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
    }

    const forceDeploy = processEnv("${FORCE_DEPLOY}") === "true";
    if (enable_cache && !forceDeploy) {
        let cacheMap = await getAlistCache(galleryConfig, headers) || null;
        if (cacheMap !== null) {
            dirs.forEach(d => galleries.push(buildGallery(d, cacheMap.get(d.dir))))
            return
        } else {
            console.log("no cache found on storage : %s", galleryConfig.type);
        }
    }

    const limit = galleryConfig.per_dir_limit || 20;
    let cacheMap = new Map();
    for ( const d of dirs ) {
        const dir = d.dir;
        const filters = new RegExp(galleryConfig.filters || default_filters, 'i');

        let param = {
            path: dir,
            page: 1,
            per_page: limit,
        };
        let result = await sendRequest(galleryConfig.server + "/api/fs/list", new POST_JSON(headers, param));
        let content = result.data.content || [];

        let files = [];
        for ( const c of content) {
            let name = c.name;
            if (c.is_dir) {
                console.log("skipped dir: %s", dir + name);
                continue;
            }
            let validFile = filters.test(name);
            if(!validFile) {
                console.log("skipped file: %s, filters: %s", dir + name, filters);
                continue;
            }
            param = {
                path: dir + name,
            };
            result = await sendRequest(galleryConfig.server + "/api/fs/get", new POST_JSON(headers, param));
            let raw_url = result.data.raw_url || "";
            let thumb = result.data.thumb || "";

            files.push(new File(raw_url, thumb));
        }
        console.log("gallery: %s size: %s dir: %s", d.name, files.length, dir)
        if (files.length > 0) {
            cacheMap.set(dir, files);
            galleries.push(buildGallery(d, files))
        }
    }

    if (enable_cache && cacheMap.size > 0) {
        await saveAlistCache(galleryConfig, cacheMap);
    }
}

async function saveAlistCache(galleryConfig, cacheMap) {
    const encodeFilePath = encodeURIComponent(galleryConfig.cache_dir + alistCacheFile);
    let h = {
        'Authorization': processEnv(galleryConfig.token),
        'As-Task': false,
        'File-Path': encodeFilePath,
        'Content-Type': 'application/json',
        'Overwrite': true
    }
    let init = {
        method: 'PUT',
        headers: h,
        body: JSON.stringify(new Alist_Cache(cacheMap)),
        duplex: 'half'
    }
    let r = await sendRequest(galleryConfig.server + "/api/fs/put", init);
    console.log("put cache file code: %s, message: %s", r.code, r.message)
}

async function getAlistCache(galleryConfig, headers) {
    let cacheParam = {
        path: galleryConfig.cache_dir + alistCacheFile,
    };

    let result = await sendRequest(galleryConfig.server + "/api/fs/get", new POST_JSON(headers, cacheParam));
    if (result.code === 200) {
        try {
            const response = await (await fetch(result.data.raw_url)).json();
            const duration = galleryConfig.cache_duration || 86400;
            if ((new Date() - response.createTime) >= duration) {
                console.log("cache : %s expires", cacheParam.path);
                return null;
            }
            return new Map(response.cacheMap);
        } catch (error) {
            console.error('get cache error: %s', result.data.raw_url, error);
            throw error;
        }
    }
}

const POST_JSON = class {
    constructor(headers, data) {
        this.method = 'POST';
        this.headers = headers;
        this.body = JSON.stringify(data)
    }
}

async function sendRequest(url, init) {
    try {
        const response = await fetch(url, init);
        let r = await response.json();
        if (r.code !== 200) {
            console.log("url : %s", url);
            console.log("body : %s", init.body);
            console.log("%s : %s", r.code, r.message);
        }
        return r;
    } catch (error) {
        console.error('url: %s body: %s Error:', url, init.body, error);
        throw error;
    }
}
