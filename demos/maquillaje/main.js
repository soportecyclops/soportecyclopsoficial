document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu 
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            });
        });
    }

    // 2. Header Shrink
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // 3. Observer para Fade-In (Reveal)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Accordion Nativo (Cierre exclusivo)
    const details = document.querySelectorAll('details[name="faq-group"]');
    details.forEach(targetDetail => {
        targetDetail.addEventListener('click', () => {
            details.forEach(detail => {
                if (detail !== targetDetail) {
                    detail.removeAttribute('open');
                }
            });
        });
    });

    // 5. Carrusel Portfolio
    const track = document.getElementById('carousel-track');
    const slides = track ? Array.from(track.children) : [];
    const indicators = document.querySelectorAll('.carousel-indicator');
    const carouselContainer = document.querySelector('.carousel-container');
    
    let currentIndex = 0;
    let autoPlayInterval;
    const intervalTime = 4500;

    const updateCarousel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        indicators.forEach(ind => ind.classList.remove('active'));
        if(indicators[index]) indicators[index].classList.add('active');
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel(currentIndex);
    };

    const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, intervalTime);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    if (indicators.length > 0 && slides.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel(currentIndex);
                stopAutoPlay();
                startAutoPlay();
            });
        });

        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoPlay);
            carouselContainer.addEventListener('mouseleave', startAutoPlay);
            carouselContainer.addEventListener('focusin', stopAutoPlay);
            carouselContainer.addEventListener('focusout', startAutoPlay);
            startAutoPlay();
        }
    }
});