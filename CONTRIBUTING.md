# Contributing to AerisPulse

Thank you for your interest in contributing to the AerisPulse Urban Air Quality & Climate Health Intelligence System.

## Development Workflow

1. **Prerequisites:**
   - Node.js >= 20.0.0
   - npm >= 10.0.0

2. **Installation:**
   ```bash
   git clone https://github.com/sanjaiR-05/aerispulse.git
   cd aerispulse
   npm install
   ```

3. **Running Local Development Server:**
   ```bash
   npm run dev
   ```

4. **Code Quality & Verification Commands:**
   Before opening a pull request, ensure all verification checks pass:
   ```bash
   # Type verification (0 errors required)
   npm run typecheck

   # ESLint static analysis (0 warnings required)
   npm run lint

   # Automated unit and integration test suite
   npm test

   # Test coverage verification (must meet >=95% lines and statements)
   npm run test:coverage

   # Production bundle compilation
   npm run build
   ```

## Architectural Guidelines

- **"The LLM explains; code calculates":** All quantitative formulas must be implemented as deterministic TypeScript pure functions in `src/services/` with comprehensive TSDoc and peer-reviewed citations.
- **Hexagonal Boundaries:** Domain models and schemas in `src/domain/` must remain pure without external framework dependencies.
- **Accessibility:** All UI components must comply with WCAG 2.1 AA standards, verify 0 violations via axe-core, and announce dynamic updates through `A11yLiveAnnouncer`.
