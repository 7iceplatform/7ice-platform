# Architecture Decision Records

## Purpose

Architecture Decision Records (ADRs) capture durable technical and product-architecture choices, their context, and their consequences. They prevent rediscovery and make trade-offs reviewable. ADRs supplement—not replace—requirements and operational documentation.

## Process

Create an ADR before or alongside implementation when a decision is costly to reverse, changes a module boundary, affects data ownership, introduces a dependency, changes security posture, or sets a reusable platform pattern. Use sequential filenames in an `adr/` subdirectory when ADRs begin, such as `adr/0001-use-transactional-outbox.md`. This index remains the governance entry point.

## Template

```markdown
# ADR-0001: Decision title

Status: Proposed | Accepted | Superseded | Deprecated
Date: YYYY-MM-DD
Owners: names or roles

## Context

What problem, constraints, and forces exist?

## Decision

What will we do, including scope and boundaries?

## Consequences

Benefits, costs, risks, migration, and operational impact.

## Alternatives considered

What was rejected and why?

## Links

Related requirements, implementation, and superseding ADRs.
```

Accepted ADRs are immutable except for status and links. Supersede rather than rewrite historical reasoning. Cross-reference [Architecture](./03_ARCHITECTURE.md), [Tech Stack](./04_TECH_STACK.md), [Security](./25_SECURITY.md), and [Business Rules](./37_BUSINESS_RULES.md).
