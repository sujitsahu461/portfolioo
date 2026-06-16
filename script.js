// PORTFOLIO JAVASCRIPT

document.addEventListener('DOMContentLoaded', init);

function init() {
  setupNavigation();
  setupScrollProgress();
  setupProjectCards();
  setupSmoothScroll();
  setupAnalyticsTracking();
  setupThemeToggle();
  setupDropdown3Dot();
  setupRandomQuotes();
  setupLegalModal();
  setupCertificates();
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
    },
    9: {
      title: 'IPL Analytics — Crunch-26',
      desc: 'A comprehensive Python-based IPL data analytics project. Refactored from a monolithic notebook into a modular Python package to optimize data processing with Pandas and generate professional-grade visualizations.',
      tech: ['Python', 'Pandas', 'Data Analysis', 'Visualization', 'Modular Package'],
      github: 'https://github.com/sujitsahu461/IPL-CRUNCH-26'
    },
    10: {
      title: 'VoteWise',
      desc: 'A modern voting and polling application system built with a focus on robust functionality, smooth user experience, and secure operations. Designed with a clean frontend to interface with a development server.',
      tech: ['HTML', 'Web App', 'UI/UX', 'Frontend'],
      github: 'https://github.com/sujitsahu461/votewise'
    }
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project');
      const data = projectData[projectId];
      
      // Google Analytics Track Project View
      if (typeof gtag === 'function') {
        gtag('event', 'project_view', {
          'event_category': 'Engagement',
          'event_label': data.title
        });
      }
      
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

// ===== GOOGLE ANALYTICS CUSTOM TRACKING =====
function setupAnalyticsTracking() {
  const track = (name, category, label) => {
    if (typeof gtag === 'function') {
      gtag('event', name, {
        'event_category': category,
        'event_label': label
      });
    }
  };

  // Track Navigation Link Clicks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      track('navigation_click', 'Navigation', this.textContent.trim());
    });
  });

  // Track Resume Downloads
  const resumeBtn = document.querySelector('a[href*="Resume.pdf"]');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      track('resume_download', 'Engagement', 'Sujit Sahu Resume PDF');
    });
  }

  // Track Hero CTA clicks
  const heroWorkBtn = document.querySelector('.futuristic-hero a[href="#work"]');
  if (heroWorkBtn) {
    heroWorkBtn.addEventListener('click', () => {
      track('hero_cta_click', 'Engagement', 'View Deployed Work Button');
    });
  }

  // Track Social Links
  document.querySelectorAll('.social-links-large a, .site-footer a').forEach(link => {
    link.addEventListener('click', function() {
      track('social_click', 'Outbound Links', this.textContent.trim() || this.href);
    });
  });

  // Track Email Link
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    emailLink.addEventListener('click', function() {
      track('contact_click', 'Engagement', 'Email Link');
    });
  }

  // Track Modal Outbound GitHub click
  const modalGithub = document.getElementById('modalGithub');
  if (modalGithub) {
    modalGithub.addEventListener('click', function() {
      const title = document.getElementById('modalTitle').textContent;
      track('repo_click', 'Outbound Links', `GitHub: ${title}`);
    });
  }
}

// ===== THEME TOGGLE =====
function setupThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleBtn) return;
  const themeIcon = themeToggleBtn.querySelector('.theme-icon');

  // Check persisted preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);

    // Track Theme Change in Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'theme_change', {
        'event_category': 'Preference',
        'event_label': newTheme
      });
    }
  });

  function updateThemeUI(theme) {
    if (theme === 'light') {
      themeIcon.className = 'fas fa-sun theme-icon';
    } else {
      themeIcon.className = 'fas fa-moon theme-icon';
    }
  }
}

