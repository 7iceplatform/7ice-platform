# Design System

## Purpose

The 7ice Design System is the shared language for coherent, accessible experiences across public pages, portals, and administration. It consists of design tokens, component specifications, content rules, and implementation primitives—not a collection of isolated screens.

## Foundations

Tokens express color, typography, spacing, radii, elevation, motion, breakpoints, and semantic status. Components consume semantic tokens such as `surface.warning` and `text.primary`; they must not depend directly on brand hex values. This allows tenant theming while preserving contrast and meaning.

## Contribution model

1. Prove a repeated user need and audit existing patterns.
2. Define anatomy, variants, responsive behavior, keyboard interaction, and empty/error/loading states.
3. Build the component with automated visual and accessibility coverage.
4. Document migration impact and deprecate safely.

Components must work in [UI Specification](./07_UI_SPECIFICATION.md) and are catalogued in [Component Library](./08_COMPONENT_LIBRARY.md). Brand expression is governed by [Brand Book](./06_BRAND_BOOK.md); functional accessibility requirements remain non-negotiable under [Accessibility](./28_ACCESSIBILITY.md).
