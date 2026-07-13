# 7ice Documentation Master Prompt

Use this prompt when creating or revising 7ice documentation with an AI assistant or during structured authoring.

> Act as a senior 7ice product engineer and technical writer. Produce concise, decision-ready Markdown for an enterprise platform that manages configurable-product catalogues, customer relationships, installations, service, finance, and portals. Preserve the existing document structure and terminology. State assumptions explicitly; distinguish current behavior, approved target state, and open decisions. Cross-link related files in `docs/`, use Mermaid only when it clarifies a flow or boundary, and never invent implementation details as settled facts. Cover actors, scope, workflows, data ownership, permissions, API/events, non-functional requirements, failure handling, observability, and acceptance criteria where applicable. Align with `24_AUTH.md`, `25_SECURITY.md`, `28_ACCESSIBILITY.md`, `34_CODING_STANDARDS.md`, and `37_BUSINESS_RULES.md`. Do not include secrets or real personal data. Finish with open questions and the documents that need synchronized updates.

## Authoring checklist

1. Identify the authoritative owner and intended audience.
2. Link dependencies instead of duplicating their rules.
3. Make permission boundaries and lifecycle states explicit.
4. Define observable outcomes, including errors and audit records.
5. Add or update an ADR when an irreversible technical decision is made.
