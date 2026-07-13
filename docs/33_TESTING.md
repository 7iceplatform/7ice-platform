# Testing Strategy

## Quality approach

7ice uses a risk-based testing pyramid: fast automated unit and component tests, contract and integration tests at module boundaries, focused end-to-end journey tests, plus exploratory, security, performance, and accessibility assessment. Tests demonstrate behavior and protect outcomes; coverage percentages alone do not prove quality.

## Required coverage

| Level       | Protects                         | Examples                                      |
| ----------- | -------------------------------- | --------------------------------------------- |
| Unit        | Domain invariants and pure logic | State transitions, pricing rules, permissions |
| Component   | UI behavior and accessibility    | Form errors, focus, loading state             |
| Contract    | API/event compatibility          | Consumer expectations, schema evolution       |
| Integration | Data and provider boundaries     | Outbox, migrations, webhook verification      |
| End-to-end  | Critical user outcomes           | Sign-in, proposal, booking, completion        |

## Release assurance

Every change adds or adjusts tests for its acceptance criteria and failure paths. Test fixtures are synthetic or sanitized, deterministic, tenant-scoped, and free of secrets. Run security scanning, dependency checks, authorization/tenant-isolation tests, accessibility checks, and performance tests appropriate to the risk. Track flaky tests as defects; do not normalize repeated reruns.

Quality gates and evidence are defined in [Release Strategy](./36_RELEASE_STRATEGY.md). See [Coding Standards](./34_CODING_STANDARDS.md), [Security](./25_SECURITY.md), [Performance](./27_PERFORMANCE.md), and [Accessibility](./28_ACCESSIBILITY.md).
