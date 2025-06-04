

const isMobile = window.innerWidth <= 768;

VANTA.GLOBE({
    el: "#vanta-container",
    mouseControls: !isMobile,
    touchControls: true,
    gyroControls: false,
    minHeight: isMobile ? 150 : 200,
    minWidth: isMobile ? 150 : 200,
    scale: 1.00,
    scaleMobile: isMobile ? 0.5 : 1.00,
    backgroundcolor: 0x15162f,
    size: isMobile ? 0.30 : 0.70
});


// Typed.js effect
const roles = ["Computer Vision Engineer", "GenAI Specialist", "Data Scientist", "Software Engineer"];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeText() {
    const currentRole = roles[roleIndex];
    const currentText = isDeleting
        ? currentRole.substring(0, charIndex - 1)
        : currentRole.substring(0, charIndex + 1);

    document.getElementById('typed').textContent = currentText;

    if (!isDeleting && charIndex === currentRole.length) {
        setTimeout(() => isDeleting = true, 1500);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
    }

    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    setTimeout(typeText, isDeleting ? 50 : 150);
}

// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', function () {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Close mobile menu when clicking on a link
const mobileLinks = document.querySelectorAll('#mobile-menu a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});

// Initialize after DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
    typeText();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const nav = document.getElementById("main-nav");
    let lastScrollTop = 0;

    window.addEventListener("scroll", function () {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Threshold: height of the hero section
        const heroSectionHeight = document.querySelector(".hero-section").offsetHeight;

        if (scrollTop > heroSectionHeight) {
            // User has scrolled past hero section -> show nav
            nav.classList.add("show-nav");
        } else {
            // User is still in hero section -> hide nav
            nav.classList.remove("show-nav");
        }

        lastScrollTop = scrollTop;
    });
});