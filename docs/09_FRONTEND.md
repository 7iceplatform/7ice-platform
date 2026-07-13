# Frontend Engineering

## Responsibilities

Frontend applications render public CMS journeys, client and employee portals, and administration. They compose approved UI components, obtain data only through supported APIs, and enforce presentation-level guards; the backend remains the authorization authority.

## Implementation rules

- Use TypeScript in strict mode and domain-oriented feature folders.
- Prefer server rendering or static generation for public content; use client interactivity only where needed.
- Treat API data as untrusted at the boundary: validate shapes, show explicit error states, and do not expose secrets in browser bundles.
- Keep view state separate from authoritative domain state. Use optimistic updates only with rollback and conflict handling.
- Instrument key journeys with privacy-reviewed events, not raw personal data.

## Performance and resilience

Define page performance budgets, defer non-critical code, optimize media, and avoid serial request waterfalls. Support retries for transient errors, but never hide a failed mutation. Cache only data appropriate to its tenant, user, and freshness constraints.

See [API](./12_API.md), [Client Portal](./17_CLIENT_PORTAL.md), [Employee Portal](./18_EMPLOYEE_PORTAL.md), [Performance](./27_PERFORMANCE.md), [Accessibility](./28_ACCESSIBILITY.md), and [Coding Standards](./34_CODING_STANDARDS.md).
