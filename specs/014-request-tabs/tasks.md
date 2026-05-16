# Tasks: Request Tabs System

## Phase 1: State & Types
- [x] T001 Update `Tab` type in `workspaceStore.ts`
- [x] T002 Implement `reorderTabs` and `closeAllTabs` actions
- [x] T003 Verify Zustand persistence for tab list

## Phase 2: Core UI Components
- [x] T004 Create `TabItem` component (memoized)
- [x] T005 Refactor `TabBar` to use `TabItem`
- [x] T006 Implement "Dirty State" visual logic
- [x] T007 Add context menu to tabs (Close All, etc.)

## Phase 3: Keyboard Shortcuts
- [x] T008 Implement `Ctrl+W` listener in `App.tsx`
- [x] T009 Implement `Ctrl+Tab` / `Ctrl+Shift+Tab` cycling
- [x] T010 Implement `Ctrl+1-9` direct jumping

## Phase 4: Refinement
- [x] T011 Implement horizontal scrolling for overflow tabs
- [x] T012 Add smooth transitions for tab opening/closing
- [x] T013 Performance audit (ensure switching is < 16ms)
