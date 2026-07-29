/**
 * =====================================================
 * PREMIUM SCROLL ANIMATIONS — Sujit Portfolio
 * =====================================================
 * Architecture: Lenis (smooth scroll) + GSAP ScrollTrigger
 * All animation logic is isolated here — no UI/layout changes.
 * Respects prefers-reduced-motion for accessibility.
 * =====================================================
 */

(function () {
  'use strict';

  // ===== REDUCED MOTION CHECK =====
  // If user prefers reduced motion, skip all animations entirely
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Ensure all elements are visible even without animations
    document.documentElement.classList.add('no-motion');
    return;
  }

  // Wait for all deferred scripts (GSAP, Lenis) to load
  window.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure GSAP and Lenis are available
    requestAnimationFrame(() => {
      if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
        console.warn('[Animations] GSAP or Lenis not loaded. Retrying...');
        setTimeout(initAll, 200);
        return;
      }
      initAll();
    });
  });

  function initAll() {
    if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      console.warn('[Animations] Libraries not available. Animations disabled.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initInteractiveBackground();
    initLenis();
    initNavbarScroll();
    initHeroAnimations();
    initSectionReveals();
    initCardStagger();
    initParallax();
    initImageReveal();
    initButtonEffects();
    initFooterReveal();
    initContactReveal();
    initQuoteReveal();
    initScrollProgress();

    // Refresh ScrollTrigger after all dynamic content is rendered
    // (certificates are rendered dynamically by script.js)
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  }

  // =====================================================
  // 1. LENIS SMOOTH SCROLLING
  // =====================================================
  let lenisInstance = null;

  function initLenis() {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Connect Lenis to GSAP ticker for synchronized updates
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Connect Lenis scroll to ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update);

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Handle anchor clicks — let Lenis handle smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          lenisInstance.scrollTo(target, { offset: 0 });
        }
      });
    });
  }

  // =====================================================
  // 2. NAVBAR HIDE/SHOW ON SCROLL
  // =====================================================
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = 0;
    const scrollThreshold = 80; // Only trigger after scrolling past hero top

    // Use ScrollTrigger for performance (runs on rAF)
    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const currentScrollY = self.scroll();
        const direction = self.direction; // 1 = down, -1 = up

        if (currentScrollY > scrollThreshold) {
          if (direction === 1 && currentScrollY > lastScrollY) {
            // Scrolling DOWN — hide navbar
            navbar.classList.add('navbar--hidden');
          } else if (direction === -1) {
            // Scrolling UP — show navbar
            navbar.classList.remove('navbar--hidden');
          }
        } else {
          // Near top — always show
          navbar.classList.remove('navbar--hidden');
        }

        lastScrollY = currentScrollY;
      }
    });
  }

  // =====================================================
  // 3. HERO ENTRANCE ANIMATIONS
  // =====================================================
  function initHeroAnimations() {
    const hero = document.querySelector('#hero');
    if (!hero) return;

    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
        duration: 0.9,
      }
    });

    // Greeting text
    tl.from('.greeting', {
      opacity: 0,
      y: 30,
      duration: 0.7,
    }, 0.1);

    // Massive title — line by line via children
    tl.from('.massive-title', {
      opacity: 0,
      y: 50,
      duration: 1,
    }, 0.25);

    // Hero description
    tl.from('.hero-desc', {
      opacity: 0,
      y: 30,
      duration: 0.8,
    }, 0.5);

    // Hero buttons — staggered
    tl.from('.hero-buttons .btn', {
      opacity: 0,
      y: 25,
      stagger: 0.12,
      duration: 0.7,
    }, 0.65);

    // Hero stats — staggered
    tl.from('.hero-stats .stat', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
    }, 0.8);

    // Hero image — scale reveal (fromTo ensures photo is always fully visible after animation)
    tl.fromTo('.cinematic-wrapper',
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
      0.3
    );

    // Background glow shapes
    tl.from('.hero-glow-sphere', {
      opacity: 0,
      scale: 0.6,
      stagger: 0.15,
      duration: 1.5,
      ease: 'power2.out',
    }, 0);
  }

  // =====================================================
  // 4. SECTION REVEALS (titles, text, highlight items)
  // =====================================================
  function initSectionReveals() {
    // Section title wraps
    gsap.utils.toArray('.section-title-wrap').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    // About text paragraphs — staggered
    const aboutTexts = gsap.utils.toArray('.about-text p');
    if (aboutTexts.length) {
      gsap.from(aboutTexts, {
        scrollTrigger: {
          trigger: '.about-text',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 35,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Highlight items — staggered
    const highlightItems = gsap.utils.toArray('.highlight-item');
    if (highlightItems.length) {
      gsap.from(highlightItems, {
        scrollTrigger: {
          trigger: '.about-highlights',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 35,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    // Timeline items — staggered
    const timelineItems = gsap.utils.toArray('.timeline-item');
    if (timelineItems.length) {
      gsap.from(timelineItems, {
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Experience cards — staggered reveal
    const expCards = gsap.utils.toArray('.experience-card');
    if (expCards.length) {
      gsap.fromTo(expCards, 
        { opacity: 0, y: 35 },
        {
          scrollTrigger: {
            trigger: '.experience-grid',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        }
      );
    }
  }

  // =====================================================
  // 5. CARD STAGGER (skills, projects, certificates)
  // =====================================================
  function initCardStagger() {
    // Skill cards
    const skillCards = gsap.utils.toArray('.skill-card');
    if (skillCards.length) {
      gsap.from(skillCards, {
        scrollTrigger: {
          trigger: '.skills-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 45,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    // Project cards
    const projectCards = gsap.utils.toArray('.project-card');
    if (projectCards.length) {
      gsap.from(projectCards, {
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    // Certificate cards (dynamically rendered — use MutationObserver fallback)
    initCertCardAnimations();
  }

  /**
   * Certificate cards are rendered dynamically by script.js.
   * We observe the container and trigger animations once cards appear.
   */
  function initCertCardAnimations() {
    const certsContainer = document.getElementById('certsGridPage');
    if (!certsContainer) return;

    const animateCertCards = () => {
      const certCards = gsap.utils.toArray('.cert-card-page');
      if (!certCards.length) return;

      gsap.from(certCards, {
        scrollTrigger: {
          trigger: certsContainer,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 45,
        stagger: 0.06,
        duration: 0.7,
        ease: 'power3.out',
      });
    };

    // If cards already exist, animate now
    if (certsContainer.children.length > 0) {
      animateCertCards();
      return;
    }

    // Otherwise, observe for dynamic rendering
    const observer = new MutationObserver((mutations, obs) => {
      if (certsContainer.children.length > 0) {
        obs.disconnect();
        animateCertCards();
        ScrollTrigger.refresh();
      }
    });
    observer.observe(certsContainer, { childList: true });
  }

  // =====================================================
  // 6. PARALLAX EFFECTS (subtle)
  // =====================================================
  function initParallax() {
    // Hero glow spheres — subtle vertical parallax
    gsap.utils.toArray('.hero-glow-sphere').forEach((sphere, i) => {
      gsap.to(sphere, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
        y: i === 0 ? -80 : -60,
        ease: 'none',
      });
    });

    // Avatar wrapper shapes — parallax drift
    gsap.utils.toArray('.avatar-wrapper .shape').forEach((shape, i) => {
      gsap.to(shape, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
        },
        y: i === 0 ? -50 : -35,
        ease: 'none',
      });
    });

    // Watermark text — subtle parallax
    gsap.utils.toArray('.watermark').forEach(wm => {
      gsap.to(wm, {
        scrollTrigger: {
          trigger: wm,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
        y: -30,
        ease: 'none',
      });
    });
  }

  // =====================================================
  // 7. HERO IMAGE REVEAL
  // =====================================================
  function initImageReveal() {
    const heroImg = document.querySelector('.cinematic-centerpiece');
    if (!heroImg) return;

    // Subtle parallax on the hero image as user scrolls past
    gsap.to(heroImg, {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
      y: -20,
      scale: 0.98,
      ease: 'none',
    });
  }

  // =====================================================
  // 8. BUTTON EFFECTS (magnetic + micro-animations)
  // =====================================================
  function initButtonEffects() {
    // Magnetic effect on hero CTA buttons only
    const magneticBtns = document.querySelectorAll('.hero-buttons .btn');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) return; // Skip magnetic on touch devices

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 0.25; // Subtle pull

        gsap.to(btn, {
          x: x * strength,
          y: y * strength,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    });
  }

  // =====================================================
  // 9. CUSTOM CURSOR (desktop only)
  // =====================================================
  function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const ring = document.querySelector('.custom-cursor-ring');
    if (!cursor || !ring) return;

    // Hide on touch/mobile devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice || isCoarsePointer) {
      cursor.style.display = 'none';
      ring.style.display = 'none';
      return;
    }

    // Show custom cursor, hide default
    document.documentElement.classList.add('has-custom-cursor');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      gsap.set(cursor, { x: mouseX, y: mouseY });
    });

    // Ring follows with smooth lag
    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      gsap.set(ring, { x: ringX, y: ringY });
    });

    // Expand ring on hover over interactive elements
    const interactives = document.querySelectorAll(
      'a, button, .project-card, .skill-card, .cert-card-page, .highlight-item, .btn, .nav-link, .btn-theme, .btn-3dot'
    );

    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--active');
        ring.classList.add('ring--active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--active');
        ring.classList.remove('ring--active');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }

  // =====================================================
  // 10. FOOTER REVEAL
  // =====================================================
  function initFooterReveal() {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;

    gsap.from(footer, {
      scrollTrigger: {
        trigger: footer,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    });
  }

  // =====================================================
  // 11. CONTACT SECTION REVEAL
  // =====================================================
  function initContactReveal() {
    const contactSection = document.querySelector('#contact');
    if (!contactSection) return;

    // Contact subtitle
    const subtitle = contactSection.querySelector('.contact-subtitle');
    if (subtitle) {
      gsap.from(subtitle, {
        scrollTrigger: {
          trigger: subtitle,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    // Massive email
    const email = contactSection.querySelector('.massive-email');
    if (email) {
      gsap.from(email, {
        scrollTrigger: {
          trigger: email,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.9,
        ease: 'power3.out',
      });
    }

    // Social links — staggered
    const socialLinks = gsap.utils.toArray('.social-links-large a');
    if (socialLinks.length) {
      gsap.from(socialLinks, {
        scrollTrigger: {
          trigger: '.social-links-large',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 25,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      });
    }
  }

  // =====================================================
  // 12. QUOTE SECTION REVEAL
  // =====================================================
  function initQuoteReveal() {
    const quoteCard = document.querySelector('.quote-card');
    if (!quoteCard) return;

    gsap.from(quoteCard, {
      scrollTrigger: {
        trigger: quoteCard,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 35,
      scale: 0.98,
      duration: 0.9,
      ease: 'power3.out',
    });
  }

  // =====================================================
  // 13. ENHANCED SCROLL PROGRESS (GSAP-driven)
  // =====================================================
  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    // GSAP-driven scroll progress for smoother visual updates
    gsap.to(progressBar, {
      scrollTrigger: {
        start: 'top top',
        end: 'max',
        scrub: 0.3,
      },
      width: '100%',
      ease: 'none',
    });
  }

  // =====================================================
  // 14. INTERACTIVE BACKGROUND (Constellation Tech Web)
  // =====================================================
  // Full-viewport interactive geometric constellation & grid mesh.
  // Responds to mouse position with magnetic forces, glowing web lines,
  // and theme-tailored colors for Dark & Light modes. No bubbles.
  function initInteractiveBackground() {
    if (window.innerWidth < 480) return;

    // Create canvas dynamically
    const canvas = document.createElement('canvas');
    canvas.id = 'interactiveBg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    // Hide old framer-scroll-scene (orbs/bubbles)
    const oldScene = document.querySelector('.framer-scroll-scene');
    if (oldScene) oldScene.style.display = 'none';

    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let mx = -9999, my = -9999;

    const isMobile = window.innerWidth < 768;
    const NUM_PARTICLES = isMobile ? 60 : 110;
    const LINK_DIST = isMobile ? 120 : 160;
    const MOUSE_RAD = isMobile ? 160 : 230;

    let particles = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1.2;
        this.baseAlpha = Math.random() * 0.45 + 0.25;
        this.colorType = Math.random() > 0.35 ? 'cyan' : 'magenta';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off screen boundaries
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Mouse displacement physics
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MOUSE_RAD && dist > 1) {
          const force = (1 - dist / MOUSE_RAD) * 3.5;
          this.x -= (dx / dist) * force;
          this.y -= (dy / dist) * force;
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: NUM_PARTICLES }, () => new Particle());
    }

    // Mouse and Touch listener
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });
    document.addEventListener('touchmove', e => {
      if (e.touches[0]) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }
    }, { passive: true });
    document.addEventListener('touchend', () => { mx = -9999; my = -9999; }, { passive: true });

    function isDark() {
      return document.documentElement.getAttribute('data-theme') !== 'light';
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const dark = isDark();

      // Theme-tailored color definitions (boosted Light Mode contrast)
      const cyanStroke = dark ? '0, 240, 255' : '14, 116, 144';
      const pinkStroke = dark ? '200, 0, 255' : '124, 58, 237';
      const cursorGlowColor = dark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(14, 116, 144, 0.15)';

      // 1. Draw subtle mouse aura glow
      if (mx > -5000) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RAD * 1.3);
        grad.addColorStop(0, cursorGlowColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mx, my, MOUSE_RAD * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Update & Draw Particles & Inter-particle Constellation Lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();

        // Connect particles to each other
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * (dark ? 0.35 : 0.42);
            const strokeColor = p.colorType === 'cyan' ? cyanStroke : pinkStroke;
            ctx.strokeStyle = `rgba(${strokeColor}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = dark ? 1.0 : 1.4;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect particles directly to the mouse cursor when nearby
        if (mx > -5000) {
          const mdx = mx - p.x;
          const mdy = my - p.y;
          const mdist = Math.hypot(mdx, mdy);

          if (mdist < MOUSE_RAD) {
            const mAlpha = (1 - mdist / MOUSE_RAD) * (dark ? 0.7 : 0.75);
            ctx.strokeStyle = `rgba(${cyanStroke}, ${mAlpha.toFixed(3)})`;
            ctx.lineWidth = dark ? 1.6 : 2.0;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }

        // Draw individual particle node
        const pAlpha = p.baseAlpha * (dark ? 1 : 1.3);
        ctx.fillStyle = p.colorType === 'cyan'
          ? `rgba(${cyanStroke}, ${pAlpha.toFixed(3)})`
          : `rgba(${pinkStroke}, ${pAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dark ? p.radius : p.radius * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    requestAnimationFrame(draw);
  }

})();
