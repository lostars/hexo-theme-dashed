const glob = require('glob');
const gallery_dir = hexo.config.gallery_dir || "galleries"

hexo.extend.generator.register(gallery_dir, async function() {
    const themeConfig = hexo.theme.config;
    const gallery_on = themeConfig.gallery_on;
    if (!gallery_on) {
        return;
    }
    const galleries = themeConfig.galleries || [];

    let d = [galleryList(galleries)];
    for (const galleryConfig of galleries) {
        const galleryPath = gallery_dir + "/" +galleryConfig.path;
        const storeType = galleryConfig.type;

        let files = [];
        switch (storeType.toLowerCase()) {
            case "local": files = storeToLocal(galleryConfig, files); console.log("local done..."); break;
            case "alist": files = await storeToAlist(galleryConfig, files); console.log("alist %s done...", galleryConfig.name); break;
        }

        let gallery = {
            path: galleryPath + '/index.html',
            data: {
                gallery: {
                    name: galleryConfig.name,
                    thumb_first: galleryConfig.thumb_first,
                    desc: galleryConfig.description,
                    files: files
                }
            },
            layout: 'gallery'
        };
        d.push(gallery);
    }
    return d;
});

function galleryList(galleries) {
    let g = []
    galleries.forEach(t => g.push({
        path: t.path + "/",
        name: t.name
    }))
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

function storeToLocal(galleryConfig, files) {
    galleryConfig.files.forEach(pattern => {
        const matchedFiles = glob.sync(pattern, { cwd: hexo.source_dir });
        for (const f of matchedFiles) {
            files.push(new File('/' + f, null));
        }
    });
    return files;
}

const default_filters = ".(jpg|png|jpeg|bmp|svg)$"

const Alist_Cache = class {
    constructor(files) {
        this.createTime = new Date();
        this.files = files;
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

async function storeToAlist(galleryConfig, files) {
    const token = processEnv(galleryConfig.token);
    const ignore_ssl_error = galleryConfig.ignore_ssl_error || false;
    const dirs = galleryConfig.dirs || [];
    if (ignore_ssl_error) {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
    }

    for ( const d of dirs ) {
        const limit = d.limit || 20;
        const cache = d.cache || true;
        const dir = d.dir;
        const filters = new RegExp(d.filters || default_filters, 'i');

        const forceDeploy = processEnv("${FORCE_DEPLOY}") === "true";
        if (cache && !forceDeploy) {
            let cacheFiles = await getAlistCache(d, galleryConfig, headers) || null;
            if (cacheFiles !== null) {
                files = files.concat(cacheFiles.files);
                console.log("found cache on path : %s, size : %s", dir, cacheFiles.files.length);
                continue;
            } else {
                console.log("no cache found on path : %s", dir);
            }
        }

        let param = {
            path: dir,
            password: "",
            page: 1,
            per_page: limit,
            refresh: false
        };
        let result = await sendRequest(galleryConfig.server + "/api/fs/list", new POST_JSON(headers, param));
        let content = result.data.content || [];

        let cacheFiles = [];
        for ( const c of content) {
            if (c.is_dir) {
                console.log("skipped dir: %s", dir + name);
                continue;
            }
            let name = c.name;
            let validFile = filters.test(name);
            if(!validFile) {
                console.log("skipped file: %s, filters: %s", dir + name, filters);
                continue;
            }
            param = {
                path: dir + name,
                password: "",
                page: 1,
                per_page: 0,
                refresh: false
            };
            result = await sendRequest(galleryConfig.server + "/api/fs/get", new POST_JSON(headers, param));
            let raw_url = result.data.raw_url || "";
            let thumb = result.data.thumb || "";
            files.push(new File(raw_url, thumb));
            cacheFiles.push(new File(raw_url, thumb));
        }

        if (cache && cacheFiles.length > 0) {
            await saveAlistCache(dir, galleryConfig, cacheFiles, token);
        }
    }

    return files;
}

async function saveAlistCache(dir, galleryConfig, cacheFiles, token) {
    const encodeFilePath = encodeURIComponent(dir + alistCacheFile);
    let h = {
        'Authorization': token,
        'As-Task': false,
        'File-Path': encodeFilePath,
        'Content-Type': 'application/json',
        'Overwrite': true
    }
    let init = {
        method: 'PUT',
        headers: h,
        body: JSON.stringify(new Alist_Cache(cacheFiles)),
        duplex: 'half'
    }
    let r = await sendRequest(galleryConfig.server + "/api/fs/put", init);
    console.log("put cache file code: %s, message: %s", r.code, r.message)
}

async function getAlistCache(d, galleryConfig, headers) {
    let cacheParam = {
        path: d.dir + alistCacheFile,
        password: "",
        page: 1,
        per_page: 0,
        refresh: false
    };

    let result = await sendRequest(galleryConfig.server + "/api/fs/get", new POST_JSON(headers, cacheParam));
    if (result.code === 200) {
        try {
            const response = (await fetch(result.data.raw_url)).json();

            const duration = d.cache_duration || 86400;
            if ((new Date() - response.createTime) >= duration) {
                console.log("cache : %s expires", cacheParam.path);
                return null;
            }

            return response;
        } catch (error) {
            console.error('Error:', error);
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
        console.error('Error:', error);
        throw error;
    }
}
