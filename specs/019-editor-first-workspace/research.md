# Research: Editor-First API Workspace

## Decision: Parser Implementation Strategy
**Decision**: Hand-written Lexer and Recursive Descent Parser.
**Rationale**: The `.http` format (RFC 2616 inspired) is relatively simple but has edge cases like multipart bodies and script blocks (`< % % >`) that are easier to handle with a hand-written parser. This also allows for better error recovery and partial AST generation, which is critical for real-time editor feedback.
**Alternatives considered**: 
- **PEG.js**: Rejected because we need the same parser logic in both Go (backend) and TypeScript (frontend for editor highlighting/folding). A hand-written parser is easier to port or share via WASM.
- **Regex-only**: Rejected as it fails to handle nested structures, comments, and multiple requests per file reliably.

## Decision: Editor-Form Synchronization Strategy
**Decision**: One-way Data Flow with AST "Source-of-Truth".
**Rationale**: 
1. The **Document** (text) is the absolute source.
2. The **AST** is the structured projection of that document.
3. Both **Monaco** and **Form UI** are renderers/editors for the document/AST.
To avoid synchronization loops:
- Monaco edits trigger a re-parse -> AST update -> Form update.
- Form edits trigger an AST update -> Document transformation -> Monaco update.
We will use a "Transaction" model where each change is an atomic update to the document text.
**Alternatives considered**:
- **Dual-State Sync**: Maintaining separate state for Form and Editor. Rejected as it inevitably leads to drift and "lost updates".

## Decision: Filesystem Watching Strategy
**Decision**: `fsnotify` (Go) + WebSocket/Wails Events.
**Rationale**: Wails provides a good bridge for events. Using a robust Go library like `fsnotify` ensures we handle platform-specific FS events (Inotify, FSEvents, ReadDirectoryChangesW) correctly. The backend will watch the workspace and emit "WorkspaceChanged" events to the frontend.
**Alternatives considered**:
- **Frontend File System API**: Rejected as it has limited browser support and restricted access to the full filesystem.

## Decision: Migration Path
**Decision**: Phased Side-by-Side Migration.
**Rationale**: 
- **Phase 1**: Implement the Parser and Filesystem-based Sidebar.
- **Phase 2**: Implement the Document-based Editor (Monaco + AST Form).
- **Phase 3**: Deprecate the SQLite collection model and provide a "One-time Export to .http" for existing users.
This minimizes risk and allows users to opt-in to the new workflow.
