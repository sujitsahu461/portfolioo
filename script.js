/* ============================================================
   PREMIUM INTERACTIVE PORTFOLIO - JAVASCRIPT
   Animation Engine: GSAP + ScrollTrigger
   Features: Smooth scroll, fade animations, hover effects,
             cursor tracking, entry transitions
   ============================================================ */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ── CONFIGURATION ── 
const config = {
  loaderDuration: 2.5,
  entryScreenDuration: 0.8,
  animationDelay: 0.05,
};

// ── PREFERS REDUCED MOTION ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ──── LOADING SCREEN ────
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  gsap.to('.loader-bar-fill', {
    width: '100%',
    duration: config.loaderDuration,
    ease: 'power2.inOut',
  });

  setTimeout(() => {
    gsap.to(loader, {
      opacity: 0,
      visibility: 'hidden',
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.classList.add('hidden');
      },
    });
  }, config.loaderDuration * 1000 - 600);
}

// ──── CUSTOM CURSOR ────
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  if (!cursor || !cursorFollower) return;

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Update cursor position on mouse move
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Move cursor dot with delay
    gsap.to(cursor, {
      left: mouseX,
      top: mouseY,
      duration: 0,
    });

    // Animate follower with ease
    gsap.to(cursorFollower, {
      left: mouseX - 20,
      top: mouseY - 20,
      duration: 0.3,
    });
  });

  // Highlight cursor on interactive elements
  const interactiveElements = document.querySelectorAll(
    'a, button, .project-card, .skill-item, .contact-link'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursorFollower, { scale: 1.5, opacity: 1, duration: 0.3 });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(cursorFollower, { scale: 1, opacity: 0.7, duration: 0.3 });
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, cursorFollower], { opacity: 0, duration: 0.3 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, cursorFollower], { opacity: 1, duration: 0.3 });
  });
}

// ──── ENTRY SCREEN ANIMATION ────
function initEntryScreen() {
  const entryScreen = document.getElementById('entryScreen');
  const enterBtn = document.getElementById('enterBtn');

  if (!entryScreen) return;

  enterBtn?.addEventListener('click', () => {
    gsap.to(entryScreen, {
      opacity: 0,
      visibility: 'hidden',
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        entryScreen.classList.add('hidden');
      },
    });

    // Trigger hero animations
    animateHero();
  });

  // Optional: Auto-transition after delay
  // setTimeout(() => enterBtn?.click(), 8000);
}

// ──── HERO SECTION ────
function animateHero() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  // Parallax background
  tl.to(
    '.hero-grid',
    {
      opacity: 0.3,
      y: 100,
    },
    0
  );
}

