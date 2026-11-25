# Security Policy — AerisPulse

## Supported Versions

AerisPulse maintains active security patches and dependency vulnerability updates for the following versions:

| Version | Supported | Status |
| :--- | :--- | :--- |
| `1.0.x` | Yes | Active LTS |
| `< 1.0.0` | No | Deprecated |

## Threat Model & Security Controls

AerisPulse enforces defense-in-depth across the application boundary:

1. **Content Security Policy (CSP):**
   - Strictly forbids `unsafe-eval` execution.
   - Enforces `object-src 'none'` to block plugin and object exploits.
   - Restricts external network communication solely to verified telemetry and AI endpoints.
2. **Server-Side API Isolation:**
   - Client applications never receive or process upstream API credentials or keys.
   - All external requests route through serverless Next.js Route Handlers.
3. **Denial of Service & Rate Limiting:**
   - Sliding-window in-memory IP rate limiting (`SlidingWindowRateLimiter`) with IETF standard headers (`X-RateLimit-*`, `Retry-After`).
4. **CSRF & Origin Verification:**
   - Host header matching prevents unauthorized cross-origin mutation requests.
5. **Prompt Injection & Delimiter Neutralization:**
   - Inbound chat text is sanitized via Zod schema pipelines and wrapped inside XML boundary isolation fences (`<telemetry_context>`, `<user_query>`).

## Reporting a Vulnerability

If you discover a potential security vulnerability within AerisPulse:

1. Please do not open a public issue on GitHub.
2. Submit a confidential advisory report via GitHub Security Advisories or email the maintainer at `sanjair.csrbox@gmail.com`.
3. Provide reproduction steps, potential impact, and sample payloads.
4. Security patches will be reviewed, evaluated, and deployed within 48 hours.
