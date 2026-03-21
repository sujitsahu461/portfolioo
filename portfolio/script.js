/* ============================================================
   SUJIT SAHU PORTFOLIO SCRIPTS
   Features: Loader, Typing, Scroll Reveal, Skill Bars,
             Scroll Progress, Navbar, Back-To-Top, Contact Form,
             Mystery Theme Parallax and 3D Tilt
   ============================================================ */

'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. LOADING SCREEN */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add('hidden');
    document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  }, 1600);
});

/* 2. TYPING ANIMATION */
const typedEl = document.getElementById('typed-text');
const phrases = [
  'B.Tech CSE Student',
  'Cybersecurity Enthusiast',
  'Full Stack Explorer',
  'Aspiring Security Specialist',
  'AI Explorer',
  'Self-Taught Developer',
];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typingTimer = null;

function type() {
  if (!typedEl) return;

  const current = phrases[phraseIdx];

  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typedEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }

  let delay = isDeleting ? 50 : 90;

  if (!isDeleting && charIdx === current.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    delay = 350;
  }

  typingTimer = setTimeout(type, delay);
}

setTimeout(() => {
  if (typedEl) type();
}, 1800);

/* 3. SCROLL PROGRESS BAR */
const progressBar = document.getElementById('scroll-progress');

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
const backToTopBtn = document.getElementById('backToTop');

function updateBackToTop() {
  if (!backToTopBtn) return;

  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* 6. SINGLE SCROLL EVENT HANDLER */
window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateNavbar();
  updateBackToTop();
  revealElements();
  animateSkillBars();
}, { passive: true });

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
  // Observer handles reveals. This is kept as a fallback hook.
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
  animateSkillBars();
  updateScrollProgress();
  updateNavbar();
  updateBackToTop();
  initMysteryMotion();
});