// ──── SCROLL REVEAL ANIMATIONS ────
function initScrollRevealAnimations() {
  // About section
  gsap.to('.about-header', {
    scrollTrigger: {
      trigger: '.about-header',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });

  gsap.utils.toArray('.about-text').forEach((element) => {
    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  });

  gsap.utils.toArray('.about-skills-preview').forEach((element) => {
    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.2,
    });
  });

  // Projects section
  gsap.to('.projects-header', {
    scrollTrigger: {
      trigger: '.projects-header',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });

  gsap.utils.toArray('.project-card').forEach((card, index) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: index * config.animationDelay,
    });
  });

  // Skills section
  gsap.to('.skills-header', {
    scrollTrigger: {
      trigger: '.skills-header',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });

  gsap.utils.toArray('.skill-category').forEach((category, index) => {
    gsap.to(category, {
      scrollTrigger: {
        trigger: category,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: index * config.animationDelay,
    });
  });

  // Contact section
  gsap.to('.contact-content', {
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
  });

  gsap.utils.toArray('.contact-link').forEach((link, index) => {
    gsap.to(link, {
      scrollTrigger: {
        trigger: link,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      delay: index * 0.1,
    });
  });

  // Footer
  gsap.to('.footer', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });
}

// ──── INTERACTIVE HOVER EFFECTS ────
function initHoverEffects() {
  // Project cards
  gsap.utils.toArray('.project-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  });

  // Skill categories
  gsap.utils.toArray('.skill-category').forEach((category) => {
    category.addEventListener('mouseenter', () => {
      gsap.to(category, {
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });

  // Contact links
  gsap.utils.toArray('.contact-link').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });
}

// ──── SMOOTH SCROLL BEHAVIOR ────
function initSmoothScroll() {
  // This keeps native smooth scrolling from HTML behavior,
  // but we can enhance it with GSAP if needed
  document.addEventListener('DOMContentLoaded', () => {
    ScrollTrigger.refresh();
  });

  // Refresh ScrollTrigger when window resizes
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}

// ──── PARALLAX EFFECTS ON SECTIONS ────
function initParallaxEffects() {
  // Hero section parallax
  gsap.to('.hero-grid', {
    y: 100,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      markers: false,
    },
    duration: 1,
  });

  // About section fade
  gsap.to('.about', {
    scrollTrigger: {
      trigger: '.about',
      start: 'top center',
      end: 'center center',
      scrub: 2,
    },
  });
}

// ──── TEXT SPLIT ANIMATION (Optional) ────
function setupTextAnimations() {
  // Animate section titles
  gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
}

// ──── PAGINATION / SCROLL PROGRESS ────
function initScrollProgress() {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / totalHeight) * 100;
    // You can use this value to update a progress bar if needed
  });
}

// ──── INITIALIZATION ────
function init() {
  // Start with loader
  initLoader();

  // Initialize custom cursor
  initCustomCursor();

  // Setup entry screen
  initEntryScreen();

  // Wait for entry screen to complete before other animations
  setTimeout(() => {
    // Initialize scroll animations
    initScrollRevealAnimations();
    initParallaxEffects();
    setupTextAnimations();
    initHoverEffects();
    initSmoothScroll();
    initScrollProgress();

    // Refresh ScrollTrigger
    ScrollTrigger.refresh();
  }, config.loaderDuration * 1000);
}

// ──── START ────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ──── KEYBOARD NAVIGATION ────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close any modals or overlays if needed
  }
});

// ──── PERFORMANCE OPTIMIZATION ────
// Throttle scroll events
let scrollTimeout;
document.addEventListener('scroll', () => {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      // Your scroll event code here
      scrollTimeout = null;
    }, 16); // ~60fps
  }
});

// ──── MOBILE OPTIMIZATIONS ────
if (window.matchMedia('(max-width: 768px)').matches) {
  // Reduce animation complexity on mobile
  gsap.globalTimeline.timeScale(0.95);
}

    setTimeout(type, 1000);
    return;
  }

  if (j === 0) {
    isDeleting = false;
    i = (i + 1) % roles.length;
  }

  setTimeout(type, isDeleting ? 50 : 100);
}

type();

/* 3. SCROLL PROGRESS BAR */
const progressBar = document.getElementById('progress-bar');

function updateScrollProgress() {
  if (!progressBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

/* 4. NAVBAR SCROLL BEHAVIOR */
const navbar = document.getElementById('navbar');

function updateNavbar() {
  if (!navbar) return;

  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* 5. BACK TO TOP BUTTON */
const topBtn = document.getElementById('topBtn');

function updateBackToTop() {
  if (!topBtn) return;
  topBtn.style.display = document.documentElement.scrollTop > 200 ? 'block' : 'none';
}

if (topBtn) {
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* 6. SINGLE SCROLL EVENT HANDLER */
window.onscroll = () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;

  if (progressBar) {
    progressBar.style.width = `${scrolled}%`;
  }

  updateScrollProgress();
  updateNavbar();
  updateBackToTop();
  revealElements();
  animateSkillBars();
};

/* 7. SCROLL REVEAL */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

function revealElements() {
  const reveals = document.querySelectorAll('.reveal');

  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      el.classList.add('active');
    }
  });
}

