// ===== CONFIGURAÇÕES (edite conforme sua necessidade) =====
// Se você tiver um endpoint (ex.: Formspree, backend próprio), coloque aqui:
const FORM_ENDPOINT = ""; // ex.: "https://formspree.io/f/xxxxxx"
// Ou defina um e-mail para abrir um mailto como fallback:
const EMAIL_TO = ""; // ex.: "seuemail@dominio.com"

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initHeaderBehavior();
    initSmoothScrolling();
    initMobileMenu();
    initScrollAnimations();
    initTestimonialsCarousel();
    initContactForm();
});

// ===== HEADER / NAV =====
function initHeaderBehavior() {
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky visual no scroll
    const onScroll = () => {
        if (window.scrollY > 10) header.classList.add('sticky');
        else header.classList.remove('sticky');

        // Ativar link da seção visível
        const sections = document.querySelectorAll('section[id]');
        const offset = 120; // compensar header
        const y = window.scrollY + offset;
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (y >= top && y < bottom) {
                navLinks.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-link[href="#${section.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                const el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Botões programáticos
    window.scrollToContact = () => document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
    window.scrollToBeneficios = () => document.getElementById('beneficios').scrollIntoView({ behavior: 'smooth' });
}

function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    const updateAria = () => toggle.setAttribute('aria-expanded', nav.classList.contains('active'));

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
        const icon = toggle.querySelector('i');
        icon.className = nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        updateAria();
    });

    document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            toggle.querySelector('i').className = 'fas fa-bars';
            updateAria();
        }
    });

    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        toggle.querySelector('i').className = 'fas fa-bars';
        updateAria();
    }));
}

// ===== ANIMAÇÕES DE SCROLL =====
function initScrollAnimations() {
    // Tornar elementos .fade-in e .slide-up visíveis ao entrar na viewport
    const els = document.querySelectorAll('.fade-in, .slide-up');
    if (!('IntersectionObserver' in window)) {
        els.forEach(e => e.classList.add('visible'));
        // Revelar hero no load
        revealHeroOnLoad();
        return;
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(el => obs.observe(el));

    revealHeroOnLoad();
}

function revealHeroOnLoad() {
    const title = document.querySelector('.hero-title');
    const desc = document.querySelector('.hero-description');
    const btns = document.querySelector('.hero-buttons');
    setTimeout(() => { if (title) { title.style.opacity = '1'; title.style.transform = 'translateY(0)'; } }, 250);
    setTimeout(() => { if (desc) { desc.style.opacity = '1'; desc.style.transform = 'translateY(0)'; } }, 450);
    setTimeout(() => { if (btns) { btns.style.opacity = '1'; btns.style.transform = 'translateY(0)'; } }, 650);
}

// ===== CARROSSEL DEPOIMENTOS =====
function initTestimonialsCarousel() {
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    if (!carousel || !track) return;

    let slides = Array.from(track.children);
    let index = 0;
    let autoTimer = null;

    // Dots
    const dotsWrap = document.querySelector('.carousel-dots');
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
    });

    function setActiveDot(i) {
        const dots = Array.from(dotsWrap.children);
        dots.forEach((d, j) => d.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    }

    function sizeSlides() {
        const width = carousel.getBoundingClientRect().width;
        slides.forEach(s => s.style.minWidth = width + 'px');
        track.style.transform = `translateX(-${index * width}px)`;
    }

    function goTo(i) {
        const total = slides.length;
        index = (i + total) % total;
        const width = carousel.getBoundingClientRect().width;
        track.style.transform = `translateX(-${index * width}px)`;
        setActiveDot(index);
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(() => goTo(index + 1), 4500); }
    function stopAuto() { if (autoTimer) clearInterval(autoTimer); }

    window.addEventListener('resize', debounce(sizeSlides, 120));
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Init
    sizeSlides();
    goTo(0);
    startAuto();
}

// ===== FORMULÁRIO DE CONTATO =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const original = submitBtn.innerHTML;

        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();

        if (!name || !email) { showAlert('Por favor, preencha todos os campos.', 'error'); return; }
        if (!isValidEmail(email)) { showAlert('Por favor, insira um e-mail válido.', 'error'); return; }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        form.classList.add('loading');

        try {
            // 1) Se houver endpoint, envia via fetch
            if (FORM_ENDPOINT) {
                const res = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
                if (!res.ok) throw new Error('Falha no envio');
                showAlert(`Obrigado, ${name}! Em breve você receberá mais informações no seu e-mail.`, 'success');
                form.reset();
            // 2) Se houver e-mail configurado, abre mailto
            } else if (EMAIL_TO) {
                const subject = encodeURIComponent('Inscrição - Curso de Produtividade');
                const body = encodeURIComponent(`Olá, meu nome é ${name}.\nQuero me inscrever no curso.\nMeu e-mail: ${email}`);
                window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
                showAlert('Abrimos seu aplicativo de e-mail para concluir o envio. Obrigado!', 'success');
                form.reset();
            // 3) Sem backend: simula sucesso
            } else {
                await new Promise(r => setTimeout(r, 1200));
                showAlert(`Obrigado, ${name}! Seu e-mail foi cadastrado com sucesso.`, 'success');
                form.reset();
            }
        } catch (err) {
            showAlert('Não foi possível enviar agora. Tente novamente mais tarde.', 'error');
        } finally {
            submitBtn.innerHTML = original;
            submitBtn.disabled = false;
            form.classList.remove('loading');
        }
    });
}

// ===== UTILITÁRIOS =====
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function showAlert(message, type = 'info') {
    const previous = document.querySelector('.alert');
    if (previous) previous.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content" style="display:flex;align-items:center;gap:10px;">
            <i class="fas ${getAlertIcon(type)}"></i>
            <span>${message}</span>
            <button class="alert-close" aria-label="Fechar alerta" onclick="this.closest('.alert').remove()" style="margin-left:auto;background:transparent;border:0;color:inherit;cursor:pointer"><i class="fas fa-times"></i></button>
        </div>
    `;

    // Estilos inline para independência do CSS
    Object.assign(alert.style, {
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007BFF',
        color: '#fff', padding: '14px 16px', borderRadius: '10px', boxShadow: '0 10px 20px rgba(0,0,0,.15)',
        transform: 'translateX(380px)', transition: 'transform .35s ease', maxWidth: '420px'
    });

    document.body.appendChild(alert);
    requestAnimationFrame(() => { alert.style.transform = 'translateX(0)'; });
    setTimeout(() => { if (alert.parentElement) { alert.style.transform = 'translateX(380px)'; setTimeout(() => alert.remove(), 350); } }, 5200);
}

function getAlertIcon(type) { return type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'; }

function debounce(fn, wait) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// ===== TELEMETRIA BÁSICA =====
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cta-primary');
    if (btn) console.log('CTA click', { section: btn.closest('section')?.id || 'unknown' });
}); 