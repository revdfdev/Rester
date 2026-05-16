# Tasks: Performance Optimization

## Phase 1: Frontend Lazy Loading & Rerender Optimization
- [x] T001 [P] Install `react-window` or `react-virtuoso` in the frontend
- [x] T002 Implement `React.lazy` for Monaco Editor integration
- [x] T003 Use `React.memo` for request list items and header components
- [x] T004 Optimize Zustand selectors to prevent unnecessary rerenders

## Phase 2: Backend SQLite & Memory Optimization
- [x] T005 [P] Add indexes to SQLite database for faster lookups
- [x] T006 Optimize `GetCollections` to avoid deep filesystem traversal on startup
- [x] T007 Implement shallow loading for large .http files (parse only metadata initially)

## Phase 3: Large Response & Batch Execution
- [x] T008 Implement virtualization in the response body viewer
- [x] T009 Add throttling to bridge calls for batch status updates
- [x] T010 Implement memory-efficient body buffering in the Executor

## Phase 4: Polish & Validation
- [x] T011 Perform cold startup benchmark (target < 2s)
- [x] T012 Conduct memory audit with 5MB+ responses
- [x] T013 Verify smooth UI performance (60fps) during heavy operations
