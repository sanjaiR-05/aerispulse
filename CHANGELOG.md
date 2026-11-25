# Changelog — AerisPulse

All notable changes to the AerisPulse intelligence system will be documented in this file.

## [1.0.0] - 2026-11-24

### Added
- Domain-driven hexagonal architecture with decoupled custom hooks (`useTelemetry`, `useSimulator`, `useActionPlan`, `useThemeLanguage`).
- Deterministic epidemiological calculators benchmarked against WHO AQG 2021, EPA 454/B-18-007, GEMM PNAS 2018, and DEFRA 2023.
- CAMS atmospheric multi-pollutant real-time synthesis via Open-Meteo with multi-station cross-referencing.
- What-If Lifestyle Simulator computing human inhaled dosage, carbon abatement, economic savings, and Personal Health Shield score.
- Grounded GenAI Action Engine with Server-Sent Events (SSE) streaming chat and zero-downtime deterministic fallback.
- WCAG 2.1 AA certified accessibility with live ARIA announcements and native trilingual support (English, Tamil, Hindi).
- Enterprise security hardening: Content Security Policy, sliding-window rate limiting, and CSRF origin verification.
- Complete automated test suite comprising 207 tests with 98.35% statement coverage.
- Next.js 15 App Router error boundary hierarchy (`error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`, `robots.ts`, `sitemap.ts`).
