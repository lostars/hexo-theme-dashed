const base = require("./base");

const alistCacheFile = "hexo-alist-cache-file.json";
const default_filters = ".(jpg|png|jpeg|bmp|svg)$"

async function storeToAlist(galleryConfig, galleries) {
    const token = base.processEnv(galleryConfig.token);
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

    const forceDeploy = base.processEnv("${FORCE_DEPLOY}") === "true";
    if (enable_cache && !forceDeploy) {
        let cacheMap = await getAlistCache(galleryConfig, headers) || null;
        if (cacheMap !== null) {
            dirs.forEach(d => galleries.push(base.buildGallery(d, cacheMap.get(d.dir))))
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
        let result = await base.sendRequest(galleryConfig.server + "/api/fs/list", new POST_JSON(headers, param));
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
            result = await base.sendRequest(galleryConfig.server + "/api/fs/get", new POST_JSON(headers, param));
            let raw_url = result.data.raw_url || "";
            let thumb = result.data.thumb || "";

            files.push(new base.File(raw_url, thumb));
        }
        console.log("gallery: %s size: %s dir: %s", d.name, files.length, dir)
        if (files.length > 0) {
            cacheMap.set(dir, files);
            galleries.push(base.buildGallery(d, files))
        }
    }

    if (enable_cache && cacheMap.size > 0) {
        await saveAlistCache(galleryConfig, cacheMap);
    }
}

async function saveAlistCache(galleryConfig, cacheMap) {
    const encodeFilePath = encodeURIComponent(galleryConfig.cache_dir + alistCacheFile);
    let h = {
        'Authorization': base.processEnv(galleryConfig.token),
        'As-Task': false,
        'File-Path': encodeFilePath,
        'Content-Type': 'application/json',
        'Overwrite': true
    }
    let init = {
        method: 'PUT',
        headers: h,
        body: JSON.stringify(new base.Gallery_Cache(cacheMap)),
        duplex: 'half'
    }
    let r = await base.sendRequest(galleryConfig.server + "/api/fs/put", init);
    console.log("put cache file code: %s, message: %s", r.code, r.message)
}

async function getAlistCache(galleryConfig, headers) {
    let cacheParam = {
        path: galleryConfig.cache_dir + alistCacheFile,
    };

    let result = await base.sendRequest(galleryConfig.server + "/api/fs/get", new POST_JSON(headers, cacheParam));
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

module.exports = {
    storeToAlist,
}