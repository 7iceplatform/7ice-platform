# Git Workflow

## Branching

`main` is the protected, releasable integration branch. Create short-lived branches from current `main` using the prefix `codex/` by default for assisted work, or team-approved prefixes such as `feature/`, `fix/`, and `docs/`. Branch names describe the outcome, for example `feature/installation-readiness`.

## Commit and pull request rules

- Make atomic commits with imperative, meaningful subjects; avoid mixing formatting, refactoring, and feature behavior without explanation.
- Rebase or merge according to repository policy before review; never rewrite shared history without team agreement.
- Open a pull request with problem statement, scope, screenshots or API examples when useful, risks, tests run, migration/deployment notes, and documentation updates.
- Require automated checks and the appropriate code, product, design, security, or operations review for the change risk.
- Squash, merge, or rebase only after approvals and checks are valid; link the resulting change to release notes where required.

Keep secrets out of commits. Treat generated lockfiles and migration files as reviewed artifacts. Delivery and rollback expectations are in [Deployment](./32_DEPLOYMENT.md), quality gates in [Testing](./33_TESTING.md), and release promotion in [Release Strategy](./36_RELEASE_STRATEGY.md).
