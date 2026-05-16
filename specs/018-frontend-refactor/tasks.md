# Tasks: Frontend Refactor

## Phase 1: Design System & Tokens
- [ ] T001 Update `tailwind.config.js` with Rester brand palette and standard tokens
- [ ] T002 Implement core primitives in `frontend/src/components/common/`:
    - [ ] `Button.tsx`
    - [ ] `IconButton.tsx`
    - [ ] `Input.tsx`
    - [ ] `Badge.tsx`
    - [ ] `Card.tsx`
- [ ] T003 Implement layout components:
    - [ ] `Modal.tsx`
    - [ ] `TabList.tsx`

## Phase 2: State Refactoring
- [ ] T004 Define unified store structure using Zustand slices
- [ ] T005 Refactor `workspaceStore.ts` into slices
- [ ] T006 Refactor `collectionStore.ts` and `historyStore.ts` to share common logic
- [ ] T007 Implement optimized selectors for all components

## Phase 3: Component Migration
- [ ] T008 [P] Migrate `Sidebar.tsx` and its children to use common primitives
- [ ] T009 [P] Migrate `SettingsModal.tsx` to use the new `Modal` and `TabList`
- [ ] T010 [P] Migrate `RequestEditor.tsx` and `ResponseViewer.tsx` to standardized UI components

## Phase 4: Performance Optimization
- [ ] T011 Audit and implement `React.memo` on high-frequency components (e.g., Tree nodes, History items)
- [ ] T012 Optimize `FormEditor` inputs to minimize store-wide rerenders
- [ ] T013 Implement virtualization for large environment lists

## Phase 5: Polish & Consistency
- [ ] T014 Standardize scrollbars and focus rings across the app
- [ ] T015 Final audit of Tailwind classes for consistency
- [ ] T016 Update documentation and `project-context.md` with new architecture
