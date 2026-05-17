# Tasks: Filesystem-First REST Workspace Architecture

## Phase 1: Go Backend Watcher Integration
- [x] Modify `workspace.go` to support recursive fsnotify directory watching and callback trigger
- [x] Modify `app.go` to bind backend watcher callback to Wails event emitter
- [x] Execute `go test ./...` to verify Go backend compiles and passes tests

## Phase 2: Frontend Reactive Integration & Extensions Guard
- [x] Modify `workspaceSlice.ts` in `saveTab` to dynamically resolve and enforce exactly one `.http` extension on new saves
- [x] Modify `App.tsx` to subscribe to `"workspace:changed"` Wails event and reload collections tree reactively
- [x] Execute `npm run build` in the frontend to verify bundler and typing integrity
