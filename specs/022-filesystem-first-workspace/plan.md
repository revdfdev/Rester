# Plan: Filesystem-First REST Workspace Architecture

## Tech Stack & Architecture
- **Go Backend**: `WorkspaceManager` utilizes `fsnotify` for recursive workspace directory watching.
- **Wails Bridge**: Broadcasts events to the frontend via `runtime.EventsEmit`.
- **React Frontend**: Zustand stores reactively trigger `loadCollections()` on event capture.

## Proposed Components
1. **WorkspaceWatcher Integration**: Recursive fsnotify watching.
2. **Wails Event Handler Hook**: React lifecycle mounting listener.
3. **Save Dialog Extension Normalizer**: Clean `.http` extension resolver in tab saving.
