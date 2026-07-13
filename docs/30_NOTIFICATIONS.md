# Notifications

## Purpose

Notifications deliver relevant, consented, timely messages across in-app, email, SMS, push, and approved third-party channels. They communicate domain events; they are not an independent workflow state machine.

## Delivery model

An authoritative module emits a notification intent with tenant, recipient reference, template key, event context, channel eligibility, urgency, and correlation ID. The notification service resolves preferences and consent, renders an approved localized template, sends through a provider, records delivery outcomes, and applies retry/fallback policy where lawful and appropriate.

## Rules

- Distinguish transactional, operational, security, and marketing messages; consent and unsubscribe rules differ by category and jurisdiction.
- Avoid sensitive data in subject lines, push payloads, URLs, and provider logs. Links must be signed or authenticated as appropriate.
- Deduplicate events and enforce rate limits, quiet hours, channel preference, and escalation rules.
- Track queued, sent, delivered, bounced, failed, and suppressed states without equating delivery with user comprehension.
- Template changes require content, brand, accessibility, localization, and legal review appropriate to impact.

Notification triggers originate in modules such as [CRM](./15_CRM.md), [Installations](./20_INSTALLATIONS.md), [Service](./21_SERVICE.md), [Finance](./22_FINANCE.md), and [Auth](./24_AUTH.md). Provider controls are covered by [Integrations](./31_INTEGRATIONS.md) and [Security](./25_SECURITY.md).
