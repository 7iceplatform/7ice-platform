# Catalogue and Configuration

## Purpose

The catalogue is the governed source for sellable products, services, options, compatibility rules, availability constraints, and price-list references. It enables accurate customer choices while preserving historical commercial truth.

## Model

A product family contains versioned products. Products contain options, attributes, media, eligibility conditions, and service associations. Configurations are validated combinations of selected options with an effective date, currency, and price-list reference. Quotes snapshot the resolved configuration and commercial terms; later catalogue edits never rewrite history.

## Governance and rules

- Publish only reviewed catalogue versions with an effective-from date and tenant scope.
- Express compatibility, prerequisites, exclusions, and lead-time constraints as explicit rules with test cases.
- Keep price calculation explainable: show source price list, discounts, taxes, rounding, and manual approval requirements.
- Archive rather than delete referenced items; provide successor mappings where appropriate.

Catalogue data feeds [CRM](./15_CRM.md), CMS product pages, [Installations](./20_INSTALLATIONS.md), and [Finance](./22_FINANCE.md). Its precise commercial constraints belong in [Business Rules](./37_BUSINESS_RULES.md).
