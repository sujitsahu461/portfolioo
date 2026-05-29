# Sujit Sahu | AI Engineer & Software Developer Portfolio

A premium, high-fidelity personal brand landing page built with vanilla **HTML5, CSS3, and JavaScript**. Designed with a minimalist Silicon Valley aesthetic, cinematic radial-gradient lighting, subtle interactive grid frameworks, and clean modern typography.

Live Production URL: **[sujitsahu461.github.io/portfolioo/](https://sujitsahu461.github.io/portfolioo/)**

---

## ✨ Design Philosophy & Aesthetics

This portfolio is engineered to look like a high-end tech website, startup founder landing page, and premium engineering brand:
* **Minimalist Widescreen Showcase:** Replaces traditional circular avatars with an interactive, glowing widescreen dashboard mockup (`sujit-photo.jpg`) that showcases physical books, IDE code blocks, system architectures, and neural network charts.
* **Cinematic Backdrop Lighting:** Built using a custom deep-space radial gradient (#0c1326 to #06070a) and a faint, barely-visible cybergrid layout (#00f0ff at 0.7% opacity) for a sleek Silicon Valley feel.
* **Refined Typography & Kerning:** Uses *Montserrat* for strong, uppercase headings with tight modern kerning (`-0.03em`) and *Inter* for highly readable, soft slate-grey description text.
* **Subtle Interactive Motion:** Smooth CSS hover transitions (`translateY(-4px)`) that brighten card border gradients and trigger soft neon drop-shadows on card elements.

---

## 🚀 Key Features

* **Silicon Valley Landing Page:** Elegant hero section showing stats, clean description text, and direct resume integrations.
* **Premium Grid Highlights:** Meticulously designed About Me highlight cards featuring Security-First, Full-Stack, and Scalable Architecture details.
* **Interactive Timeline:** A bespoke timeline layout highlighting GIET University and Seven Hills education logs with hover glowing lift effects.
* **Clean Project Modals:** A flexible, vanilla JS-driven modal card showcasing 10 featured projects spanning Full-Stack REST APIs, FastAPI Machine Learning Trackers, Computer Vision Hand Tracking, and OOP Java modules.
* **Zero Build Steps:** Engineered entirely with raw web languages, requiring no heavy package builds or compile pipelines for superfast loading.

---

## 📁 Repository Structure

```text
portfolioo/
├── index.html            # Main site structure & markup
├── style.css             # Full typography, animations, and custom visual design system
├── script.js             # Navigation logic, active sections, and project modals
├── server.js             # Lightweight local development server
├── sujit-photo.jpg       # High-resolution widescreen brand mockup centerpiece
├── Sujit_Kumar_Sahu_Resume.pdf  # Software Developer & AI Engineer PDF Resume
└── README.md             # Developer documentation
```

---

## 🛠️ Local Development & Running

### Option A: Using the Custom Dev Server (Recommended)
This repository includes a lightweight, secure Node.js server to run the portfolio locally:

1. Ensure [Node.js](https://nodejs.org/) is installed.
2. Open your terminal in the workspace directory and execute:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8000/
   ```

### Option B: Using Python Fallback
Alternatively, run the default Python static server:
```bash
python -m http.server 8000
```

---

## 📦 Automated Deployment

This portfolio is configured for continuous delivery through **GitHub Pages**:
1. Staging and committing files automatically triggers the deployment.
2. Pushing commits directly to the `main` branch redeploys changes:
   ```bash
   git add .
   git commit -m "Optimize typography and layouts"
   git push origin main
   ```
3. Live production updates propagate immediately to the cloud build.
