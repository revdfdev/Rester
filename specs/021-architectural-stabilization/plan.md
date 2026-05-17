# Plan: Rester Architectural Stabilization & Cleanup

## Architecture
- Streamline Save logic to utilize Wails `SaveFileDialog` directly for unsaved tabs.
- Ensure all visual state and document updates are atomically handled in Zustand stores.

## Proposed Changes

### Backend
- Delete dead `MockStorage` packages in `backend/pkg/storage/mock_storage.go`.

### Frontend
- Remove `SaveRequestModal.tsx` from components directory.
- Wire Save button in `RequestEditor.tsx` directly to `saveTab` in the Zustand store.
- Update `workspaceSlice.ts` to atomically update the `documents` registry and projection shortcuts when files are saved or renamed.
