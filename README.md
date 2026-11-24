# Sujit Sahu | AI Engineer & Software Developer Portfolio

A premium, high-fidelity personal brand landing page built with vanilla **HTML5, CSS3, and JavaScript**. Designed with a minimalist Silicon Valley aesthetic, cinematic radial-gradient lighting, subtle interactive grid frameworks, and clean modern typography.

Live Production URLs: **[portfolioo-sand-sigma.vercel.app (Vercel)](https://portfolioo-sand-sigma.vercel.app)** | **[sujitsahu461.github.io/portfolioo/ (GitHub Pages)](https://sujitsahu461.github.io/portfolioo/)**

---

## ✨ Design Philosophy & Aesthetics

This portfolio is engineered to look like a high-end tech website, startup founder landing page, and premium engineering brand:
* **Portrait:** a 3:4 portrait (`assets/images/sujit-portrait.jpg`, about 100 KB) in a glowing frame on the Home page. To change it, replace that file with a 3:4 image (about 640×853 px), keep the eyes near the upper third, and use a new file name so visitors do not get a cached copy.
* **Cinematic Backdrop Lighting:** Built using a custom deep-space radial gradient (#0c1326 to #06070a) and a faint, barely-visible cybergrid layout (#00f0ff at 0.7% opacity) for a sleek Silicon Valley feel.
* **Refined Typography & Kerning:** Uses *Montserrat* for strong, uppercase headings with tight modern kerning (`-0.03em`) and *Inter* for highly readable, soft slate-grey description text.
* **Subtle Interactive Motion:** Smooth CSS hover transitions (`translateY(-4px)`) that brighten card border gradients and trigger soft neon drop-shadows on card elements.
* **Premium Overlay Glassmorphism:** Features dark overlays with high-quality backdrop-blurs (`backdrop-filter: blur(10px)`) and custom Webkit-designed scrollbars.

---

## 🚀 Key Features

* **Sujit AI — RAG Personal Assistant**: Production-grade retrieval-augmented generation assistant embedded directly in the portfolio with streaming SSE, category query routing, anti-hallucination grounding, suggested prompts, and glassmorphism interface.
* **Silicon Valley Landing Page:** Elegant hero section showing stats, clean description text, logo `<Sujit />`, and direct resume integrations.
* **Persisted Light & Dark Mode Toggle:** Dedicated theme button in the navbar using CSS custom variables that sync colors dynamically and store user preferences locally in browser `localStorage`.
* **3-Dot Options Dropdown Menu:** Custom interactive menu containing section sub-navigation (`Navigate >`), social platforms (`Connect >`), and scrolling controls.
* **10 Verifiable Certifications:** Dedicated certifications section and overlay modal showcasing **10 real credentials** from your resume (including Cisco, HP LIFE, CTR MSME AI internship, PrepRight, EduSkills Python, Let's Upgrade ChatGPT, GIET coursework, and Coding Ninjas) with direct LinkedIn validation links.
* **Dynamic Quote Generator:** Quotation container displaying a rotating collection of 14 quotes from science, philosophy, history, and life on each refresh.
* **Professional Legal Documents:** Fully compliant modals for Disclaimer (ethical hacking and no-warranty clauses), Privacy Policy (minimal PII capture, Vercel logs, and localStorage disclosures), and Terms & Conditions (Indian legal jurisdiction in Odisha, India, and acceptable use).
* **Zero Build Steps for Frontend:** Clean vanilla JavaScript and CSS with no bundler overhead, coupled with high-performance Vercel serverless API functions.
* **Cache-Busting Asset Versioning:** Integrated with query parameters on stylesheet and script links to prevent client-side cache locks.

---

## 🤖 Sujit AI — RAG Personal Knowledge Assistant

**Sujit AI** is a technically credible, production-grade Retrieval-Augmented Generation (RAG) system embedded directly into the portfolio. It acts as a digital knowledge interface allowing visitors, recruiters, and collaborators to explore Sujit's background, projects, technical skills, certifications, and experience through natural language.

### Architecture Overview

```mermaid
flowchart TD
    User([Visitor / Recruiter]) <-->|Natural Language Query| UI[Chat UI — sujit-ai.js / sujit-ai.css]
    UI -->|POST /api/chat (SSE Stream)| API[Vercel Serverless Function — api/chat.js]
    
    subgraph Safety & Rate Limiting
        API --> VAL[Message Validator & Sanitizer]
        VAL --> RL[Sliding Window Rate Limiter]
    end
    
    subgraph RAG Pipeline
        RL --> QR[Query Router — Category Classifier]
        QR --> EMB[OpenAI text-embedding-3-small]
        EMB --> QDR[Qdrant Vector Store Search]
        QDR --> RET[Context Assembly & Deduplication]
    end
    
    subgraph Generation
        RET --> LLM[OpenAI gpt-4o-mini with Grounded System Prompt]
        LLM -->|Token Streaming| SSE[Server-Sent Events]
        SSE --> UI
    end
    
    subgraph Knowledge Base & Ingestion
        KB[knowledge/*.md — 21 Documents] --> CHK[Semantic Chunker & Frontmatter Parser]
        CHK --> ING[scripts/ingest.js]
        ING --> EMB2[Embedding Batch Generation]
        EMB2 --> QDR2[(Qdrant Cloud Collection: sujit-ai)]
    end
```

### Key Technical Capabilities

1. **Strict Grounding & Zero Hallucination**:
   - Explicit system prompt instructions preventing speculation, false metrics, or fabricated claims.
   - Graceful fallback for unknown information with professional deflection and direct contact options.
   - Prompt injection defense against adversarial jailbreaks, system prompt exfiltration, and database dump requests.

2. **Intelligent Query Routing**:
   - Heuristic classification into 8 distinct intents: `PROFILE`, `PROJECT`, `SKILLS`, `EDUCATION`, `EXPERIENCE`, `ACHIEVEMENT`, `CONTACT`, and `GENERAL`.
   - Category-targeted metadata filtering boosting relevant retrieval accuracy.

3. **Multi-Source Knowledge Base**:
   - 21 curated Markdown documents with YAML frontmatter covering all aspects of Sujit's background:
     - `knowledge/about/` — Profile, development philosophy, learning goals
     - `knowledge/education/` — GIET University B.Tech CS, Seven Hills School
     - `knowledge/skills/` — AI/ML, cybersecurity, web development, core programming
     - `knowledge/projects/` — Finn-Track-Pro, BullLens, Superpower Hands, Weather Dashboard, Bank Management, Bandwidth-Agnostic PWA, Hotel Management, LMS, IPL Analytics, VoteWise
     - `knowledge/experience/` — All 5 internships (MCL, EduSkills, PreppRight, CTTC)
     - `knowledge/achievements/` — Certifications and credentials
     - `knowledge/resume/` — Comprehensive resume snapshot

4. **Production Serverless Architecture**:
   - Vercel Serverless Functions (`api/chat.js`, `api/health.js`, `api/ingest.js`).
   - Qdrant Cloud vector database integration with payload filtering.
   - Modular abstraction layer (`api/lib/`): embeddings, vector store, chunker, query router, retrieval pipeline, LLM client, rate limiter.

---

## 🧠 Teaching Sujit AI new things

The local knowledge engine (used when no cloud keys are set, or the cloud call fails) answers from three verified sources and never invents facts:

| Source | How to update it |
|---|---|
| `knowledge/**/*.md` | Add or edit a file. A new file in `knowledge/projects/` is picked up on the next start and gets overview, problem, features, tech, role, architecture and source-code questions automatically. |
| `lib/qa-bank.js` | Hand-written answers for profile, contact, experience, goals and "not on file" topics. Add an `e('id', 'topic', [phrasings], answer)` entry, or `more('id', [phrasings])` to teach new wordings. |
| Live GitHub (`lib/github-live.js`) | Nothing to do. Recent commits, repositories, languages and contributions are read from GitHub (cached 10 minutes). |

Anything not covered gets an honest "not on file" reply. Private facts (age, phone, salary, family, grades) are refused on purpose.

```bash
node tests/test-sujit-ai.js         # ~12,000 generated questions + held-out, refusal, injection and live-GitHub checks
node scripts/export-qa-md.js        # export the bank to knowledge/faq/qa-bank.md for the cloud index
node scripts/ingest.js              # re-index knowledge/ into Qdrant (cloud mode only)
```

Cloud RAG mode answers from the Qdrant index, so run the last two commands after changing the knowledge base. LinkedIn has no public API, so certificates and LinkedIn changes must be added to `knowledge/` by hand.

## ⚡ Performance (phone and laptop)

The galaxy is a full-screen canvas behind the whole page, so the site is built to keep it cheap:

| What | How |
|---|---|
| Idle page costs nothing | The canvas repaints only when the camera, pointer or a planet changes. A page that is not moving paints **0 frames** (it used to repaint about 30 per second). |
| One image for the backdrop | The Milky Way, nebula, far stars and sun glow are composed once per screen size, then copied as a single image per frame. |
| Lower resolution on phones | Pixel ratio is capped at 1 on phones and 1.5 on laptops, and drops further (down to 0.6) automatically if frames keep running long. |
| No backdrop blur | `css/perf.css` removes `backdrop-filter` from cards. Blurring over an animating canvas is the most common cause of scroll lag. The header keeps a light blur on laptops only. |
| Calm on touch screens | No parallax, no floating hero loops and no large card shadows on phones and tablets. |
| Cheap scrolling | The scroll bar moves with a transform (not `width`), the nav highlight uses cached positions and runs once per frame, and the custom cursor stops updating when it has caught up. |
| Loading | Images below the fold are lazy-loaded, planet textures are built in idle time, and the intro paints nothing behind it. |
| Visible only | The clock, galaxy and GitHub loops pause when the tab is hidden or the element is off screen, and honour `prefers-reduced-motion`. |

**How to check it yourself**

1. `node server.js`, open http://localhost:8000.
2. Chrome DevTools → **Performance** → record while scrolling the whole page, once at laptop size and once with the device toolbar set to a phone (375 px) and **CPU: 4x slowdown**. Frames should stay near 16 ms.
3. In the console, `__galaxy.state()` shows `drawMs` (cost of one canvas frame, about 0.2–0.5 ms) and `drawn` (frames painted so far); leave the page alone for 10 seconds and `drawn` should barely change.

## 📁 Repository Structure

```text
portfolio/
├── index.html                    # The whole site as one continuous page, plus the Sujit AI widget
├── css/
│   ├── style.css                 # Core design system and section styles
│   ├── galaxy.css                # Galaxy rail, paged layout, page navigation
│   ├── github.css                # GitHub Activity section and About layout
│   ├── dock.css                  # Orbital clock: open layout, no card
│   ├── loader.css                # Loading screen: orbiting planets and real loading steps
│   ├── perf.css                  # Performance layer: switches off costly effects (loaded last)
│   └── sujit-ai.css              # Sujit AI widget styling
├── js/
│   ├── script.js                 # Content rendering, project and certificate modals, forms
│   ├── animations.js             # Intro loader, Lenis smooth scroll, GSAP reveals
│   ├── pager.js                  # OPTIONAL, switched off: one-page-at-a-time mode (add its <script> tag to index.html to enable)
│   ├── galaxy.js                 # Canvas galaxy: one planet per section, flies as you scroll
│   ├── github.js                 # GitHub section: profile card plus contribution graph (live from /api/github)
│   ├── dock.js                   # Orbital clock: Saturn = hour, Earth = minute, Mars = second (Sujit's local time, IST)
│   └── sujit-ai.js               # Sujit AI chat client (SSE streaming)
├── assets/
│   ├── images/                   # favicon, logo emblem, portrait, certificates/
│   └── docs/                     # Sujit-Kumar-Sahu-Resume.pdf
├── api/                          # Vercel serverless functions
│   ├── chat.js                   # POST /api/chat: cloud RAG, falls back to the local engine
│   ├── github.js                 # GET /api/github: live GitHub activity
│   └── health.js                 # GET /api/health
├── lib/                          # Shared backend code (CommonJS)
│   ├── local-responder.js        # Sujit AI local engine: intents, live GitHub, refusals
│   ├── local-search.js           # BM25 retrieval with synonyms and a confidence floor
│   ├── qa-bank.js                # Hand-written answers plus ones generated from knowledge/
│   ├── github-live.js            # GitHub data fetch and cache
│   └── chunker.js, embeddings.js, llm.js, query-router.js, rate-limiter.js,
│       retrieval.js, types.js, vectorstore.js   # Cloud RAG pipeline
├── knowledge/                    # Verified facts about Sujit (Markdown, one topic per file)
├── scripts/                      # ingest.js, export-qa-md.js
├── tests/                        # test-rag.js (pipeline) and test-sujit-ai.js (answer quality)
├── server.js                     # Local dev server (static files plus /api)
├── vercel.json                   # Deployment, redirects, caching
├── package.json
└── .env.example
```

The site is one continuous page with a fixed header. Anchors such as `#about`, `#work` and `#github` work as deep links. `js/pager.js` and the `paged-js` rules in `css/galaxy.css` are an optional one-section-at-a-time mode that is currently switched off.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and provide your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Required | Default |
|---|---|---|---|
| `OPENAI_API_KEY` | OpenAI API Key for embeddings and chat generation | Yes | - |
| `QDRANT_URL` | Qdrant Cloud cluster URL (`https://xyz.qdrant.tech:6333`) | Yes | - |
| `QDRANT_API_KEY` | Qdrant Cloud API key | Yes | - |
| `QDRANT_COLLECTION` | Qdrant collection name | No | `sujit-ai` |
| `ADMIN_API_KEY` | Secret key for triggering `/api/ingest` via HTTP | No | - |
| `LLM_MODEL` | OpenAI LLM model | No | `gpt-4o-mini` |
| `EMBEDDING_MODEL` | OpenAI embedding model | No | `text-embedding-3-small` |

---

## 🚀 Knowledge Ingestion

To chunk the knowledge base, generate vector embeddings, and upsert to Qdrant Cloud:

```bash
# Ingest new or modified documents
node scripts/ingest.js

# Full wipe and fresh reindex
node scripts/ingest.js --reindex
```

---

## 🧪 Testing & Validation

Run the automated test suite covering query classification, markdown chunking, input validation, knowledge integrity, and secret leaks:

```bash
node tests/test-rag.js
```

Results output:
```text
🤖 Sujit AI — Test Suite
  ✅ Query Router Tests (10/10)
  ✅ Document Chunker Tests (9/9)
  ✅ Input Validation Tests (7/7)
  ✅ Knowledge Base Integrity Tests (10/10)
  ✅ Security Tests (4/4)
📊 Results: 40 passed, 0 failed, 0 skipped (Total: 40 tests)
```

---

## 🛠️ Local Development & Running

### Option A: Using the Custom Dev Server (Recommended)
```bash
node server.js
```
Open `http://localhost:8000/` in your browser. The "Ask Sujit AI" floating launcher is active at the bottom right.

### Option B: Using Vercel CLI (Local Serverless API)
To test the serverless API routes locally with active environment variables:
```bash
npx vercel dev
```

---

## 📦 Deployment

### Deploying to Vercel (Frontend + Serverless API)
1. Push your changes to GitHub.
2. In your Vercel project dashboard, set the Environment Variables (`OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`).
3. Deploy:
   ```bash
   git add .
   git commit -m "Add Sujit AI RAG assistant"
   git push origin main
   ```
4. Run knowledge ingestion once your Qdrant cluster is live:
   ```bash
   node scripts/ingest.js
   ```

