# Sujit Sahu | AI Engineer & Software Developer Portfolio

A premium, high-fidelity personal brand landing page built with vanilla **HTML5, CSS3, and JavaScript**. Designed with a minimalist Silicon Valley aesthetic, cinematic radial-gradient lighting, subtle interactive grid frameworks, and clean modern typography.

Live Production URLs: **[portfolioo-sand-sigma.vercel.app (Vercel)](https://portfolioo-sand-sigma.vercel.app)** | **[sujitsahu461.github.io/portfolioo/ (GitHub Pages)](https://sujitsahu461.github.io/portfolioo/)**

---

## ✨ Design Philosophy & Aesthetics

This portfolio is engineered to look like a high-end tech website, startup founder landing page, and premium engineering brand:
* **Minimalist Widescreen Showcase:** Replaces traditional circular avatars with an interactive, glowing widescreen dashboard mockup (`sujit-photo.jpg`) that showcases physical books, IDE code blocks, system architectures, and neural network charts.
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

## 📁 Repository Structure

```text
portfolioo/
├── api/                          # Vercel Serverless Functions (Backend)
│   ├── chat.js                   # POST /api/chat — SSE streaming RAG endpoint
│   ├── health.js                 # GET /api/health — System & vector store health
│   ├── ingest.js                 # POST /api/ingest — Admin-authenticated ingestion
│   └── lib/                      # Modular RAG engine
│       ├── chunker.js            # Semantic markdown chunking & frontmatter parser
│       ├── embeddings.js         # Embedding provider abstraction (OpenAI)
│       ├── llm.js                # LLM client with system prompt & streaming
│       ├── query-router.js       # Query intent classifier
│       ├── rate-limiter.js       # IP sliding-window rate limiter & sanitization
│       ├── retrieval.js          # RAG retrieval pipeline & context builder
│       ├── types.js              # JSDoc type definitions
│       └── vectorstore.js        # Vector store abstraction (Qdrant Cloud)
├── knowledge/                    # Structured knowledge base (21 Markdown docs)
│   ├── about/                    # profile.md, philosophy.md, goals.md
│   ├── achievements/             # certifications.md
│   ├── education/                # education.md
│   ├── experience/               # experience.md
│   ├── projects/                 # 10 detailed project markdown files
│   ├── resume/                   # resume.md
│   └── skills/                   # ai-ml.md, cybersecurity.md, programming.md, web-development.md
├── scripts/
│   └── ingest.js                 # CLI knowledge ingestion & embedding generator
├── tests/
│   ├── evaluation.json           # 15 RAG evaluation scenarios
│   └── test-rag.js               # Automated 40-check test suite
├── index.html                    # Main portfolio markup with integrated Sujit AI UI
├── sujit-ai.css                  # Sujit AI styling & responsive glassmorphism theme
├── sujit-ai.js                   # Sujit AI frontend client (SSE stream, state, shortcuts)
├── style.css                     # Portfolio core stylesheet
├── script.js                     # Portfolio interactive logic
├── server.js                     # Local development static server
├── package.json                  # Dependencies & scripts
├── vercel.json                   # Vercel deployment & routing configuration
└── .env.example                  # Environment template
```

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

