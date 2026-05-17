# Research: Visual-First API Workspace

## Decision: Synchronization Model
**Decision**: Two-way Reactive Store -> AST -> Document.
**Rationale**: In a visual-first architecture, the UI state (Zustand) must be the primary driver. Changes in the UI should update the `VisualDocument` state, which then triggers an incremental AST update and document serialization. If the user switches to the "Advanced Source View" and edits text, the reverse happens (Text -> AST -> UI State). This ensures the UI is always responsive and the document is always portable.
**Alternatives considered**:
- **Direct AST Editing**: Editing the AST directly from UI components. Rejected as it makes UI state management (validation, intermediate states) too complex.

## Decision: Handling "Unsupported" .http Features
**Decision**: "Preservation Blocks" in AST.
**Rationale**: Standard `.http` files may contain pre-request scripts, complex metadata, or vendor-specific tags that our visual builder doesn't (yet) support. To maintain portability, the parser must identify these sections as "Uninterpreted Blocks" and preserve them during serialization, even if the user only edits the URL/Headers visually.
**Alternatives considered**:
- **Strip Unknowns**: Rejected as it breaks compatibility with other tools like VS Code REST Client.

## Decision: Visual Builder UX Pattern
**Decision**: Modular Card-based Form UI.
**Rationale**: Instead of a monolithic form, we will use modular sections (URL, Headers Table, Auth Drawer, Body Editor) that can be collapsed or rearranged. This feels modern and desktop-native, moving away from the "text file" feel.
**Alternatives considered**:
- **Classic Form Layout**: Rejected as it feels too static and "web-formy".

## Decision: Local Metadata Storage
**Decision**: Sidecar `.rester/session.db`.
**Rationale**: UI-only state (which tab is active, which sections are collapsed) shouldn't pollute the `.http` files. We will store this in a local SQLite database within a hidden `.rester` folder in the workspace root.
**Alternatives considered**:
- **Global App SQLite**: Rejected as it makes workspaces less portable between machines.
