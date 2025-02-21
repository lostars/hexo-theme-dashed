document.addEventListener('DOMContentLoaded', function() {
    const emailUser = document.getElementById('emailUser');
    const emailDomain = document.getElementById('emailDomain');
    if (emailUser && emailDomain) {
        const user = emailUser.getAttribute('value');
        const domain = emailDomain.getAttribute('value');
        const email = atob(user) + "@" + atob(domain)
        const mailtoLink = document.getElementById('emailLink');
        mailtoLink.href = 'mailto:' + email;
    }
});