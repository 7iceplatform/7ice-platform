# Component Library

## Supported primitives

The library supplies accessible, composable primitives for navigation, actions, forms, feedback, data display, overlays, workflow status, and layout. It is the only approved source for shared controls in 7ice web applications.

| Family   | Examples                             | Contract                                           |
| -------- | ------------------------------------ | -------------------------------------------------- |
| Actions  | Button, split button, link           | Clear action label, disabled and pending semantics |
| Inputs   | Text field, select, date, combobox   | Label, help, error, keyboard support               |
| Feedback | Alert, toast, inline error, progress | Appropriate urgency and non-color cue              |
| Data     | Table, list, badge, timeline         | Responsive and semantic reading order              |
| Overlays | Dialog, drawer, popover              | Focus management and safe dismissal                |

## API and lifecycle

Components expose documented variants and semantic props, not page-specific styling escapes. Breaking changes require a migration guide, codemod where feasible, a deprecation window, and visual regression review. Components may not make domain decisions or fetch business data directly.

Consumer code follows [Frontend](./09_FRONTEND.md). Design and behavior align with [Design System](./05_DESIGN_SYSTEM.md), [UI Specification](./07_UI_SPECIFICATION.md), and [Accessibility](./28_ACCESSIBILITY.md).
