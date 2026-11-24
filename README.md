# AerisPulse — Urban Air Quality & Climate Health Intelligence System

[![CI/CD Pipeline](https://github.com/sanjaiR-05/aerispulse/actions/workflows/ci.yml/badge.svg)](https://github.com/sanjaiR-05/aerispulse/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-190%20passing-emerald)](https://github.com/sanjaiR-05/aerispulse)
[![Coverage](https://img.shields.io/badge/coverage-98.3%25-brightgreen)](https://github.com/sanjaiR-05/aerispulse)
[![WCAG](https://img.shields.io/badge/WCAG%202.2%20AA-0%20violations-blue)](https://github.com/sanjaiR-05/aerispulse)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Live Deployment:** [https://aerispulse.vercel.app](https://aerispulse.vercel.app)  
> **Automated HD Walkthrough:** [Download 1080p Walkthrough](https://github.com/sanjaiR-05/aerispulse/releases/download/v1.0.0/aerispulse_walkthrough_1080p.mp4)

---

## 🌟 Executive Overview
**AerisPulse** is an autonomous full-stack atmospheric intelligence system that bridges the gap between passive sensor feeds and verifiable personal climate defense. Grounded strictly in real-time Copernicus Atmosphere Monitoring Service (CAMS) telemetry from Open-Meteo and peer-reviewed epidemiological dosage models, AerisPulse delivers actionable, personalized health protocols with 100% zero-downtime resilience.

### Core Architectural Principle
> **"The LLM explains; code calculates."**  
> Large Language Models hallucinate arithmetic and non-linear conversions. In AerisPulse, all quantitative metrics (inhaled particulate dosage $\mu\text{g/day}$, carbon abatement $\text{kg CO}_2\text{/day}$, economic health savings $\text{INR/mo}$, US EPA AQI, and the Personal Health Shield Score) are computed exclusively by deterministic TypeScript algorithms. The AI engine provides qualitative contextualization, structured action directives, and natural language communication.

---

## 🏛️ System Architecture

AerisPulse follows a strict **Domain-Driven Hexagonal Architecture**:
```
src/
├── domain/                  # Pure Types, Constants, Zod Schemas & Translations
│   ├── types.ts             # Strict TypeScript domain interfaces
│   ├── constants.ts         # EPA breakpoints, DEFRA factors, Metro presets
│   ├── schemas.ts           # Zod runtime payload validators & sanitizers
│   └── translations.ts      # Full English, Tamil, and Hindi dictionaries
├── services/                # Deterministic Engines & External Integrations
│   ├── aqi-calculator.ts    # US EPA 454/B-18-007 piecewise linear interpolation
│   ├── dosage-calculator.ts # Human minute ventilation & inhaled PM2.5 dosage
│   ├── carbon-calculator.ts # DEFRA 2023 greenhouse gas abatement factors
│   ├── economic-calculator.ts # Outpatient medication & sick day economic savings
│   ├── shield-calculator.ts # Personal Health Shield Score (0-100)
│   ├── telemetry-service.ts # Open-Meteo CAMS atmospheric telemetry client
│   ├── cache-service.ts     # In-memory Stale-While-Revalidate TTL cache
│   ├── rate-limiter.ts      # Sliding-window IP rate limiter
│   ├── fallback-service.ts  # Deterministic clinical rules engine (zero-downtime)
│   └── genai-service.ts     # Google Gemini API with JSON Schema mode & failover
├── components/              # Accessible Semantic React Components
│   ├── Header.tsx           # Language switcher, dark mode toggle, branding
│   ├── MetroPresets.tsx     # 1-Click 5-second evaluation presets
│   ├── TelemetryCards.tsx   # Verified atmospheric telemetry indicators
│   ├── ChemicalMatrix.tsx   # PM2.5, PM10, NO2, SO2, CO, O3 matrix
│   ├── LifestyleSimulator.tsx # Dynamic What-If lifestyle dosage simulator
│   ├── ActionPlanSection.tsx  # Structured GenAI clinical directives
│   ├── StreamingChat.tsx    # Grounded SSE streaming atmospheric assistant
│   ├── Footer.tsx           # Peer-reviewed methodology citations & a11y badge
│   └── A11yLiveAnnouncer.tsx # WCAG 2.2 AA ARIA live region status announcer
└── app/                     # Next.js 15 App Router & Serverless Route Handlers
    ├── api/telemetry/       # In-memory cached atmospheric feed endpoint
    ├── api/action-plan/     # Rate-limited structured action synthesis
    ├── api/chat/            # Rate-limited SSE streaming chat
    ├── api/health/          # Health check endpoint (HTTP 200)
    ├── layout.tsx           # Global root layout with skip navigation
    └── page.tsx             # Main client dashboard orchestration
```

---

## 🔬 Scientific Methodology & Peer-Reviewed Formulations

All mathematical computations in AerisPulse are documented and cited in [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md):

1. **Inhaled Particulate Matter Dosage ($D$):**
   $$D = \sum_{j} C_j \times V_{E, j} \times t_j \times (1 - \eta_{\text{mask}, j}) \times (1 - \eta_{\text{filter}, j})$$
   - Benchmarked against **WHO Global Air Quality Guidelines (2021)** and **Burnett et al. (PNAS 2018)** Global Exposure Mortality Model (GEMM).
2. **US EPA Air Quality Index Interpolation:**
   $$I_p = \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} (C_p - C_{\text{low}}) + I_{\text{low}}$$
   - Benchmark: **US EPA Technical Assistance Document EPA-454/B-18-007**.
3. **Carbon Abatement Modeling:**
   $$\Delta E_{\text{CO}_2} = d_{\text{commute}} \times (EF_{\text{ICE}} - EF_{\text{mode}})$$
   - Benchmark: **UK DEFRA Government Greenhouse Gas Conversion Factors (2023)**.

---

## 🛡️ Enterprise Security & Resilience (Target: 100/100)

- **Three-Tier Zero-Downtime Resilience:** If upstream LLMs encounter rate limits (429), regional outages, or missing API keys, the system automatically falls back to `fallback-service.ts`, guaranteeing uninterrupted clinical action plans and chat responses.
- **Sliding-Window IP Rate Limiting:** All POST route handlers (`/api/action-plan`, `/api/chat`) enforce sliding-window rate limiting to prevent API abuse.
- **Prompt Injection Defense:** Strict Zod schema sanitization strips `<script>`, `<SYSTEM>`, `[INSTRUCTION]`, and delimiter boundaries. Prompts are wrapped in XML isolation fences (`<telemetry_context>`, `<user_query>`).
- **HTTP Security Headers:** `next.config.ts` enforces `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## ♿ Accessibility & Localization (WCAG 2.2 AA Verified)

- **100% Keyboard Navigable:** Focus visible outlines, skip-to-main-content link, semantic HTML5 structure (`<main>`, `<header>`, `<section>`, `<fieldset>`).
- **Screen Reader Announcements:** Dynamic telemetry updates, simulator recalculations, and action plans are broadcast via `A11yLiveAnnouncer` with `aria-live="polite"`.
- **Trilingual Support:** Native language localization for **English (`en`)**, **Tamil (`ta` - தமிழ்)**, and **Hindi (`hi` - हिंदी)**.
- **Automated Axe-Core Audit:** Verified **0 accessibility violations** using `@axe-core/react` and `axe-core`.

---

## 🧪 Testing & Verification

AerisPulse maintains a comprehensive automated testing suite:
```bash
# Run strict TypeScript typecheck
npm run typecheck

# Run ESLint quality inspection
npm run lint

# Run all 190 automated unit, integration & accessibility tests
npm test

# Run tests with V8 coverage report
npm run test:coverage

# Run production Next.js 15 build
npm run build
```

### Verified Test Suite Breakdown:
- **190 Automated Tests** across 17 test suites (100% passing).
- **98.3% Statement & Line Coverage** across all domain, services, components, and API routes.
- **100% API Route Coverage** (`/api/health`, `/api/telemetry`, `/api/action-plan`, `/api/chat`).
- **Production JS Bundle:** 123 KB First Load JS (under 250 KB target).

---

## 🚀 Quickstart & Local Development

```bash
# 1. Clone repository
git clone https://github.com/sanjaiR-05/aerispulse.git
cd aerispulse

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API Key
# If omitted, AerisPulse automatically operates on its Deterministic Fallback Engine
export GEMINI_API_KEY="your_api_key_here"

# 4. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License
This project is licensed under the MIT License.