function initReveal() {
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach((el) => {
    if (el.closest('#hero')) return;
    revealObserver.observe(el);
  });
}

/* 8. ANIMATED SKILL BARS */
let skillBarsAnimated = false;

function animateSkillBars() {
  if (skillBarsAnimated) return;

  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const rect = skillsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.85) {
    skillBarsAnimated = true;
    document.querySelectorAll('.skill-fill').forEach((bar, i) => {
      const targetWidth = `${bar.getAttribute('data-w')}%`;
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, i * 80);
    });
  }
}

/* 9. MOBILE HAMBURGER MENU */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

document.addEventListener('click', (e) => {
  if (navbar && mobileMenu && hamburger && !navbar.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

/* 10. ACTIVE NAV LINKS */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((a) => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => activeObserver.observe(section));

/* 11. CONTACT FORM */
const contactForm = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

    if (!name) {
      showFormMsg('Please enter your name.', 'error');
      return;
    }
    if (!email || !isValidEmail(email)) {
      showFormMsg('Please enter a valid email address.', 'error');
      return;
    }
    if (!message) {
      showFormMsg('Please write a message.', 'error');
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending...';

    setTimeout(() => {
      showFormMsg("Message sent successfully! I'll get back to you soon.", 'success');
      contactForm.reset();
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-send"></i> Send Message';
    }, 1500);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormMsg(msg, type) {
  if (!formMsg) return;

  formMsg.textContent = msg;
  formMsg.className = `form-msg ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      formMsg.textContent = '';
      formMsg.className = 'form-msg';
    }, 5000);
  }
}

/* 12. SET FOOTER YEAR */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* 13. CURSOR GLOW EFFECT */
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  Object.assign(glow.style, {
    position: 'fixed',
    pointerEvents: 'none',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(132,245,255,0.06) 0%, rgba(95,140,255,0.04) 34%, transparent 70%)',
    transform: 'translate(-50%,-50%)',
    zIndex: '0',
    transition: 'left 0.15s ease, top 0.15s ease',
    willChange: 'left, top',
  });
  document.body.appendChild(glow);

  window.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }, { passive: true });
}

/* 14. MYSTERY PARALLAX + 3D TILT */
function initMysteryMotion() {
  if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

  const hero = document.getElementById('hero');
  const heroLayers = [
    ['.hero-grid', 10],
    ['.hero-veil-1', 18],
    ['.hero-veil-2', 14],
    ['.hero-shard-1', 24],
    ['.hero-shard-2', 18],
    ['.orb-1', 22],
    ['.orb-2', 18],
    ['.code-float-1', 30],
    ['.code-float-2', 36],
  ]
    .map(([selector, depth]) => {
      const node = document.querySelector(selector);
      return node ? { node, depth } : null;
    })
    .filter(Boolean);

  if (hero && heroLayers.length) {
    let frame = null;

    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        heroLayers.forEach(({ node, depth }) => {
          node.style.setProperty('--mx', `${x * depth}px`);
          node.style.setProperty('--my', `${y * depth}px`);
        });
      });
    });

    hero.addEventListener('mouseleave', () => {
      heroLayers.forEach(({ node }) => {
        node.style.removeProperty('--mx');
        node.style.removeProperty('--my');
      });
    });
  }

  const tiltTargets = document.querySelectorAll(
    '.profile-photo, .stat-card, .skill-category, .project-card, .cert-card, .contact-link, .contact-form'
  );

  tiltTargets.forEach((card) => {
    let frame = null;

    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 12;
      const rotateX = (0.5 - py) * 12;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
        card.style.setProperty('--glow-x', `${px * 100}%`);
        card.style.setProperty('--glow-y', `${py * 100}%`);
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  });
}

/* 15. INIT */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  revealElements();
  animateSkillBars();
  updateScrollProgress();
  updateNavbar();
  updateBackToTop();
  initMysteryMotion();
});
