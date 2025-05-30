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
const lozadInit = '<script>const observer = lozad(); observer.observe();</script>'
hexo.extend.injector.register('body_end', lozadInit, 'post')
hexo.extend.injector.register('body_end', lozadInit, 'page')
hexo.extend.injector.register('head_begin', '<script type="text/javascript" src="/js/lozad.min.js"></script>', 'page')
hexo.extend.injector.register('head_begin', '<script type="text/javascript" src="/js/lozad.min.js"></script>', 'post')
