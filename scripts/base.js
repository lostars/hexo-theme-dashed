
function processEnv(env) {
    if (typeof env === 'string') {
        env = env.replace(/\${(.*?)}/g, (match, envVar) => {
            return process.env[envVar] || match;
        });
    }
    return env;
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

let gallery_dir = ""
function init(hexo) {
    gallery_dir = hexo.config.gallery_dir || "galleries";
}

const File = class {
    constructor(path, thumb) {
        this.path = path;
        this.thumb = thumb;
    }
}

module.exports = {
    processEnv,
    sendRequest,
    buildGallery,
    init,
    File,
}