const base = require("./base")

const listUrl = "https://photo.baidu.com/youai/album/v1/listfile"
async function baiduphoto(galleryConfig, data) {

    const dirs = galleryConfig.dirs || [];
    if (dirs.length <= 0) return
    const cookie = base.processEnv(galleryConfig.cookie)
    const per_dir_limit = base.processEnv(galleryConfig.per_dir_limit)

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'Referer': 'https://photo.baidu.com/',
    }

    let param = {
        method: 'GET',
        headers: headers,
    }

    for ( const d of dirs ) {
        const url = listUrl + `?album_id=${d.dir}&limit=${per_dir_limit}`

        const result = await base.sendRequest(url, param);
        const thumbs = result.list;
        if (!thumbs || thumbs.length <= 0) continue

        let files = [];
        for ( const thumb of thumbs ) {
            const thumburl = thumb.thumburl
            if (!thumburl || thumburl.length <= 0) continue
            const t = thumburl[0]
            const path = thumburl[1] || null
            files.push(new base.File(path, t))
        }

        if (files.length > 0) {
            data.push(base.buildGallery(d, files))
        }
    }
}

module.exports = {
    baiduphoto
}