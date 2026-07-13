# Client Portal

## Purpose

The client portal gives authorized customers a transparent, self-service view of their relationship with 7ice tenants: account information, products or assets, proposals, appointments, installation progress, service requests, documents, and eligible invoices or payments.

## Experience requirements

The portal opens with actionable status and next steps, not an internal dashboard. Customers can view history, update permitted contact details, acknowledge or reschedule eligible appointments, raise service requests, and download approved documents. Users must never infer internal-only notes, staffing information, or other customers’ data.

## Authorization and privacy

Access is scoped to a tenant, organization/account relationship, and role. Delegated organization administrators can manage members only within policy. Sensitive activities—email changes, exports, payment redirects, or adding administrators—use reauthentication and notification. All customer-visible records are filtered again by the domain API; frontend routing is not security.

## Key flows

Portal status derives from [Installations](./20_INSTALLATIONS.md), [Service](./21_SERVICE.md), [Finance](./22_FINANCE.md), and [CRM](./15_CRM.md). Messages are governed by [Notifications](./30_NOTIFICATIONS.md), interfaces by [Accessibility](./28_ACCESSIBILITY.md), and authentication by [Auth](./24_AUTH.md).
