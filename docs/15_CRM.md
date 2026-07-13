# Customer Relationship Management

## Purpose

CRM captures customer and prospect relationships from consented lead to customer lifecycle. It provides sales and support context without becoming a shadow database for catalogue, finance, or field operations.

## Core records

| Record       | Owner and rule                                             |
| ------------ | ---------------------------------------------------------- |
| Person       | Individual contact with consent and privacy preferences    |
| Organization | Customer account and commercial relationship               |
| Lead         | Unqualified expression of interest with source attribution |
| Opportunity  | Qualified commercial pursuit with stage and forecast       |
| Activity     | Interaction or task, attributable and time-stamped         |
| Consent      | Purpose, channel, evidence, capture time, withdrawal time  |

## Lifecycle controls

Lead conversion deduplicates against permitted contacts and organizations, preserves provenance, and creates a linked opportunity only when qualification criteria are met. Opportunity stages use configured exit criteria; a stage cannot be advanced merely because a user has access. Won outcomes hand off an approved order or contract event to downstream processes; lost outcomes require a standardized reason.

Access is role- and relationship-scoped, particularly for sensitive contacts. Retention, deletion, exports, and consent are governed by [Security](./25_SECURITY.md) and [Business Rules](./37_BUSINESS_RULES.md). CRM consumes [Catalog](./19_CATALOG.md) proposals and feeds [Client Portal](./17_CLIENT_PORTAL.md) communications through [Notifications](./30_NOTIFICATIONS.md).
