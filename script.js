// PREMIUM PORTFOLIO - FULL FEATURED JAVASCRIPT

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupLoader();
  setupThemeToggle();
  setupNavigation();
  setupScrollProgress();
  setupBackToTop();
  setupProjectCards();
  setupSkillAnimations();
  setupSmoothScroll();
  setupIntersectionObserver();
}

// ===== LOADER =====
function setupLoader() {
  window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1500);
  });
}

// ===== THEME TOGGLE =====
function setupThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    toggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    toggle.innerHTML = newTheme === 'light' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
  });
}

// ===== NAVIGATION =====
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Smooth scroll on click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offset = 80;
        const top = targetSection.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Update active link on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
}

// ===== SCROLL PROGRESS =====
function setupScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// ===== BACK TO TOP =====
function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== PROJECT CARDS MODAL =====
function setupProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.modal-close');

  const projectData = {
    1: {
      title: 'Weather App',
      desc: 'Web-based weather application with real-time temperature, humidity, wind, visibility, rain chance, and AQI data. Features city search, geolocation support, °C/°F toggle, and responsive design.',
      tech: ['JavaScript', 'OpenWeather API', 'HTML5', 'CSS3', 'Geolocation'],
      users: '500+',
      status: 'Active'
    },
    2: {
      title: 'Bank Management System',
      desc: 'Full-featured banking system with account management, transaction processing, and customer operations. Built with Java for robust backend processing and data security.',
      tech: ['Java', 'Database', 'OOP', 'Backend Development'],
      users: 'Educational',
      status: 'Active'
    },
    3: {
      title: 'Bandwidth-Agnostic PWA',
      desc: 'Lightweight Progressive Web App optimized for low-bandwidth university environments. Provides portal access with minimal data usage and offline capabilities.',
      tech: ['PWA', 'Service Workers', 'Offline First', 'Low Bandwidth Optimization'],
      users: 'University',
      status: 'Active'
    },
    4: {
      title: 'Hotel Management System',
      desc: 'Comprehensive hotel management platform with booking system, customer management, and administrative operations. Built with Java for enterprise-level performance.',
      tech: ['Java', 'Database Management', 'Swing/AWT', 'System Design'],
      users: 'Educational',
      status: 'Active'
    },
    5: {
      title: 'Learning Management System',
      desc: 'Educational platform for course management, student enrollment, and learning resource distribution. Designed with focus on user experience and accessibility.',
      tech: ['HTML5', 'CSS3', 'Responsive Design', 'Educational Tech'],
      users: 'Educational',
      status: 'Active'
    }
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project');
      const data = projectData[projectId];
      
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalDesc').textContent = data.desc;
      document.getElementById('modalUsers').textContent = data.users;
      document.getElementById('modalStatus').textContent = data.status;
      
      const techHtml = data.tech.map(t => `<span>${t}</span>`).join('');
      document.getElementById('modalTech').innerHTML = techHtml;
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
}

// ===== SKILL ANIMATIONS =====
function setupSkillAnimations() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillProgress = entry.target.querySelector('.skill-progress');
        if (skillProgress && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
          const width = skillProgress.style.width;
          skillProgress.style.width = '0';
          setTimeout(() => {
            skillProgress.style.width = width;
          }, 100);
        }
      }
    });
  }, { threshold: 0.5 });

  skillItems.forEach(item => observer.observe(item));
}

// ===== SMOOTH SCROLL =====
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if(target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ===== INTERSECTION OBSERVER =====
function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.about, .project-card, .highlight-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ===== ADVANCED: TILT EFFECT ON PROJECT CARDS =====
function setupCardTilt() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
}

// Call tilt setup after init
setTimeout(setupCardTilt, 500);

// ===== CONSOLE MESSAGE =====
console.log('%c💻 Premium Portfolio Loaded', 'color: #00d9ff; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with passion by Sujit Sahu', 'color: #00d9ff; font-size: 12px;');
