/* ============================================================
   PREMIUM INTERACTIVE PORTFOLIO - JAVASCRIPT
   Animation Engine: GSAP + ScrollTrigger
   Features: Loader, entry transitions, hover effects,
             cursor tracking, scroll reveals
   ============================================================ */

const config = {
  loaderDuration: 1.5,
  loaderFadeDuration: 0.6,
  animationDelay: 0.05,
  loaderFailsafeDelay: 3500,
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

if (hasGSAP && hasScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

let loaderFinished = false;
let completeInitRan = false;

function animateTo(target, vars, fallback) {
  if (!target) {
    if (vars && typeof vars.onComplete === 'function') {
      vars.onComplete();
    }
    return;
  }

  if (hasGSAP) {
    window.gsap.to(target, vars);
    return;
  }

  if (typeof fallback === 'function') {
    fallback();
  }

  if (vars && typeof vars.onComplete === 'function') {
    window.setTimeout(vars.onComplete, (vars.duration || 0) * 1000);
  }
}

function hideLoader() {
  const loader = document.getElementById('loader');

  if (!loader || loaderFinished) {
    return;
  }

  loaderFinished = true;

  animateTo(
    loader,
    {
      opacity: 0,
      duration: config.loaderFadeDuration,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.classList.add('hidden');
        completeInit();
      },
    },
    () => {
      loader.style.opacity = '0';
    }
  );
}

function initLoader() {
  const loader = document.getElementById('loader');
  const barFill = document.querySelector('.loader-bar-fill');

  if (!loader || !barFill) {
    completeInit();
    return;
  }

  const fallbackHide = window.setTimeout(hideLoader, config.loaderFailsafeDelay);

  if (hasGSAP) {
    window.gsap.set(barFill, { scaleX: 0, transformOrigin: 'left center' });
    window.gsap.to(barFill, {
      scaleX: 1,
      duration: prefersReducedMotion ? 0.2 : config.loaderDuration,
      ease: 'power2.inOut',
      onComplete: () => {
        window.clearTimeout(fallbackHide);
        hideLoader();
      },
    });
    return;
  }

  barFill.style.transition = `transform ${prefersReducedMotion ? 0.2 : config.loaderDuration}s ease-in-out`;
  barFill.style.transformOrigin = 'left center';
  window.requestAnimationFrame(() => {
    barFill.style.transform = 'scaleX(1)';
  });

  window.setTimeout(() => {
    window.clearTimeout(fallbackHide);
    hideLoader();
  }, (prefersReducedMotion ? 0.2 : config.loaderDuration) * 1000);
}

function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!cursor || !cursorFollower || !supportsFinePointer) {
    return;
  }

  document.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;

    if (hasGSAP) {
      window.gsap.to(cursorFollower, {
        left: event.clientX - 20,
        top: event.clientY - 20,
        duration: 0.3,
      });
    } else {
      cursorFollower.style.left = `${event.clientX - 20}px`;
      cursorFollower.style.top = `${event.clientY - 20}px`;
    }
  });

  document.querySelectorAll('a, button, .project-card, .skill-item, .contact-link').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      if (hasGSAP) {
        window.gsap.to(cursorFollower, { scale: 1.5, opacity: 1, duration: 0.3 });
      } else {
        cursorFollower.style.transform = 'scale(1.5)';
        cursorFollower.style.opacity = '1';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (hasGSAP) {
        window.gsap.to(cursorFollower, { scale: 1, opacity: 0.7, duration: 0.3 });
      } else {
        cursorFollower.style.transform = 'scale(1)';
        cursorFollower.style.opacity = '0.7';
      }
    });
  });
}

function initEntryScreen() {
  const entryScreen = document.getElementById('entryScreen');
  const enterBtn = document.getElementById('enterBtn');

  if (!entryScreen || !enterBtn) {
    return;
  }

  enterBtn.addEventListener('click', () => {
    animateTo(
      entryScreen,
      {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          entryScreen.classList.add('hidden');
        },
      },
      () => {
        entryScreen.style.opacity = '0';
        entryScreen.style.visibility = 'hidden';
      }
    );

    animateHero();
  });
}

function animateHero() {
  if (!hasGSAP || !hasScrollTrigger) {
    return;
  }

  const heroSection = document.getElementById('hero');

  if (!heroSection) {
    return;
  }

  window.gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  }).to(
    '.hero-grid',
    {
      opacity: 0.3,
      y: 100,
    },
    0
  );
}

function initScrollRevealAnimations() {
  if (!hasGSAP || !hasScrollTrigger) {
    return;
  }

  window.gsap.to('.about-header', {
    scrollTrigger: {
      trigger: '.about-header',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });

  window.gsap.utils.toArray('.about-text').forEach((element) => {
    window.gsap.to(element, {
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

  window.gsap.utils.toArray('.about-skills-preview').forEach((element) => {
    window.gsap.to(element, {
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

  window.gsap.to('.projects-header', {
    scrollTrigger: {
      trigger: '.projects-header',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });

  window.gsap.utils.toArray('.project-card').forEach((card, index) => {
    window.gsap.to(card, {
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

  window.gsap.to('.skills-header', {
    scrollTrigger: {
      trigger: '.skills-header',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  });

  window.gsap.utils.toArray('.skill-category').forEach((category, index) => {
    window.gsap.to(category, {
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

  window.gsap.to('.contact-content', {
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

  window.gsap.utils.toArray('.contact-link').forEach((link, index) => {
    window.gsap.to(link, {
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

  window.gsap.to('.footer', {
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

function initHoverEffects() {
  if (!hasGSAP) {
    return;
  }

  window.gsap.utils.toArray('.project-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      window.gsap.to(card, {
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      window.gsap.to(card, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  });
}

function initSmoothScroll() {
  if (!hasScrollTrigger) {
    return;
  }

  window.addEventListener('resize', () => {
    window.ScrollTrigger.refresh();
  });
}

function initParallaxEffects() {
  if (!hasGSAP || !hasScrollTrigger) {
    return;
  }

  window.gsap.to('.hero-grid', {
    y: 100,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    duration: 1,
  });
}

function setupTextAnimations() {
  if (!hasGSAP || !hasScrollTrigger) {
    return;
  }

  window.gsap.utils.toArray('.section-title').forEach((title) => {
    window.gsap.from(title, {
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

function initScrollProgress() {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

  window.addEventListener('scroll', () => {
    if (totalHeight <= 0) {
      return;
    }

    const scrolled = (window.scrollY / totalHeight) * 100;
    document.documentElement.style.setProperty('--scroll-progress', `${scrolled}`);
  });
}

function completeInit() {
  if (completeInitRan) {
    return;
  }

  completeInitRan = true;
  initScrollRevealAnimations();
  initParallaxEffects();
  setupTextAnimations();
  initHoverEffects();
  initSmoothScroll();
  initScrollProgress();

  if (hasScrollTrigger) {
    window.ScrollTrigger.refresh();
  }
}

function init() {
  initCustomCursor();
  initEntryScreen();
  initLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
