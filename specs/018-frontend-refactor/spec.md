# Feature Specification: Frontend Refactor

**Feature Branch**: `018-frontend-refactor`
**Created**: 2026-05-16
**Status**: Draft
**Input**: Refactor frontend architecture. Requirements: reduce duplicated UI logic, improve component reuse, improve Zustand store organization, optimize React rerenders, improve Tailwind consistency, ensure scalable component structure, simplify prop drilling.

## Overview
Perform a comprehensive refactor of the frontend codebase to improve maintainability, performance, and scalability. This includes extracting common UI components, normalizing state management, and establishing a consistent design system using Tailwind.

## Goals

### 1. Reduce Duplicated UI Logic
- Extract common patterns (e.g., buttons, inputs, modals, cards) into a `components/common/` directory.
- Standardize the "Danger Zone" and "Status" components.

### 2. Improve Zustand Store Organization
- Split large stores into smaller, domain-specific slices.
- Use selectors for better rerender optimization.
- Standardize action naming and state structures.

### 3. Optimize React Rerenders
- Implement `useCallback` and `useMemo` where appropriate.
- Move state closer to where it's used to prevent massive tree updates.
- Optimize list rendering with `React.memo`.

### 4. Improve Tailwind Consistency
- Move all custom hex colors to `tailwind.config.js` theme.
- Create a consistent spacing and typography scale.
- Replace ad-hoc utility classes with standard design tokens.

## Requirements

### Functional Requirements
- **FR-001**: **Design System**: MUST establish a set of base components in `frontend/src/components/common`.
- **FR-002**: **Store Normalization**: MUST refactor `workspaceStore` and `collectionStore` to use a more modular structure.
- **FR-003**: **Performance**: MUST reduce unnecessary rerenders in the main workspace and sidebar.

### Technical Requirements
- **TR-001**: Update `tailwind.config.js` with the Rester brand palette.
- **TR-002**: Use `zustand/middleware` for devtools and persist where applicable.
- **TR-003**: Ensure all refactored components are fully typed with TypeScript.

## Success Criteria
- SC-001: Reduced total lines of code by at least 10% (via reuse).
- SC-002: Improved lighthouse/performance score for the web build.
- SC-003: No regressions in existing feature functionality (Collections, History, Settings).
