# Implementation Plan: Application Performance Optimization

## Overview
We will implement a series of targeted optimizations across the frontend and backend to achieve fast startup times and low memory footprints. The strategy focuses on "on-demand" loading and efficient resource management.

## User Review Required

> [!IMPORTANT]
> **Virtualization**: We will introduce a virtualization library (e.g., `react-window` or `virtuoso`) for large lists. This is a new dependency.

> [!NOTE]
> **Monaco Lazy Loading**: Monaco will only be initialized when a request tab is active, which might introduce a small delay on the first tab open.

## Proposed Changes

### Frontend Optimization

#### [MODIFY] [App.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/App.tsx)
- Implement `React.lazy` for the Editor component.
- Use `Suspense` with a lightweight skeleton.

#### [NEW] [VirtualRequestList.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/components/VirtualRequestList.tsx)
- Use virtualization to render only visible requests in the sidebar.

#### [MODIFY] [executionStore.ts](file:///home/rehan/GolandProjects/rester/frontend/src/state/executionStore.ts)
- Implement throttling for state updates during batch execution.

### Backend Optimization

#### [MODIFY] [sqlite.go](file:///home/rehan/GolandProjects/rester/backend/pkg/storage/sqlite.go)
- Add indexes on `path` and `created_at` columns.
- Optimize the `GetCollections` query to be shallow (load metadata only).

#### [MODIFY] [executor.go](file:///home/rehan/GolandProjects/rester/backend/pkg/executor/executor.go)
- Implement a buffer for response bodies to handle large streams without high memory allocation.

## Verification Plan

### Automated Tests
- **Startup Benchmark**: Write a script to measure startup time.
- **Memory Profile**: Run `go tool pprof` on the backend during large response processing.

### Manual Verification
- Load a collection with 500 requests and check scroll performance.
- Open a 5MB JSON file and verify the UI remains responsive.
- Check RAM usage in Task Manager/Activity Monitor.
