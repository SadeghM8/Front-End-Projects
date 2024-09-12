/*================Scroll Sections Active Link=================*/
let sections = document.querySelectorAll('section');
let navlinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navlinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });
};

/*=====================Scroll Reveal=======================*/
ScrollReveal({
    // reset: true,
    distance: '80px',
    duration: 2000,
    display: 200
});

ScrollReveal().reveal('.home-content, .heading, .title', { origin: 'top' });
ScrollReveal().reveal('.pizza-img, .cards, .social'
, { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img, .col1, .col3, .srch, .footer', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .col2, .titl4, .capt4, .mid',  { origin: 'right' });