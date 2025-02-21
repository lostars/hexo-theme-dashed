document.addEventListener('DOMContentLoaded', function() {
    const user = document.getElementById('emailUser').getAttribute('value');
    const domain = document.getElementById('emailDomain').getAttribute('value');

    const email = atob(user) + "@" + atob(domain)
    const mailtoLink = document.getElementById('emailLink');
    mailtoLink.href = 'mailto:' + email;
});