// ===== 3-DOT OPTIONS DROPDOWN =====
function setupDropdown3Dot() {
  const btn3Dot = document.getElementById('btn3Dot');
  const dropdownMenu = document.getElementById('dropdownMenu3Dot');
  if (!btn3Dot || !dropdownMenu) return;
  const hasSubmenus = document.querySelectorAll('.has-submenu');

  // Toggle Dropdown Menu
  btn3Dot.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = btn3Dot.getAttribute('aria-expanded') === 'true';
    btn3Dot.setAttribute('aria-expanded', !isExpanded);
    dropdownMenu.classList.toggle('show');
  });

  // Close Dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== btn3Dot) {
      dropdownMenu.classList.remove('show');
      btn3Dot.setAttribute('aria-expanded', 'false');
      // Reset submenus open state
      hasSubmenus.forEach(sub => sub.classList.remove('open'));
    }
  });

  // Handle mobile submenus toggle
  hasSubmenus.forEach(submenu => {
    const label = submenu.querySelector('.dropdown-label');
    if (!label) return;
    
    label.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        e.preventDefault();
        
        // Toggle current submenu
        const isOpen = submenu.classList.contains('open');
        
        // Close other submenus first
        hasSubmenus.forEach(sub => {
          if (sub !== submenu) sub.classList.remove('open');
        });

        if (isOpen) {
          submenu.classList.remove('open');
        } else {
          submenu.classList.add('open');
        }
      }
    });

    // Support keyboard navigation (Enter key on focus)
    submenu.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          label.click();
        }
      }
    });
  });

  // Close dropdown menu when clicking any submenu item link or normal link
  dropdownMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
      btn3Dot.setAttribute('aria-expanded', 'false');
      hasSubmenus.forEach(sub => sub.classList.remove('open'));
    });
  });
}

// ===== DYNAMIC QUOTES =====
function setupRandomQuotes() {
  const quotes = [
    {
      text: "The search for truth is more precious than its possession.",
      author: "Albert Einstein"
    },
    {
      text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
      author: "Mahatma Gandhi"
    },
    {
      text: "The only true wisdom is in knowing you know nothing.",
      author: "Socrates"
    },
    {
      text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
      author: "Brian Herbert"
    },
    {
      text: "If I have seen further it is by standing on the shoulders of Giants.",
      author: "Isaac Newton"
    },
    {
      text: "Continuous learning is the minimum requirement for success in any field.",
      author: "Brian Tracy"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "It is not that I'm so smart. But I stay with the questions much longer.",
      author: "Albert Einstein"
    },
    {
      text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
      author: "Benjamin Franklin"
    },
    {
      text: "The beautiful thing about learning is that nobody can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "An investment in knowledge pays the best interest.",
      author: "Benjamin Franklin"
    },
    {
      text: "Knowing is not enough; we must apply. Willing is not enough; we must do.",
      author: "Johann Wolfgang von Goethe"
    },
    {
      text: "I have no special talent. I am only passionately curious.",
      author: "Albert Einstein"
    },
    {
      text: "The digital frontier is ours to secure and build.",
      author: "Sujit Kumar Sahu"
    }
  ];

  const dynamicQuote = document.getElementById('dynamicQuote');
  const quoteAuthor = document.getElementById('quoteAuthor');

  if (dynamicQuote && quoteAuthor) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];

    dynamicQuote.textContent = `"${selectedQuote.text}"`;
    quoteAuthor.textContent = `— ${selectedQuote.author}`;
  }
}

