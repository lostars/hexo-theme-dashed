// https://hexo.io/api/injector
// email confusing
hexo.extend.injector.register('body_end', '<script>document.addEventListener(\'DOMContentLoaded\', function() {\n' +
    '    const emailUser = document.getElementById(\'emailUser\');\n' +
    '    const emailDomain = document.getElementById(\'emailDomain\');\n' +
    '    if (emailUser && emailDomain) {\n' +
    '        const user = emailUser.getAttribute(\'value\');\n' +
    '        const domain = emailDomain.getAttribute(\'value\');\n' +
    '        const email = atob(user) + "@" + atob(domain)\n' +
    '        const mailtoLink = document.getElementById(\'emailLink\');\n' +
    '        mailtoLink.href = \'mailto:\' + email;\n' +
    '    }\n' +
    '});</script>', 'default');

// img lazy load
const cheerio = require('cheerio');
// after_post_render data不是完整的html
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
// after_render:html 此时的str是完整的html，且是插件压缩过之后的
hexo.extend.filter.register('after_render:html', function (html, data) {
    if (!data.path.endsWith('.html')) return html;

    const $ = cheerio.load(html);
    if ($('.lozad').length > 0) {
        if ($('script[src="/js/lozad.min.js"]').length === 0) {
            $('head').prepend('<script src="/js/lozad.min.js"></script>');
        }
        if ($('script:contains("observer = lozad()")').length === 0) {
            $('body').append('<script>const observer = lozad(); observer.observe();</script>');
        }
    }

    return $.html();
});