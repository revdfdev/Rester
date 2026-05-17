# Quickstart: Editor-First API Workspace

## For Users
1. **Open a Folder**: Launch Rester and select a folder containing `.http` files.
2. **Edit Anywhere**: Use the Monaco editor for full control or the Sidebar form for quick tweaks.
3. **Save**: Press `Ctrl+S` to persist changes directly to the `.http` file.
4. **Git Sync**: Just use your normal terminal or Git client; Rester stays in sync automatically.

## For Developers
1. **Parser Tests**: Run `go test ./backend/pkg/parser/...` to verify the AST generation.
2. **Frontend State**: Inspect the `workspaceSlice` in the React DevTools to see the active AST.
3. **Bridge Verification**: Check the Wails console for `FileSystem` event logs.
