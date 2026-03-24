/* ============================================================
   PREMIUM INTERACTIVE PORTFOLIO - JAVASCRIPT
   Project Expansion + Smooth Scrolling + Interactions
   ============================================================ */

// ── LOADER ──
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 2500);
  }
});

// ── PROJECT EXPANSION ──
const projectItems = document.querySelectorAll('.project-item');
projectItems.forEach(item => {
  item.addEventListener('click', function(e) {
    // Don't toggle if clicked on a link
    if (e.target.tagName === 'A') return;
    
    // Close all other projects
    projectItems.forEach(otherItem => {
      if (otherItem !== this) {
        otherItem.classList.remove('expanded');
      }
    });
    
    // Toggle current project
    this.classList.toggle('expanded');
  });
});

// ── SMOOTH SCROLL NAVIGATION ──
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Scroll to section
      const offsetTop = targetSection.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ── ACTIVE NAV LINK ON SCROLL ──
window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

// ── BACK TO TOP BUTTON ──
const backToTopBtn = document.querySelector('.back-to-top');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scrollProgress');

if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
}

// ── FADE IN ON SCROLL ──
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all content elements for fade-in
document.querySelectorAll('.about-content, .project-item, .skill-group, .achievement').forEach(el => {
  observer.observe(el);
});

// ── CONTACT LINK HANDLERS ──
const contactLinks = document.querySelectorAll('.contact-link');

contactLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    
    if (href && (href.startsWith('http') || href.startsWith('mailto'))) {
      if (!href.startsWith('mailto')) {
        e.preventDefault();
        window.open(href, '_blank');
      }
    }
  });
});

// ── HERO CTA SCROLL ──
const heroCTA = document.querySelector('.hero-cta');

if (heroCTA) {
  heroCTA.addEventListener('click', function(e) {
    e.preventDefault();
    const workSection = document.querySelector('#work');
    if (workSection) {
      const offsetTop = workSection.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
}

// ── INITIAL ACTIVE LINK ──
window.addEventListener('DOMContentLoaded', () => {
  const aboutLink = document.querySelector('a[href="#about"]');
  if (aboutLink) {
    aboutLink.classList.add('active');
  }
});
