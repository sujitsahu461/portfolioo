// PORTFOLIO JAVASCRIPT

document.addEventListener('DOMContentLoaded', init);

function init() {
  setupNavigation();
  setupScrollProgress();
  setupProjectCards();
  setupSmoothScroll();
}

// ===== NAVIGATION =====
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

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

// ===== PROJECT CARDS MODAL =====
function setupProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.modal-close');

  const projectData = {
    1: {
      title: 'Real-Time Weather Dashboard',
      desc: 'Web-based weather application using HTML, CSS, JavaScript, and OpenWeather API to show real-time temperature, humidity, wind, visibility, rain chance, and AQI. Features include city search functionality, geolocation support, temperature unit toggle (°C/°F), and responsive, user-friendly interface with helpful tips.',
      tech: ['JavaScript', 'OpenWeather API', 'HTML5', 'CSS3', 'Geolocation API', 'Responsive Design'],
      github: 'https://github.com/sujitsahu461/weather-project'
    },
    2: {
      title: 'Bank Management System',
      desc: 'Comprehensive banking system with account management, transaction processing, and customer operations. Built with Java for robust backend processing and secure financial data handling. Demonstrates strong understanding of object-oriented design principles and banking domain logic.',
      tech: ['Java', 'OOP', 'Database Design', 'Backend Development', 'Transaction Management'],
      github: 'https://github.com/sujitsahu461/bank-management'
    },
    3: {
      title: 'Bandwidth-Agnostic PWA',
      desc: 'Lightweight Progressive Web App optimized for low-bandwidth environments at university. Provides portal access with minimal data usage and offline capabilities. Demonstrates expertise in performance optimization, service workers, and offline-first architecture for emerging markets.',
      tech: ['PWA', 'Service Workers', 'Offline-First', 'Data Compression', 'Progressive Enhancement'],
      github: 'https://github.com/sujitsahu461/bandwidth-agnostic-pwa'
    },
    4: {
      title: 'Hotel Management System',
      desc: 'Comprehensive hotel management platform with booking system, customer management, and administrative operations. Built with Java for enterprise-level performance, demonstrating ability to handle complex business logic and data relationships in real-world scenarios.',
      tech: ['Java', 'Database Design', 'Business Logic', 'System Architecture', 'Admin Operations'],
      github: 'https://github.com/sujitsahu461/hotelmanagement'
    },
    5: {
      title: 'Learning Management System (LMS)',
      desc: 'Educational platform for course management, student enrollment, and learning resource distribution. Designed with seamless user experience and accessibility focus. Demonstrates strong frontend skills and understanding of educational technology requirements.',
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Educational UX', 'Learning Platform'],
      github: 'https://github.com/sujitsahu461/LMSPROJECT'
    },
    6: {
      title: 'Finn-Track-Pro — Finance Tracker',
      desc: 'Production-grade full-stack personal finance tracker with expense management, income tracking, and budget analytics. Features a secure REST API backend, PostgreSQL database on Neon, deployed on Render with a Vercel-hosted frontend. Built with robust input validation and rate-limiting for enterprise-level reliability.',
      tech: ['JavaScript', 'Full-Stack', 'Finance', 'PostgreSQL', 'REST API'],
      github: 'https://github.com/sujitsahu461/Finn-Track-Pro'
    },
    7: {
      title: 'BullLens — Smart Stock Market Predictor',
      desc: 'AI-powered stock market predictor combining FastAPI backend, machine learning models, and real-time data from yfinance. Features stock price forecasting, volatility prediction, risk scoring, and a dynamic Single Page Application frontend. Integrates MySQL for persistent data and YOLOv8 vision capabilities for advanced analysis.',
      tech: ['Python', 'FastAPI', 'Machine Learning', 'MySQL', 'Real-time Data'],
      github: 'https://github.com/sujitsahu461/BULLLENS-SMART-STOCK-TRACKER'
    },
    8: {
      title: 'Superpower Hands',
      desc: 'A Python-based computer vision application leveraging MediaPipe for real-time hand tracking and gesture recognition. Designed with interactive hand pose detection, dynamic UI components, and optimized for local desktop execution.',
      tech: ['Python', 'Computer Vision', 'MediaPipe', 'Gesture Recognition', 'Hand Tracking'],
      github: 'https://github.com/sujitsahu461/superpower_hands'
    }
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project');
      const data = projectData[projectId];
      
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalDesc').textContent = data.desc;
      document.getElementById('modalGithub').setAttribute('href', data.github);
      
      const techHtml = data.tech.map(t => `<span>${t}</span>`).join('');
      document.getElementById('modalTech').innerHTML = techHtml;
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
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
