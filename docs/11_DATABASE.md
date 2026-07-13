# Database

## Data ownership

The transactional database is the authoritative source for operational domain records. Each table belongs to one module and has a documented lifecycle, tenant scope, retention class, and audit requirement. Other modules access it through domain interfaces rather than direct table coupling.

## Modeling rules

- Use stable opaque identifiers, UTC timestamps, explicit status fields, and `tenant_id` on tenant-owned records.
- Enforce referential integrity, uniqueness, and critical state constraints in the database as well as application validation.
- Prefer normalized write models; introduce denormalized read models only with an owner, refresh semantics, and rebuild path.
- Store monetary values as integer minor units plus ISO currency. Store a time zone with locally scheduled work.
- Never put passwords, tokens, payment-card data, or unbounded binary media in relational tables.

## Change management

Migrations must be forward-compatible, reviewed, repeatable, and tested against production-like volumes. Use expand–migrate–contract for breaking schema changes; deploy code that tolerates both states before removal. Backup, restore, encryption, access, and retention controls follow [Security](./25_SECURITY.md) and [Deployment](./32_DEPLOYMENT.md).

The platform data model supports [CRM](./15_CRM.md), [Catalog](./19_CATALOG.md), [Installations](./20_INSTALLATIONS.md), [Service](./21_SERVICE.md), and [Finance](./22_FINANCE.md).
