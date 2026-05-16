# Frontend State Architecture

Rester uses **Zustand** for global state management, partitioned into three specialized stores to ensure scalability, performance, and clear boundaries.

## Stores Overview

### 1. `UIStore` (useUIStore)
- **Purpose**: Handles ephemeral UI state that does not need to persist across sessions.
- **State**: `sidebarOpen`, `activeTabId`, `theme`, `modals`.
- **Usage**: Layout toggles, modal control, theme switching.

### 2. `WorkspaceStore` (useWorkspaceStore)
- **Purpose**: Handles domain-specific data that must be serializable and persistent.
- **State**: `tabs`, `collections`, `environments`.
- **Persistence**: Automatically saved to `localStorage` using the `persist` middleware.
- **Usage**: Tab management, collection tree, environment selection.

### 3. `ExecutionStore` (useExecutionStore)
- **Purpose**: Handles high-frequency request execution data.
- **State**: `results`, `loading`.
- **Isolation**: Kept separate from `WorkspaceStore` to avoid heavy persistence calls during request execution.
- **Usage**: Showing response data, loading spinners, execution history.

## Best Practices

### Selective Selectors
Always use selective selectors to minimize re-renders. 
**Incorrect**:
```javascript
const state = useUIStore();
```
**Correct**:
```javascript
const sidebarOpen = useUIStore(state => state.sidebarOpen);
```

### Optimistic Updates
When performing actions that involve backend persistence (e.g., renaming a request), update the `WorkspaceStore` immediately and handle potential rollbacks in the action logic.
