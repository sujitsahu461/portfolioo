# Premium Interactive Portfolio

A static portfolio site for Sujit Sahu built with plain HTML, CSS, and JavaScript. The experience uses a loading screen, an entry screen, and GSAP-powered scroll animation when the animation libraries are available.

## Current experience

- Loader screen with animated progress bar
- Entry screen with intro copy and Enter button
- Hero, About, Projects, Skills, Contact, and Footer sections
- Custom cursor on fine-pointer devices
- Scroll-based reveals and hover motion
- Responsive layout with no build step required

## Startup behavior

The page now initializes with a defensive startup flow:

- The loader animates with GSAP when `gsap` is available
- The loader falls back to plain JavaScript if the CDN scripts do not load
- A failsafe timer hides the loader automatically so the page does not stay stuck on "Initializing experience"
- ScrollTrigger features only run when `ScrollTrigger` is present

This logic lives in [script.js](c:\Users\ADMIN\Downloads\portfolio claude\script.js).

## Project structure

```text
portfolio claude/
|-- index.html
|-- style.css
|-- script.js
|-- README.md
|-- debug.html
|-- test-loader.html
`-- profile-photo.jpg
```

## Files

### [index.html](c:\Users\ADMIN\Downloads\portfolio claude\index.html)

- Defines the loader, entry screen, and all portfolio sections
- Loads Google Fonts
- Loads GSAP and ScrollTrigger from CDN
- Loads the main app script

### [style.css](c:\Users\ADMIN\Downloads\portfolio claude\style.css)

- Contains the full visual system
- Styles the loader and entry overlays
- Handles responsive layout and hover states
- Includes the hero, grid, cards, and contact styling

### [script.js](c:\Users\ADMIN\Downloads\portfolio claude\script.js)

- Initializes the loader, entry screen, cursor, and animations
- Guards GSAP and ScrollTrigger usage so startup does not crash
- Includes a loader failsafe timeout
- Runs post-loader animation setup only once

### [debug.html](c:\Users\ADMIN\Downloads\portfolio claude\debug.html)

- Small debugging page for checking whether dependencies and key elements exist

### [test-loader.html](c:\Users\ADMIN\Downloads\portfolio claude\test-loader.html)

- Minimal page for isolating and testing the loader flow

## Run locally

You can open `index.html` directly, but a local server is recommended.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Customization

### Content

Update text, links, and section content in [index.html](c:\Users\ADMIN\Downloads\portfolio claude\index.html).

### Visual design

Update colors, spacing, and layout rules in [style.css](c:\Users\ADMIN\Downloads\portfolio claude\style.css).

### Motion and startup timing

Update animation timing in [script.js](c:\Users\ADMIN\Downloads\portfolio claude\script.js), especially:

```js
const config = {
  loaderDuration: 1.5,
  loaderFadeDuration: 0.6,
  animationDelay: 0.05,
  loaderFailsafeDelay: 3500,
};
```

## Browser notes

- Modern Chrome, Edge, Firefox, and Safari are supported
- The custom cursor is disabled automatically on touch-first devices
- Reduced-motion users get shorter startup animation timing
- If CDN-hosted GSAP fails, the page still continues with fallback behavior

## Deployment

Because this is a static site, it can be deployed directly to:

- Netlify
- Vercel
- GitHub Pages
- Any traditional static host

## Notes

- There is no build pipeline
- There is no framework dependency
- GSAP is optional at runtime for startup, but still used for premium motion when available

Version 1.1 | 2026
