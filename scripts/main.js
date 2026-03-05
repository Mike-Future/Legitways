document.addEventListener('DOMContentLoaded', function () {
    const btn  = document.querySelector('.hamburger');
    const menu = document.querySelector('.header-right-section');

    btn.addEventListener('click', () => menu.classList.toggle('open'));

    // show admin link if the user is authenticated
    if (localStorage.getItem('loggedIn') === 'true') {
        document.body.classList.add('logged-in');
    }
});