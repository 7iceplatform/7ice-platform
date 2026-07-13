# ADR-0001: Use a single-company modular platform foundation

Status: Accepted
Date: 2026-07-13
Owners: Engineering

## Context

7ice is being implemented as an internal enterprise platform for the company 7ice. The approved Phase 1 direction explicitly excludes multi-tenancy from implementation decisions while retaining a modular, future-ready architecture. The foundation must also meet the documented requirements for server-side authorization, auditability, relational transactional data, API contracts, observability, security, testing, and deployability.

## Decision

- Build a single Next.js App Router application, deployed as a modular monolith with server-owned domain boundaries.
- Use PostgreSQL through Prisma for transactional persistence. The initial schema contains only identity, role/permission, and audit foundations.
- Authenticate with the company’s externally managed OpenID Connect provider. Resolve application roles and permissions from the database on the server; do not trust client-side claims for authorization.
- Exclude `tenant_id`, tenant resolution, tenant claims, tenant-scoped queries, and tenant-based cache keys from the foundation.
- Use a shared API handler for request IDs, structured logs, RFC 9457-style problem details, and safe error responses.
- Keep the approved 7ice master design as the sole visual source. The initial component primitives expose no business workflow or page layout.

## Consequences

The platform has a smaller and clearer authorization/data model for 7ice’s internal operation. Any future move to a multi-organization product would require a new ADR, data-model migration, authorization review, cache-boundary design, and regression coverage; it is not an implicit extension point.

The initial migration establishes application users, roles, permissions, assignments, and protected audit records. Product-domain models remain intentionally absent until their respective phases are approved.

## Alternatives considered

- **Implement multi-tenancy now.** Rejected because it conflicts with the approved Phase 1 direction and would introduce needless authorization, data, and operational complexity.
- **Use an external identity provider as the application authorization system.** Rejected because the platform needs its own auditable role and policy controls.
- **Split into microservices immediately.** Rejected because the documented architecture defaults to a modular monolith until a measured operational reason supports independent deployment.

## Links

- [Architecture](../docs/03_ARCHITECTURE.md)
- [Authentication and Authorization](../docs/24_AUTH.md)
- [Security](../docs/25_SECURITY.md)
- [Coding Standards](../docs/34_CODING_STANDARDS.md)
- [Architecture Decision Records](../docs/39_ADR.md)
