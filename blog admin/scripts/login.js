document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = form.username.value.trim();
        const pass = form.password.value;

        // TODO: replace with real authentication call
        if (user === 'admin' && pass === 'password123') {
            localStorage.setItem('loggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid username or password.');
        }
    });
});