# 🎨 Premium Interactive Portfolio - Sujit Sahu

A cinematic, immersive portfolio website featuring smooth scroll-based animations, interactive effects, and premium design patterns. Inspired by high-end creative portfolios like "They Call Me Giulio".

## ✨ Features

### 🎬 Core Experience
- **Entry Screen**: Animated intro with word-by-word reveal
- **Smooth Scroll Storytelling**: GSAP-powered ScrollTrigger animations
- **Parallax Effects**: Depth and motion on scroll
- **Interactive Hover States**: Project cards, skills, and contact links
- **Custom Cursor**: Tracked cursor with interactive states

### 🎨 Design
- **Dark Theme**: Deep blue (#0a0e27) base with electric cyan accents (#00d9ff)
- **Premium Typography**: Space Grotesk (body) + Syne (headings)
- **Glassmorphism**: Frosted glass effects on cards
- **Minimal UI**: Clean, spacious layout with intentional whitespace
- **Responsive**: Mobile-optimized animations and layouts

### ⚡ Animations
- **GSAP + ScrollTrigger**: Production-grade animation engine
- **Fade-in on scroll**: Reveal animations as you browse
- **Text reveal**: Character-by-character text animations
- **Smooth transitions**: Page section transitions
- **Hover effects**: Interactive element feedback

### 📱 Sections
1. **Loading Screen**: Animated progress bar
2. **Entry Screen**: "I build digital experiences" intro with button
3. **Hero Section**: Name, title, scroll indicator
4. **About**: Narrative about yourself with skills preview
5. **Projects**: Interactive project showcase (3 featured projects)
6. **Skills**: Categorized skills grid (Frontend, Backend, Security, Tools)
7. **Contact**: CTA with links (Email, GitHub, LinkedIn)
8. **Footer**: Copyright information

## 🚀 Quick Start

### No Build Required (Vanilla Setup)
The portfolio is built with vanilla HTML, CSS, and JavaScript - no build tools needed!

**Option 1: Local File**
1. Open `index.html` in your browser
2. Double-click the file or right-click → "Open with" → Browser

**Option 2: Local Server (Recommended)**
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## 📁 Project Structure

```
portfolio claude/
├── index.html          # Main HTML - All sections
├── style.css          # Complete styling (dark theme + animations)
├── script.js          # GSAP animations + interactions
├── README.md          # This file
└── profile-photo.jpg  # Profile image (optional)
```

## 🎯 Key Files Explained

### `index.html`
- Semantic HTML structure
- 8 main sections (loader, entry, hero, about, projects, skills, contact, footer)
- Font imports from Google Fonts
- GSAP library imports

### `style.css`
- CSS Variables for colors and effects
- 25+ @keyframe animations
- Responsive grid layouts
- Glassmorphism and depth effects
- Mobile breakpoints (768px, 480px)

### `script.js`
- **initLoader()**: Loading bar animation
- **initCustomCursor()**: Tracked mouse cursor
- **initEntryScreen()**: Entry animation & transition
- **initScrollRevealAnimations()**: GSAP scroll triggers
- **initParallaxEffects()**: Depth scrolling
- **initHoverEffects()**: Interactive element feedback

## 🎨 Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
  --bg: #0a0e27;              /* Main background */
  --accent: #00d9ff;          /* Cyan accent */
  --text: #f5f7fa;            /* Main text */
  --text-secondary: #a0aec0;  /* Secondary text */
}
```

### Typography
Fonts are imported from Google Fonts:
- **Syne**: Headings (large, bold)
- **Space Grotesk**: Body text
- **Inter**: Accent text

### Content
**Edit `index.html` to personalize:**
```html
<!-- Entry Screen -->
<span class="word">I</span>
<span class="word">build</span>
<span class="word">digital</span>
<span class="word">experiences</span>

<!-- Hero Section -->
<span class="word">Sujit Sahu</span>
<p class="hero-subtitle">Your Role Here</p>

<!-- Projects -->
<div class="project-card">
  <h3 class="project-title">Your Project</h3>
  <p class="project-desc">Your description</p>
</div>

<!-- Skills -->
<div class="skill-category">
  <h3>Category Name</h3>
  <div class="skill">Your Skill</div>
</div>
```

### Animations Speed
Modify timing in `script.js`:
```javascript
const config = {
  loaderDuration: 2.5,        // Loader animation length
  entryScreenDuration: 0.8,   // Entry reveal speed
  animationDelay: 0.05,       // Stagger delay between items
};
```

## 🔧 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

**Note**: GSAP works in all modern browsers. Older IE versions not supported.

## 📊 Performance Tips

1. **Image Optimization**: Compress project images (use tools like TinyPNG)
2. **Lazy Loading**: Consider adding for project images
3. **Animation Complexity**: Reduce on mobile (already configured)
4. **CSS**: Minify for production
5. **LocalStorage**: Cache animations preference

## 🎓 Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Custom properties, Grid, Flexbox
- **JavaScript (Vanilla)**: No frameworks needed
- **GSAP 3**: Animation timeline library
- **ScrollTrigger**: Scroll-based trigger plugin
- **Google Fonts**: Premium typography

## 🚀 Deployment

### Netlify (Free)
```bash
1. Push files to GitHub
2. Connect repo to Netlify
3. Auto-deploys on every push
```

### Vercel
```bash
1. Upload files directly or connect GitHub
2. Auto-deploys
3. Free custom domain available
```

### Traditional Hosting
1. Upload files via FTP to your host
2. Set `index.html` as default document
3. Done!

## 🎬 Animation Events

**Loading → Entry Screen → Hero (Immediate Animations)**
1. Loader bar fills (3s)
2. Fade to entry screen
3. Words animate in staggered
4. Click "Enter" → fade out
5. Hero section appears with parallax grid

**Scroll-Based Animations**
- About section: Fade + slide on scroll
- Project cards: Opacity + transform on scroll
- Skills: Staggered reveal by category
- Contact: Fade in when visible

## 📝 Notes

- All animations respect `prefers-reduced-motion`
- Mobile animations optimized (95% speed)
- Cursor effects disabled on touch devices
- Smooth scrolling uses native CSS

## 🤝 Support

For questions or customization help:
- Check inline code comments
- Review GSAP documentation: https://gsap.com
- ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger

---

**Built with ❤️ for premium digital experiences**

Version 1.0 | 2026
