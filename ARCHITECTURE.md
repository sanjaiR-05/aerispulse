# System Architecture — AerisPulse

AerisPulse is designed following a **Domain-Driven Hexagonal Architecture** (Ports and Adapters) to ensure complete decoupling between mathematical calculation models, external telemetry providers, UI presentation components, and AI orchestration services.

```
+-----------------------------------------------------------------------------------+
|                                 Next.js 15 UI Layer                               |
|   (Header, MetroPresets, TelemetryCards, ChemicalMatrix, LifestyleSimulator, ...)  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                Custom Hooks Layer                                 |
|          (useTelemetry, useSimulator, useActionPlan, useThemeLanguage)            |
+-----------------------------------------------------------------------------------+
          |                                                               |
          v                                                               v
+------------------------------------+          +------------------------------------+
|          Services Layer            |          |            Domain Layer            |
|  - aqi-calculator (EPA 2018)       |          |  - types.ts (strict schemas)       |
|  - dosage-calculator (WHO 2021)    | <------> |  - constants.ts (EPA breakpoints)  |
|  - carbon-calculator (DEFRA 2023)  |          |  - schemas.ts (Zod validation)     |
|  - economic-calculator (ICMR 2023) |          |  - translations.ts (EN, TA, HI)    |
|  - shield-calculator (0-100 score) |          +------------------------------------+
|  - telemetry-service (Open-Meteo)  |
|  - cache-service (SWR in-memory)   |
|  - rate-limiter (Sliding Window)   |
|  - security (CSRF & Rate Headers)  |
|  - fallback-service (Deterministic)|
|  - genai-service (Gemini API)      |
+------------------------------------+
                  |
                  v
+-----------------------------------------------------------------------------------+
|                        Serverless Route Handlers & APIs                           |
|       (/api/telemetry, /api/action-plan, /api/chat, /api/health)                  |
+-----------------------------------------------------------------------------------+
```

## Key Architectural Principles

1. **"The LLM Explains; Code Calculates":**
   Non-linear mathematical formulas (such as EPA piecewise linear interpolation, minute ventilation integration, and carbon abatement) are never delegated to probabilistic language models. They are computed synchronously by deterministic TypeScript algorithms.

2. **Zero-Downtime Resilience:**
   If upstream LLM endpoints experience rate limiting (429), regional outages, or latency timeouts (>6000ms), the system seamlessly transfers execution to `fallback-service.ts`, providing guaranteed clinical recommendations in under 15ms.

3. **High-Efficiency Caching:**
   Atmospheric telemetry is stored in an in-memory TTL cache with Stale-While-Revalidate (SWR) semantics, reducing external network latency to sub-5ms on cache hits.
