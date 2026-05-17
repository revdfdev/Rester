# Quickstart: Visual-First API Workspace

## For Users
1. **New Request**: Click the "+" button in the sidebar to open a clean visual builder.
2. **Build Visually**: Enter your URL, add params in the table, and select your Auth type.
3. **Advanced**: Toggle the "Source" button if you need to see or edit the underlying `.http` code.
4. **Git**: Committing your workspace folder automatically saves your visual requests in a portable format.

## For Developers
1. **Zustand Store**: All visual state is in `frontend/src/state/slices/documentSlice.ts`.
2. **Serialization**: See `backend/pkg/parser/serializer.go` for how the UI state is turned into `.http`.
3. **UI Components**: Visual cards are located in `frontend/src/components/VisualBuilder/`.