// ===== LEGAL MODAL =====
function setupLegalModal() {
  const legalModal = document.getElementById('legalModal');
  const closeBtn = document.getElementById('legalModalClose');
  const modalTitle = document.getElementById('legalModalTitle');
  const modalBody = document.getElementById('legalModalBody');
  const footerLinks = document.querySelectorAll('.footer-link');

  if (!legalModal) return;

  const legalContent = {
    disclaimer: {
      title: "Disclaimer",
      content: `
        <p class="legal-meta"><strong>Last Updated: June 16, 2026</strong></p>
        <p>This Disclaimer ("Disclaimer") forms a legal agreement between you ("User", "visitor") and Sujit Kumar Sahu ("Developer", "I", "me", "my"). By accessing, browsing, or interacting with this portfolio website (the "Site"), you acknowledge and agree to be bound by the terms and disclosures outlined below. If you do not agree, please discontinue use of this Site immediately.</p>
        
        <h4>1. No Warranties & Representation</h4>
        <p>The information, code repositories, demonstrations, and assets on this Site are provided on an "as is" and "as available" basis. I make no representations or warranties of any kind, express or implied, regarding the completeness, accuracy, reliability, safety, suitability, or availability of the Site's contents. Any reliance you place on such information is strictly at your own risk.</p>
        
        <h4>2. Academic & Portfolio Purpose</h4>
        <p>This Site is designed and maintained as a professional portfolio to highlight my academic coursework as a Computer Science & Engineering (CSE) student at GIET University, Gunupur, Odisha, along with my independent software engineering and cybersecurity studies. The metrics, deployment status, or functional execution of projects showcased herein are demonstration snapshots from localized or sandbox environments and do not guarantee production performance or equivalent results in corporate scenarios.</p>
        
        <h4>3. Cybersecurity & Ethical Hacking Notice</h4>
        <p>Certain sections of this portfolio highlight skills, write-ups, vulnerability scans, network architecture configs, or code utilities related to cybersecurity, ethical hacking, and network defense. These references are provided exclusively for educational research, defensive security engineering, and authorized penetration testing study. 
        <br><strong style="color: var(--accent-red);">WARNING:</strong> I explicitly prohibit the use of any information, logic, or script provided on this Site for malicious actions, unauthorized access, or illegal exploitation. I disclaim any and all liability for damages, system compromise, data loss, or legal consequences arising from the misuse of these resources by third parties.</p>
        
        <h4>4. Third-Party Websites & Services</h4>
        <p>This Site contains outbound links to external social media platforms (GitHub, LinkedIn, Instagram), professional credential authorities (Cisco Networking Academy, HP LIFE, Coding Ninjas, EduSkills Foundation), and other hosting services. These links are provided solely for convenience and reference. I do not monitor, endorse, control, or verify the content, safety, or privacy practices of these external platforms, and I assume no responsibility or liability for their terms or actions.</p>
        
        <h4>5. Limitation of Liability</h4>
        <p>To the maximum extent permitted by applicable law, in no event shall Sujit Kumar Sahu be liable for any direct, indirect, incidental, special, consequential, or punitive damages (including, but not limited to, loss of data, profits, system downtime, or business interruption) arising out of or in connection with your access, use, or inability to use this Site or any code, tools, or resources showcased herein.</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      content: `
        <p class="legal-meta"><strong>Last Updated: June 16, 2026</strong></p>
        <p>Your privacy is highly respected. This Privacy Policy outlines my commitment to data protection and details the minimal data-handling practices of this portfolio website (the "Site").</p>
        
        <h4>1. Personal Information Collection</h4>
        <p>This Site is a static landing page built strictly for showcasing professional capabilities. We do not maintain any backend registration database, newsletter sign-up sheets, or interactive forms that capture your personal identifying details (PII) such as your name, phone number, physical address, or credentials.
        <br>If you choose to contact me via the email link provided (<a href="mailto:smartsujit7334@gmail.com" class="legal-email">smartsujit7334@gmail.com</a>), the information you provide (name, email address, message body) will be used solely to communicate with you regarding your inquiry. This data is never rented, sold, or shared with third parties.</p>
        
        <h4>2. Persistent User Preferences (Local Storage)</h4>
        <p>To deliver a consistent interface experience, this Site uses browser Local Storage (<code>localStorage</code>) to save and persist your color theme selection (dark mode vs. light mode). This configuration is stored locally on your physical device, is not transmitted to our servers or third-party databases, and can be cleared at any time by clearing your browser's site settings or cache.</p>
        
        <h4>3. Analytics & Telemetry Disclosures</h4>
        <p>This Site utilizes Google Analytics (<code>gtag.js</code>) to gather high-level, non-personally identifiable telemetry to evaluate traffic flow and optimize our layout. This tool records anonymous technical data such as browser type, operating system, approximate geographic location, referral source, page views, and session duration. Google Analytics may drop standard telemetry cookies in your browser. You can block or clear these tracking cookies at any time via your browser's cookie settings.</p>
        
        <h4>4. Hosting Provider Logs</h4>
        <p>Our static files are hosted and deployed via modern cloud architecture (e.g., Vercel / GitHub). The hosting providers automatically log standard request headers (such as IP address, browser user-agent, and timestamp) to identify security threats, mitigate DDoS attacks, and verify server health. These logs are maintained and secured directly by the hosting platform in compliance with global security regulations.</p>
        
        <h4>5. Compliance with Global Frameworks (GDPR & CCPA)</h4>
        <p>Even though this Site is a personal portfolio, I strive to align with global privacy rules. You have the right to request access to, correction of, or permanent deletion of any email correspondence you send to me. For any data protection requests, please contact me directly at <a href="mailto:smartsujit7334@gmail.com" class="legal-email">smartsujit7334@gmail.com</a>.</p>
      `
    },
    terms: {
      title: "Terms & Conditions",
      content: `
        <p class="legal-meta"><strong>Last Updated: June 16, 2026</strong></p>
        <p>Welcome to the portfolio website of Sujit Kumar Sahu. By accessing or continuing to browse this website, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions ("Terms"). If you do not agree to all provisions, please exit the Site.</p>
        
        <h4>1. Intellectual Property & License</h4>
        <p>All design assets, interface layouts, customized CSS stylesheet rules, brand configurations, scripts, and the dynamic logo representation (<code>&lt;Sujit /&gt;</code>) are the exclusive intellectual property of Sujit Kumar Sahu, unless otherwise stated. 
        <br>Code samples, repositories, and projects referenced on this Site and hosted on GitHub are governed by their respective open-source licenses (e.g., MIT, Apache 2.0). Any cloning, modification, or distribution of those repositories must adhere to the terms specified within those individual license files.</p>
        
        <h4>2. Permitted Use & Code of Conduct</h4>
        <p>You are granted a limited, non-exclusive, revocable license to access and navigate this Site for educational study and professional recruiting evaluations. 
        <br>As a strict condition of access, you agree not to:
        <br>&bull; Engage in any actions that disrupt, damage, or overload the Site infrastructure, including denial-of-service (DDoS) attempts.
        <br>&bull; Perform vulnerability scanning, port scanning, or system footprinting on the Site's hosting servers without prior written authorization.
        <br>&bull; Use web scrapers, spiders, or automated scripts to harvest content from this Site for commercial reproduction.
        <br>&bull; Replicate the unique layout, styling, and design system of this portfolio to publish a derivative site under your own name or brand.</p>
        
        <h4>3. Disclaimer of Liability & Indemnity</h4>
        <p>The Site owner shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of, or inability to use, this Site, its features, or resources. You agree to defend, indemnify, and hold harmless Sujit Kumar Sahu from any claims, losses, liability, costs, or expenses (including legal fees) arising from your breach of these Terms or unauthorized use of Site assets.</p>
        
        <h4>4. Governing Law & Jurisdiction</h4>
        <p>These Terms, and any dispute or claim arising out of or in connection with them or their subject matter, shall be governed by, interpreted, and enforced in accordance with the laws of India. Any legal action or proceeding arising from this Site shall be subject to the exclusive jurisdiction of the competent courts located in Odisha, India.</p>
        
        <h4>5. Severability & Updates</h4>
        <p>If any clause of these Terms is deemed invalid or unenforceable under applicable local laws, that clause shall be severed, and it will not affect the validity, legality, or enforceability of the remaining provisions. We reserve the right to modify these Terms at any time without prior notice.</p>
      `
    }
  };

  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const docType = link.getAttribute('data-doc');
      const data = legalContent[docType];

      if (data) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        
        legalModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Track Legal Document View
        if (typeof gtag === 'function') {
          gtag('event', 'view_legal_document', {
            'event_category': 'Engagement',
            'event_label': data.title
          });
        }
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      legalModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    });
  }

  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) {
      legalModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
}

// ===== CERTIFICATES SECTION =====
function setupCertificates() {
  const certsGridPage = document.getElementById('certsGridPage');
  const certsToggleBtn = document.getElementById('certsToggleBtn');

  const certificates = [
    {
      title: "Cisco Cybersecurity Certification",
      issuer: "Cisco Networking Academy",
      desc: "Validated expertise in threat defense, network security protocols, vulnerability scanning, and cybersecurity operations.",
      skills: ["Network Security", "Threat Detection", "Cisco Academy", "Endpoint Defense"],
      icon: "fas fa-shield-halved"
    },
    {
      title: "Python Full Stack Development Virtual Internship",
      issuer: "EduSkills Foundation",
      desc: "Completed a comprehensive 10-week development and coding program constructing full-stack applications using Python, SQL, and modern web frameworks.",
      skills: ["Python", "Full-Stack Dev", "SQL Databases", "MVC Architecture"],
      icon: "fab fa-python"
    },
    {
      title: "Cybersecurity Virtual Internship Certificate",
      issuer: "PrepRight (Remote)",
      desc: "Gained remote hands-on experience identifying weak authentication controls, performing vulnerability assessments, and suggesting system remediations.",
      skills: ["Vulnerability Assessment", "OWASP Top 10", "Ethical Hacking", "Remediation"],
      icon: "fas fa-user-secret"
    },
    {
      title: "AI & Python Developer Training",
      issuer: "Central Tool Room & Training Centre (MSME), Govt. of India",
      desc: "Completed industrial internship developing data analysis scripts in Python, logic building algorithms, and applying fundamental Machine Learning models.",
      skills: ["Machine Learning", "Data Processing", "Algorithm Logic", "Python Programming"],
      icon: "fas fa-brain"
    },
    {
      title: "HP LIFE – Cybersecurity Awareness",
      issuer: "HP LIFE / Hewlett Packard",
      desc: "Completed certification focusing on online digital safety, phishing threat detection, credentials management, and organizational security.",
      skills: ["Cyber Hygiene", "Security Compliance", "Threat Prevention", "Credential Safety"],
      icon: "fas fa-lock"
    },
    {
      title: "ChatGPT Bootcamp",
      issuer: "Let's Upgrade",
      desc: "Comprehensive bootcamp training in prompt engineering, generative AI API integration, and leveraging LLMs to speed up developer workflows.",
      skills: ["Generative AI", "Prompt Engineering", "API Integration", "Automated Workflows"],
      icon: "fas fa-robot"
    },
    {
      title: "Data Structures & Algorithms Coursework",
      issuer: "GIET University (CSE)",
      desc: "Successfully verified academic coursework covering algorithm analysis, graph algorithms, hash mappings, dynamic programming, and complexity logic.",
      skills: ["DSA", "Complexity (Big O)", "Graph Theory", "Logic Building"],
      icon: "fas fa-code"
    },
    {
      title: "Computer Networks Academic Validation",
      issuer: "GIET University (CSE)",
      desc: "Academic verification of coursework detailing network security routing architectures, TCP/IP stack protocols, network subnetting, and socket interfaces.",
      skills: ["TCP/IP Protocols", "Network Routing", "Subnetting", "Socket Programming"],
      icon: "fas fa-network-wired"
    },
    {
      title: "Database Management Systems (DBMS)",
      issuer: "GIET University (CSE)",
      desc: "Academic verification of relational database architecture, comprehensive SQL querying, schema optimization, and transaction ACID properties.",
      skills: ["SQL", "Relational Databases", "ACID Transactions", "Database Design"],
      icon: "fas fa-database"
    },
    {
      title: "21-Day Ninja Slayground Challenge",
      issuer: "Coding Ninjas",
      desc: "Recognized technical achievement for resolving complex algorithm and logic challenges consecutively over 21 days.",
      skills: ["Problem Solving", "Competitive Programming", "Logic Optimization", "Data Structures"],
      icon: "fas fa-trophy"
    }
  ];

  // Render cards to the main portfolio page section
  if (certsGridPage) {
    certsGridPage.innerHTML = certificates.map(cert => `
      <div class="cert-card-page">
        <div>
          <i class="${cert.icon} cert-icon"></i>
          <h3 class="cert-title">${cert.title}</h3>
          <div class="cert-issuer">${cert.issuer}</div>
          <p class="cert-desc">${cert.desc}</p>
        </div>
        <div class="cert-skills">
          ${cert.skills.map(s => `<span>${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // Smooth scroll trigger from the 3-dot dropdown menu option
  if (certsToggleBtn) {
    certsToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('certificates');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
