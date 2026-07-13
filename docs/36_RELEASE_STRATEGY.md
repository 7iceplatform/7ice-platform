# Release Strategy

## Principles

Release continuously when safe, but expose customer value deliberately. A deployment is a technical event; a release is a controlled availability decision. Use progressive exposure, measurable outcomes, and a reversible path rather than large irreversible launches.

## Release lifecycle

1. Define scope, users, success metric, dependencies, support impact, and rollback criteria.
2. Verify code review, automated tests, security/accessibility/performance checks, migration compatibility, and operational readiness.
3. Deploy a versioned artifact, initially disabled or limited by tenant/role feature policy where appropriate.
4. Observe technical and product signals through the agreed window; expand only when acceptance criteria hold.
5. Communicate release notes, update support material, and close with outcome review.

## Change classes

Standard low-risk changes follow automated checks. High-risk changes—permissions, financial calculations, data migrations, external integrations, infrastructure, and workflow state changes—require explicit owner approval, staged rollout, rollback rehearsal or plan, and heightened monitoring. Emergency fixes use an expedited path but still receive retrospective review and documentation.

Breaking API changes follow deprecation policy in [API](./12_API.md). Operational promotion is specified in [Deployment](./32_DEPLOYMENT.md); quality evidence in [Testing](./33_TESTING.md); consequential decisions in [ADRs](./39_ADR.md).
