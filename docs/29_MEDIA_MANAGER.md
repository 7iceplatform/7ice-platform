# Media Manager

## Purpose

The media manager provides secure, governed storage and reuse of images, documents, and approved media across CMS, catalogue, portals, and work evidence. It protects intellectual property, privacy, and delivery performance while preserving provenance.

## Asset lifecycle

Assets are uploaded to a quarantined area, virus-scanned, type-validated, metadata-extracted, optionally transformed, approved, and then published through signed or policy-controlled delivery URLs. Replaced or expired assets remain traceable; deletion is subject to retention, legal hold, and reference checks.

## Requirements

- Enforce file-type and size allowlists, content-disposition rules, malware scanning, and decompression-bomb protection.
- Store ownership, tenant scope, rights/licence, consent where relevant, alt text or transcript, and retention classification.
- Generate responsive images and streaming/download variants from trusted processing; preserve originals only when policy requires.
- Use short-lived signed upload/download grants and protect private operational evidence from public delivery.
- Prevent deletion of referenced or legally retained assets; use soft deletion and audit records.

Media supports [CMS](./13_CMS.md), [Page Builder](./14_PAGE_BUILDER.md), [Catalog](./19_CATALOG.md), [Installations](./20_INSTALLATIONS.md), and [Service](./21_SERVICE.md), subject to [Security](./25_SECURITY.md), [Performance](./27_PERFORMANCE.md), and [Accessibility](./28_ACCESSIBILITY.md).
