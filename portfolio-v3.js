const rootHtml = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
const topbar = document.querySelector('.topbar');

// Theme switcher with localStorage persistence.
const applyTheme = (theme) => {
    const isLight = theme === 'light';
    rootHtml.setAttribute('data-theme', isLight ? 'light' : 'dark');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isLight ? '#f3f7f4' : '#0a0f0d');
    }
    if (themeToggle) {
        const icon = themeToggle.querySelector('.theme-icon');
        if (icon) icon.textContent = isLight ? '☾' : '☀';
        themeToggle.setAttribute('aria-label', isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang');
    }
};

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
} else {
    applyTheme('dark');
}

themeToggle?.addEventListener('click', () => {
    const nextTheme = rootHtml.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
});

// Sticky topbar state, back-to-top button & scroll progress indicator.
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
const updateOnScroll = () => {
    topbar?.classList.toggle('is-scrolled', window.scrollY > 12);
    backToTop?.classList.toggle('is-visible', window.scrollY > 400);
    if (scrollProgress) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        scrollProgress.style.transform = `scaleX(${ratio})`;
    }
};
updateOnScroll();
window.addEventListener('scroll', updateOnScroll, { passive: true });

// Active section highlight in navbar.
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                const active = link.getAttribute('href') === `#${entry.target.id}`;
                link.classList.toggle('is-active', active);
                if (active) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach((section) => navObserver.observe(section));
}

// Button ripple uses only the clicked element's local geometry.
document.querySelectorAll('.button, .contact-button, .nav-cta').forEach((button) => {
    button.addEventListener('click', (event) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = button.getBoundingClientRect();
        const diameter = Math.max(rect.width, rect.height) * 1.7;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = `${diameter}px`;
        ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
        button.querySelector('.ripple')?.remove();
        button.append(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
});

// Mobile navigation toggle & keyboard Escape support.
const closeMobileMenu = () => {
    if (!menuButton || !navigation) return;
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Buka navigasi');
};

if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
        const opened = navigation.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(opened));
        menuButton.setAttribute('aria-label', opened ? 'Tutup navigasi' : 'Buka navigasi');
    });

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
            closeMobileMenu();
            menuButton.focus();
        }
    });
}

// Copy email button.
const copyEmailBtn = document.getElementById('copy-email-btn');
const copyFeedback = document.getElementById('copy-feedback');
copyEmailBtn?.addEventListener('click', async () => {
    const email = copyEmailBtn.getAttribute('data-email');
    const labelSpan = copyEmailBtn.querySelector('span');
    if (!email) return;
    try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.classList.add('is-copied');
        if (labelSpan) labelSpan.textContent = 'Tersalin!';
        if (copyFeedback) copyFeedback.textContent = 'Email berhasil disalin ke clipboard.';
    } catch {
        if (copyFeedback) copyFeedback.textContent = `Salin manual: ${email}`;
    }
    setTimeout(() => {
        copyEmailBtn.classList.remove('is-copied');
        if (labelSpan) labelSpan.textContent = 'Salin Email';
        if (copyFeedback) copyFeedback.textContent = '';
    }, 2500);
});

// Contact form validation & mailto draft launcher.
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = contactForm.querySelector('#contact-name');
    const emailInput = contactForm.querySelector('#contact-email');
    const messageInput = contactForm.querySelector('#contact-message');
    const recipient = contactForm.getAttribute('data-recipient');

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const message = messageInput?.value.trim() || '';

    if (!name || !email || !message) {
        if (formStatus) formStatus.textContent = 'Mohon lengkapi nama, email, dan pesan Anda.';
        return;
    }

    const subject = encodeURIComponent(`Pesan Portofolio dari ${name}`);
    const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    if (formStatus) formStatus.textContent = 'Membuka aplikasi email Anda...';
});

// Campus moments lightbox preview with prev/next navigation.
const lightbox = document.getElementById('campus-lightbox');
const lightboxImg = document.getElementById('campus-lightbox-img');
const lightboxCaption = document.getElementById('campus-lightbox-caption');
const lightboxCounter = document.getElementById('campus-lightbox-counter');
const lightboxClose = document.getElementById('campus-lightbox-close');
const lightboxPrev = document.getElementById('campus-lightbox-prev');
const lightboxNext = document.getElementById('campus-lightbox-next');
const campusItems = [...document.querySelectorAll('.campus-item[data-lightbox-src]')];
let activeLightboxIndex = 0;

const showLightboxAt = (index) => {
    if (!lightbox || !lightboxImg || !campusItems.length) return;
    activeLightboxIndex = (index + campusItems.length) % campusItems.length;
    const item = campusItems[activeLightboxIndex];
    const alt = item.getAttribute('data-lightbox-alt') || 'Foto Campus Moments';
    lightboxImg.src = item.getAttribute('data-lightbox-src') || '';
    lightboxImg.alt = alt;
    if (lightboxCaption) lightboxCaption.textContent = alt;
    if (lightboxCounter) lightboxCounter.textContent = `${activeLightboxIndex + 1} / ${campusItems.length}`;
};

campusItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        showLightboxAt(index);
        if (typeof lightbox?.showModal === 'function' && !lightbox.open) {
            lightbox.showModal();
        }
    });
});

lightboxPrev?.addEventListener('click', () => showLightboxAt(activeLightboxIndex - 1));
lightboxNext?.addEventListener('click', () => showLightboxAt(activeLightboxIndex + 1));
lightboxClose?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
});
document.addEventListener('keydown', (event) => {
    if (!lightbox?.open) return;
    if (event.key === 'ArrowLeft') showLightboxAt(activeLightboxIndex - 1);
    if (event.key === 'ArrowRight') showLightboxAt(activeLightboxIndex + 1);
});

// Reveal content safely: if JS/observer is unavailable, content remains visible.
const revealItems = document.querySelectorAll('.motion-reveal');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}
