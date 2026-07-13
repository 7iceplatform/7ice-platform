# Administration Panel

## Purpose

The administration panel is the governed control plane for tenant configuration, identity administration, content operations, integrations, and support-safe diagnostics. It is not a backdoor for bypassing domain approvals or editing historical financial and operational truth.

## Administrative domains

- Tenant profile, locale, timezone, feature flags, and approved branding tokens.
- Roles, groups, policy assignments, invitations, and session administration.
- CMS and page-builder governance, media libraries, and publication approvals.
- Integration credentials references, webhook endpoints, sync health, and replay requests.
- Read-only audit search and authorized support tooling.

## Control requirements

High-risk actions—changing roles, access policies, integration endpoints, retention settings, exports, or feature rollout—require step-up authentication, clear impact confirmation, and immutable audit entries. Dual control is required when a change can expose data or alter financial behavior. Administrative APIs must have separate permissions from customer-facing APIs.

Configuration is versioned, tenant-scoped, validated, and rollbackable. See [Auth](./24_AUTH.md), [Security](./25_SECURITY.md), [CMS](./13_CMS.md), [Integrations](./31_INTEGRATIONS.md), and [Audit guidance in ADRs](./39_ADR.md).
