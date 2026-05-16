# Implementation Plan: Frontend Refactor & Design System

**Branch**: `018-frontend-refactor` | **Date**: 2026-05-16 | **Spec**: [018-frontend-refactor/spec.md](file:///home/rehan/GolandProjects/rester/specs/018-frontend-refactor/spec.md)

## Summary
Transform the frontend from a set of ad-hoc components into a scalable, design-system-driven architecture. This involves refactoring state management, extracting core UI primitives, and optimizing performance.

## Technical Context
- **Design Tokens**: Centralize colors and spacing in `tailwind.config.js`.
- **UI Primitives**: Build a library in `components/common/` (Button, Input, Switch, Modal, Tab).
- **State Architecture**: Refactor Zustand stores to use the slice pattern.
- **Optimization**: Implement selective rerendering via selectors.

## Project Structure

### Documentation
```text
specs/018-frontend-refactor/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code Revisions
```text
frontend/
├── src/
│   ├── components/
│   │   ├── common/             # [NEW] Primitive UI components
│   │   ├── Sidebar/            # Refactored for reuse
│   │   └── Editor/             # Optimized for performance
│   ├── state/
│   │   ├── slices/             # [NEW] Modular store segments
│   │   └── store.ts            # [NEW] Unified store entry
│   └── theme/
│       └── tokens.ts           # [NEW] Design system constants
└── tailwind.config.js          # Updated with brand colors
```

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Store Unification | Single source of truth for app state | Multiple isolated stores lead to synchronization bugs and prop drilling. |
| Atomic UI Components | Reusable primitives | Inline Tailwind classes are hard to maintain and inconsistent. |

## Verification Plan

### Automated Tests
- Snapshot tests for new common components.
- Unit tests for refactored store logic and selectors.

### Manual Verification
- Verify theme consistency across all views (Light/Dark).
- Audit rerenders using React DevTools (Highlight updates).
- Test complex flows (History -> Editor -> Send) for regressions.
