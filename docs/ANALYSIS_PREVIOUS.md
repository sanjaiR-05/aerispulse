# Rubric & Architecture Reconnaissance: Previous Iteration Analysis

## 1. Executive Summary & Context
- **Product Name:** AerisPulse — Urban Air Quality & Climate Health Intelligence System
- **Challenge Track:** Urban Air Quality & Climate Health Intelligence Assistant
- **Target Objective:** Attain an AI Grader score of **97+ across all 6 rubric dimensions** (Code Quality, Security, Efficiency, Testing & Coverage, Accessibility/WCAG 2.2 AA, and Problem Statement Alignment).
- **Core Problem:** Hyper-dense urban centers across India (e.g., Delhi NCR, Mumbai, Bengaluru, Chennai) experience volatile PM2.5/PM10 episodes and severe toxic gaseous spikes. Existing apps present passive, unverified numerical indices without actionable personal mitigation, fail to quantify human physiological dosage, lack strict resilience against LLM downtime, and exclude non-English speakers.

---

## 2. Deep-Dive Review of Previous Reference Patterns

### A. Architectural & Stack Evaluation
- **Previous Stack:** Next.js pages/basic app router with loose type safety (`any` types scattered across API handlers), hardcoded client-side telemetry queries, and inconsistent UI state management.
- **Deficiencies Identified:**
  - Client directly queried third-party APIs exposing endpoints to CORS errors and client IP rate-limiting.
  - Absence of domain isolation: Business math, UI presentation, and API fetching were coupled in monolithic component files.
  - Deployment assets exceeded optimal bundles due to unoptimized third-party charting libraries.

### B. LLM Integration & Resilience Patterns
- **Previous Approach:** Basic chat completions without enforced structured outputs or candidate failover.
- **Deficiencies Identified:**
  - Hallucinated quantitative metrics: Models frequently hallucinated PM2.5 reduction percentages and economic savings instead of performing deterministic math.
  - Unhandled upstream quota exhaustion / 429 errors resulting in broken UI states.
  - Missing delimiter isolation, leaving endpoints vulnerable to prompt injection.

### C. Security, Rate Limiting & Validation
- **Previous Approach:** No server-side rate limiting; unstructured POST payloads accepted without schema validation.
- **Deficiencies Identified:**
  - Vulnerability to API flooding and denial-of-wallet.
  - Missing enterprise HTTP security headers (no CSP, no HSTS, no X-Frame-Options).
  - Unsanitized user prompt strings passed directly into prompt templates.

### D. Accessibility & Testing Deficits
- **Previous Approach:** Ad-hoc manual tests, zero automated accessibility audits, missing ARIA live regions for dynamic updates.
- **Deficiencies Identified:**
  - Grader dropped a11y points due to unlabeled inputs, insufficient color contrast on warning badges, and unannounced telemetry changes.
  - Automated test coverage was < 40%, failing the rubric requirement of comprehensive unit and integration coverage.

---

## 3. Explicit 3-Part Architectural Ledger

### `[REUSE]`
1. **Core Visual Hierarchy & Design System:**
   - 4-preset metro selector (Delhi NCR, Mumbai Coastal, Bengaluru Corridor, Chennai Industrial) for immediate judge evaluation.
   - Clean, high-contrast atmospheric chemical concentration matrix (PM2.5, PM10, NO2, SO2, O3, CO).
   - Dynamic What-If lifestyle simulator layout with animated impact differentials.
2. **Open-Meteo & CAMS Telemetry Integration:**
   - Public Copernicus Atmosphere Monitoring Service (CAMS) atmospheric chemical feed for real-time ground-truth telemetry with zero API key dependencies.

### `[REFACTOR]`
1. **Strict Hexagonal / Domain-Driven Architecture:**
   - Decouple codebase into `src/domain/`, `src/services/`, `src/components/`, and `src/app/`.
   - 100% strict TypeScript (`strict: true`, `noImplicitAny: true`, zero `any`, zero `@ts-ignore`).
2. **Deterministic Accounting Separation:**
   - Enforce the golden rule: **"The LLM explains; code calculates."**
   - Extract all dosage, carbon, and economic savings into standalone, mathematically verified service modules (`dosage-calculator.ts`, `carbon-calculator.ts`, `aqi-calculator.ts`).
3. **Structured GenAI Action Engine & Candidate Failover:**
   - Gemini API integration with strict JSON schema output (`responseMimeType: "application/json"`).
   - Implement `fallback-service.ts`: A deterministic rules engine guaranteeing 100% uptime even if upstream LLM APIs are offline or unconfigured.
4. **Resilient Streaming Assistant:**
   - Migrate to Server-Sent Events (SSE) streaming with XML boundary fence isolation against prompt injection.

### `[DO NOT CARRY OVER]`
1. **Unvalidated Client-Side API Calls:** Completely remove direct third-party fetches from browser components; all telemetry queries must route through serverless route handlers (`/api/telemetry`).
2. **Monolithic Components with Inline Calculations:** Eliminate all unverified ad-hoc arithmetic in JSX.
3. **Missing Security Controls:** Eliminate routes without sliding-window IP rate limiting and Zod schema validation.
4. **English-Only Interfaces:** Eliminate unlocalized strings; implement full English (`en`), Tamil (`ta`), and Hindi (`hi`) internationalization.
