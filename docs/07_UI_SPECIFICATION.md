# UI Specification

## Interaction baseline

Every 7ice screen identifies its purpose, current context, primary action, data freshness, and recovery path. Design for desktop operational density and mobile field completion without presenting different business rules by channel.

## Required states

Each data-bearing view specifies loading, empty, populated, no-permission, offline/degraded, validation-error, and system-error states. Mutations show immediate confirmation or a clear pending state. Destructive actions require a concise consequence statement and, where impact is material, explicit confirmation.

## Forms and workflow

- Group inputs by the user task, use persistent labels, and explain format or consequences before submission.
- Validate locally for clarity and on the server for trust; map server errors to actionable fields or summaries.
- Preserve entered values on recoverable failure and make autosave status visible when present.
- Long workflows show progress, allow safe interruption, and name the responsible next actor.

## Information hierarchy

Tables support sorting, filtering, pagination, saved views, and accessible bulk-selection semantics. Detail pages surface status, ownership, next action, chronology, and linked records. Implementation patterns live in [Component Library](./08_COMPONENT_LIBRARY.md); requirements are enforced by [Accessibility](./28_ACCESSIBILITY.md) and [Performance](./27_PERFORMANCE.md).
