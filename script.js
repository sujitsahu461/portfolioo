// Premium Portfolio - Main JavaScript
// Features: Smooth animations, scroll effects, form handling, UI interactions

document.addEventListener('DOMContentLoaded', () => {
  initializePortfolio();
});

function initializePortfolio() {
  hideLoader();
  setupScrollProgressBar();
  setupNavigation();
  setupBackToTopButton();
  setupFormHandling();
  setupScrollAnimations();
  setupIntersectionObserver();
}

// Hide loader after page loads
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1000);
  }
}

// Scroll progress bar
function setupScrollProgressBar() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrollProgress + '%';
  });
}

// Navigation active link highlighting
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollY >= sectionTop - 200) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === currentSection) {
        link.classList.add('active');
      }
    });
  });
}

// Back to top button
function setupBackToTopButton() {
  const backToTopBtn = document.getElementById('backToTop');
  
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
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

// Form handling
function setupFormHandling() {
  const form = document.getElementById('contactForm');
  
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const messageInput = form.querySelector('textarea');
    
    const data = {
      name: nameInput.value,
      email: emailInput.value,
      message: messageInput.value
    };

    // Validate form
    if (!data.name || !data.email || !data.message) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    // Show success message
    showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
    
    // Reset form
    form.reset();
  });
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#00d9ff' : '#ff6b6b'};
    color: #0a0e27;
    border-radius: 8px;
    font-weight: 600;
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 0.8s ease-out forwards`;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.about, .projects, .skills, .experience, .contact').forEach(el => {
    observer.observe(el);
  });
}

// Intersection Observer for animations
function setupIntersectionObserver() {
  const options = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, options);

  document.querySelectorAll('.project-card, .stat-card, .skill-badge, .timeline-item').forEach(el => {
    observer.observe(el);
  });
}

// Smooth scroll on navigation click
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .nav-link.active {
    color: var(--accent-primary);
  }

  .nav-link.active::after {
    width: 100%;
  }

  .visible {
    animation: fadeInUp 0.8s ease-out forwards !important;
  }

  .project-card, .stat-card, .skill-badge, .timeline-item {
    opacity: 0;
    transform: translateY(20px);
  }

  .project-card.visible, .stat-card.visible, .skill-badge.visible, .timeline-item.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

// Initialize on page load
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

console.log('Portfolio initialized successfully! ✨');
