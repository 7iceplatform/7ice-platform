# Finance

## Purpose and boundary

Finance manages commercial events, invoice readiness, payment-status synchronization, credits, and reconciliation visibility. It is not a replacement for the organization’s general ledger or payment processor. External accounting and payment systems remain authoritative for their designated records.

## Financial event model

Commercial and operational modules emit approved events such as quote acceptance, deposit due, installation milestone accepted, service charge approved, credit approved, invoice issued, and payment settled. Finance validates eligibility, creates an immutable accounting export or integration command, and records its external reference and reconciliation state.

## Controls

- Monetary calculations use currency minor units, explicit tax basis, rounding rules, and immutable document snapshots.
- A financial period close freezes eligible records; corrections use adjustments or credit notes, never silent mutation.
- Segregate proposal, approval, posting, and reconciliation permissions where practical.
- Payment details are tokenized or hosted by a compliant provider; 7ice stores only the minimum reference data.
- Integration failures enter a visible exception queue with idempotent replay and reconciliation reports.

See [Catalog](./19_CATALOG.md), [Installations](./20_INSTALLATIONS.md), [Service](./21_SERVICE.md), [Integrations](./31_INTEGRATIONS.md), [Security](./25_SECURITY.md), and [Business Rules](./37_BUSINESS_RULES.md).
