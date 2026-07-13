# Business Rules

## Rule governance

Business rules determine permissible domain behavior. They are owned by Product with operational and finance approval where applicable, implemented in testable domain logic, and versioned with effective dates. A rule must identify its scope, trigger, decision, exceptions, actor, evidence, and audit expectation.

## Cross-domain baseline rules

| ID     | Rule                                                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-001 | A tenant may access only records and media explicitly scoped to that tenant.                                                                             |
| BR-002 | A confirmed quote snapshots configuration, price, currency, taxes, and approval evidence.                                                                |
| BR-003 | An installation cannot be scheduled until required readiness conditions are satisfied or an authorized exception is recorded.                            |
| BR-004 | Completion requires configured evidence and quality acceptance before a completion-based billable event is emitted.                                      |
| BR-005 | Closed financial documents are corrected by adjustment or credit, never in-place editing.                                                                |
| BR-006 | Marketing communication requires valid, purpose- and channel-appropriate consent; security messages may bypass marketing preference only when justified. |
| BR-007 | A user may take an action only when identity, tenant membership, role/policy, and record-state conditions permit it.                                     |

Detailed product-area rules are maintained with [CRM](./15_CRM.md), [Catalog](./19_CATALOG.md), [Installations](./20_INSTALLATIONS.md), [Service](./21_SERVICE.md), and [Finance](./22_FINANCE.md). Changes with structural technical impact require an [ADR](./39_ADR.md).
