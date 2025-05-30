const glob = require('glob');
const gallery_dir = "/" + (hexo.config.gallery_dir || "/galleries")

const base = require("./base")
base.init(hexo)
const r2 = require("./gallery-r2")
const alist = require("./gallery-alist")
const baiduphoto = require("./gallery-baiduphoto")

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
            case "alist": await alist.storeToAlist(galleryConfig, d); console.log("alist done..."); break;
            case "r2": await r2.r2(galleryConfig, d); console.log("r2 done..."); break;
            case "baiduphoto": await baiduphoto.baiduphoto(galleryConfig, d); console.log("baiduphoto done..."); break;
        }
    }
    return d;
});

function galleryList(galleries) {
    let g = []
    for (const gallery of galleries) {
        gallery.dirs.forEach(t => g.push({
            path: t.path,
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

function storeToLocal(galleryConfig, d) {
    galleryConfig.dirs.forEach(pattern => {
        let matchedFiles = glob.sync(pattern.dir, { cwd: hexo.source_dir });
        matchedFiles = matchedFiles.slice(0, galleryConfig.per_dir_limit)
        let files = [];
        matchedFiles.forEach(f => files.push(new File("/" + f, null)))
        d.push(base.buildGallery(pattern, files))
    });
}

hexo.extend.helper.register('get_gallery_pattern', function() {
    return new RegExp(`^${hexo.config.gallery_dir}/.+$`);
});

const cheerio = require('cheerio');
hexo.extend.filter.register('after_post_render', function(data) {
    const $ = cheerio.load(data.content);
    const images = $('img');
    if (images.length === 0) {
        return data;
    }

    images.each(function() {
        const img = $(this);
        const originalSrc = img.attr('src');

        if (originalSrc && !originalSrc.startsWith('data:')) { // Don't process data URIs
            img.attr('data-src', originalSrc);
            img.attr('src', '');
            img.addClass('lozad');
            img.attr('loading', 'lazy');
        }
    });

    data.content = $.html();
    return data;
});