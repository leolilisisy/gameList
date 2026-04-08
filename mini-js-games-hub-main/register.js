document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    const i18n = window.SiteI18n;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            alert(i18n.t('register.fillAll'));
            return;
        }

        let users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            alert(i18n.t('register.emailExists'));
            return;
        }
        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        // On successful registration
        alert(i18n.t('register.signupSuccess'));
        localStorage.setItem('loggedInUser', email);
        window.location.href = 'index.html';
    });
});
