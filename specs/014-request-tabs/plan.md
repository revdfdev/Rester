# Implementation Plan: Request Tabs System

## Proposed Changes

### State Management
#### [MODIFY] [workspaceStore.ts](file:///home/rehan/GolandProjects/rester/frontend/src/state/workspaceStore.ts)
- Refine the `Tab` interface to include `method` and `lastAccessed`.
- Enhance `addTab` to ensure correct ordering (append to end).
- Implement `reorderTabs` for future drag-and-drop support.
- Ensure `persist` middleware correctly handles the tab list.

### Components
#### [MODIFY] [TabBar.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/components/Editor/TabBar.tsx)
- Add context menu support for "Close All", "Close Others", and "Copy Path".
- Implement horizontal scrolling for many tabs.
- Add tooltips for full file paths.

#### [NEW] [TabItem.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/components/Editor/TabItem.tsx)
- Extract individual tab logic for memoization.
- Handle method-specific colors.
- Manage close button hover states.

### Keyboard & Integration
#### [MODIFY] [App.tsx](file:///home/rehan/GolandProjects/rester/frontend/src/App.tsx)
- Add global keyboard event listeners for tab navigation.
- Ensure shortcuts don't conflict with Monaco Editor defaults.

## Verification Plan
### Automated Tests
- `npm test` (if unit tests are configured)
- Verify state persistence by reloading the app.

### Manual Verification
- Open multiple requests from the sidebar.
- Switch between them and verify Monaco content updates.
- Modify content, verify dirty dot appears.
- Close tabs and verify active tab shifts correctly.
