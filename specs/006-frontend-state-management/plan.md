# Implementation Plan: Frontend State Management Refactor

## Overview
We will refactor the existing frontend state management to use **Zustand**. The state will be partitioned into three primary stores to ensure modularity, minimize re-renders, and support future persistence and plugin systems.

## User Review Required

> [!IMPORTANT]
> **Selective Selectors**: Components must use specific selectors to avoid performance regressions. We will enforce this pattern during the refactor.

> [!NOTE]
> **Persistence**: We will use Zustand's `persist` middleware for the `WorkspaceStore` to support tab persistence.

## Proposed Changes

### Frontend Stores

#### [NEW] [uiStore.ts](file:///home/rehan/GolandProjects/rester/frontend/src/state/uiStore.ts)
- `sidebarOpen`: boolean
- `activeTabId`: string | null
- `theme`: 'dark' | 'light'
- `modals`: map of open modals

#### [NEW] [workspaceStore.ts](file:///home/rehan/GolandProjects/rester/frontend/src/state/workspaceStore.ts)
- `collections`: list of Collection objects
- `environments`: list of Environment objects
- `activeEnvironmentId`: string | null
- `tabs`: list of Tab objects (for persistence)
- Actions: `addCollection`, `removeCollection`, `addTab`, `closeTab`.

#### [NEW] [executionStore.ts](file:///home/rehan/GolandProjects/rester/frontend/src/state/executionStore.ts)
- `results`: map of `requestId -> Response`
- `loading`: map of `requestId -> boolean`
- Actions: `setResult`, `setLoading`, `clearResult`.

### Integration

#### [MODIFY] [App.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/App.tsx)
- Remove any local `useState` that should be global.
- Initialize stores on startup.

#### [MODIFY] [Sidebar.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/components/Sidebar.tsx) (and others)
- Connect to the new Zustand stores.

## Verification Plan

### Automated Tests
- **Zustand Store Tests**: Write unit tests for each store using `@testing-library/react-hooks` or similar.
- **Serialization Test**: Verify that `workspaceStore` can be stringified and parsed back.

### Manual Verification
- Open multiple tabs, restart the app, and verify they are restored.
- Toggle sidebar and verify performance remains smooth (no stutter).
- Rename a request and verify it updates in the sidebar before the backend call finishes (optimistic update).
