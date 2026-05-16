# Feature Specification: Collections Explorer Sidebar

Build a robust, developer-focused sidebar for Rester to manage and navigate collections and environments.

## Requirements

### Core Explorer
- **Folder Tree Structure**: Recursive directory-based navigation.
- **Collapsible Folders**: Persistence of toggle state.
- **File Icons**: Specialized icons for `.http` files and generic files.
- **Smooth Performance**: Virtualized or optimized rendering for collections with 1000+ items.

### Environment Management
- **Environments Section**: Dedicated area to switch between environment files.
- **Quick Selection**: Visual indicator of the active environment.

### Interactions & Actions
- **CRUD Operations**: Create, Rename, and Delete for both folders and files.
- **Context Menus**: Right-click actions for fast management.
- **Keyboard Navigation**: Arrow keys to navigate, `Enter` to open, `F2` to rename, `Delete` to remove.

### Technical Constraints
- Use **React Component Composition** (Atomic design).
- State managed via **Zustand**.
- Minimal bridge calls to Go (batch metadata requests).

## User Flows
1. **Navigating**: User expands a folder and clicks an `.http` file to open it in a new tab.
2. **Organizing**: User creates a "V1" folder and drags existing requests into it (future scope, but layout must support it).
3. **Environment Switching**: User clicks the "production" environment in the status bar or sidebar to switch context.
