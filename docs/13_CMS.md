# Content Management System

## Purpose

The CMS enables governed creation and publishing of public and authenticated informational content without code deployment. It is not an alternate source of truth for products, prices, operational statuses, or permissions; those remain in their domain modules.

## Content lifecycle

Content moves through Draft, In Review, Approved, Scheduled, Published, Archived, and Restored states. Authors create drafts; reviewers approve according to tenant policy; publishers release only approved revisions. Every publish, rollback, and permission change is audited.

## Governance

- Model reusable structured content before rich-text fields; validate links, images, metadata, and locale completeness.
- Preview the exact tenant, locale, device context, and release revision before publishing.
- Retain immutable published revisions and enable fast rollback to a prior approved version.
- Restrict embedded scripts, raw HTML, and external resources through an allowlist and security review.
- Use least-privilege author, reviewer, publisher, and administrator roles; see [Admin Panel](./16_ADMIN_PANEL.md).

Public delivery follows [SEO](./26_SEO.md), [Performance](./27_PERFORMANCE.md), [Accessibility](./28_ACCESSIBILITY.md), and the reusable layouts in [Page Builder](./14_PAGE_BUILDER.md).
