# Employee Portal

## Purpose

The employee portal is the daily work surface for sales, operations, technicians, service, and authorized finance users. It surfaces work queues and task-specific workflows while the underlying modules retain data ownership.

## Role-oriented workspaces

| Workspace  | Primary actions                                           |
| ---------- | --------------------------------------------------------- |
| Sales      | Qualify leads, maintain opportunities, prepare proposals  |
| Operations | Plan capacity, assign work, resolve delivery exceptions   |
| Technician | Review assigned jobs, capture evidence, record outcomes   |
| Service    | Triage requests, manage cases, coordinate parts or visits |
| Finance    | Review billable events, exceptions, reconciliation status |

## Field resilience

Mobile workflows prioritize assigned work, essential customer context, safety checks, and concise evidence capture. Any offline capability must declare which actions queue locally, how encryption and device loss are handled, conflict resolution, maximum retention, and a visible sync state. A user cannot assume queued work has been accepted until the server confirms it.

The portal relies on [Auth](./24_AUTH.md), [Installations](./20_INSTALLATIONS.md), [Service](./21_SERVICE.md), [Finance](./22_FINANCE.md), and [UI Specification](./07_UI_SPECIFICATION.md).
