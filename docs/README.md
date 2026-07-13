# 7ice Engineering Documentation

This directory is the controlled source of truth for the 7ice Platform: an enterprise platform for selling, delivering, installing, and servicing configurable products across their full customer lifecycle. It is intentionally product- and implementation-oriented; operational decisions that change behavior must be reflected here before release.

## Reading path

Start with [Project](./00_PROJECT.md), [Product Vision](./01_PRODUCT_VISION.md), and [Roadmap](./02_ROADMAP.md). Engineering teams should then read [Architecture](./03_ARCHITECTURE.md), [Tech Stack](./04_TECH_STACK.md), [API](./12_API.md), and the standards in [Coding Standards](./34_CODING_STANDARDS.md). Product-area documents describe owned capabilities and their business rules.

## Document map

| Area                  | Documents                       |
| --------------------- | ------------------------------- |
| Direction             | `00`–`02`, `37`–`40`            |
| Foundations           | `03`–`08`, `24`–`28`, `32`–`36` |
| Platform capabilities | `09`–`23`, `29`–`31`            |

## Governance

- Each document has an accountable owner: Product for customer outcomes, Engineering for technical behavior, Design for experience standards, and Security for risk controls.
- Record consequential technical choices in [ADRs](./39_ADR.md); do not silently overwrite decisions.
- Keep examples free of production credentials and personal data. See [Security](./25_SECURITY.md).
- Review affected documents in every feature pull request and every release-readiness review.

The documentation describes the target operating model and is designed to be refined as implementation decisions are made. Terms use the definitions in the [Glossary](./40_GLOSSARY.md).
