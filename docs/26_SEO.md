# Search Engine Optimization

## Objective

Public 7ice tenant pages should be discoverable, relevant, fast, and trustworthy. SEO must never compromise accessibility, user privacy, content quality, or the integrity of transactional flows. Authenticated portal pages are normally excluded from indexing.

## Technical requirements

- Render crawlable primary content server-side or statically, with stable canonical URLs and meaningful title and description metadata.
- Generate a tenant-aware XML sitemap and robots directives; block preview, duplicate filter states, internal search, and authenticated pages.
- Use semantic headings, landmarks, descriptive links, structured data only when the visible page supports it, and valid localized alternate links.
- Handle redirects at the edge, avoid chains and loops, and preserve mapping when content URLs change.
- Meet the performance budgets in [Performance](./27_PERFORMANCE.md); core content and metadata must not depend on third-party scripts.

## Content controls

CMS authors own accurate metadata, redirects, content freshness, image alt text, and legal review where required. Monitor indexing, crawl failures, canonical conflicts, structured-data errors, and organic landing-page conversion. See [CMS](./13_CMS.md), [Page Builder](./14_PAGE_BUILDER.md), [Brand Book](./06_BRAND_BOOK.md), and [Accessibility](./28_ACCESSIBILITY.md).
