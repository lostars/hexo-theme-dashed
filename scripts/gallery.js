const glob = require('glob');

hexo.extend.generator.register('galleries', function() {
    const themeConfig = hexo.theme.config;
    const galleries = themeConfig.galleries || [];

    return galleries.map(galleryConfig => {
        const galleryPath = themeConfig.gallery_path + galleryConfig.path;
        const galleryFiles = galleryConfig.files;
        const name = galleryConfig.name;

        let files = [];
        galleryFiles.forEach(pattern => {
            const matchedFiles = glob.sync(pattern, { cwd: hexo.source_dir });
            files = files.concat(matchedFiles.map(file => '/' + file));
        });

        return {
            path: galleryPath + '/index.html',
            data: {
                gallery: {
                    name: name,
                    files: files
                }
            },
            layout: 'gallery' // 使用 gallery.ejs 模板
        };
    });
});