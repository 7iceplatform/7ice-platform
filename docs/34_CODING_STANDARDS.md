# Coding Standards

## Principles

Code is a maintained product asset. Optimize for correct behavior, readability, safe change, and observable operation—not cleverness. Follow language and framework conventions consistently; automated formatting and static analysis decide style where possible.

## Required practices

- Use clear domain names, small focused functions, explicit types at boundaries, and comments only for non-obvious intent or constraints.
- Keep business rules in domain modules, authorization on the server, and transport/persistence concerns at boundaries.
- Validate untrusted input, use safe data-access patterns, avoid logging secrets or personal data, and propagate correlation IDs.
- Make mutations transactional where invariants require it; design asynchronous handlers for duplicate and out-of-order delivery.
- Avoid hidden global state, unbounded retries, silent error swallowing, and temporal coupling across modules.

## Review expectations

Pull requests are small enough to review, explain user impact and risk, include relevant tests, update documentation, and identify migrations or rollout needs. Reviewers assess correctness, security, tenant scope, accessibility, performance, operability, and backwards compatibility. Use [Git Workflow](./35_GIT_WORKFLOW.md), [Testing](./33_TESTING.md), [API](./12_API.md), and [Security](./25_SECURITY.md) together.
