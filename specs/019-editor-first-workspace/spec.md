# Feature Specification: Editor-First API Workspace

**Feature Branch**: `019-editor-first-workspace`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Refactor the application architecture into an editor-first API workspace where .http documents are the canonical source of truth. Core architecture: .http files are the primary persisted format, collections are filesystem folders, environments are JSON files, Git-friendly workspace structure, no database-driven collection model, SQLite only for metadata/history. Application philosophy: editor-first workflow, forms assist editing, Monaco is primary interface, visual renderer for AST nodes, avoid Postman-style architecture."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filesystem-as-Collection (Priority: P1)

As a developer, I want my filesystem folders and `.http` files to be the only source of truth for my API collections, so that I can use standard Git workflows (branching, merging, PRs) to manage my API definitions without a separate database sync.

**Why this priority**: This is the core architectural shift. It eliminates the "import/export" friction and enables native Git collaboration, which is the primary value proposition of the refactor.

**Independent Test**: Can be tested by creating a folder with `.http` files manually and verifying the app reflects these as collections/requests immediately without any "Import" action.

**Acceptance Scenarios**:

1. **Given** a directory containing subfolders and `.http` files, **When** I open this directory as a workspace, **Then** the sidebar correctly renders the folder hierarchy and individual `.http` files as executable collections.
2. **Given** an open workspace, **When** I add a new `.http` file via an external editor or Git, **Then** Rester automatically detects the change and updates the sidebar without a restart.

---

### User Story 2 - Editor-Synchronized Form Rendering (Priority: P1)

As a developer, I want to switch between the Monaco source editor and a structured form view without losing state or experiencing data drift, so that I can use the form for quick adjustments and the editor for complex structures.

**Why this priority**: Critical for the "Editor-First" philosophy. It ensures that the form UI is just a "projection" of the document, not a competing state container.

**Independent Test**: Can be tested by typing in Monaco and verifying the form fields (Method, URL, Headers) update in real-time, and vice versa.

**Acceptance Scenarios**:

1. **Given** a `.http` file with a multi-line body, **When** I edit the URL in the structured form, **Then** the Monaco editor content is updated at the exact line/column corresponding to the URL in the AST.
2. **Given** an invalid `.http` document in the editor, **When** I switch to the form view, **Then** the system displays a clear parsing error and prevents data loss by not attempting to "force" the invalid state into a structured form.

---

### User Story 3 - Lightweight Environment Management (Priority: P2)

As a developer, I want to manage my environment variables in simple JSON files within the workspace, so that I can easily share them with my team and keep them under version control.

**Why this priority**: Essential for a Git-friendly workflow. Environments should be as easy to manage as the requests themselves.

**Independent Test**: Can be tested by creating a `dev.json` in an `environments/` folder and verifying the variables are available for substitution in requests.

**Acceptance Scenarios**:

1. **Given** an `environments/` folder, **When** I create a `.json` file with key-value pairs, **Then** the environment selector in the header populates with the filename as the environment name.
2. **Given** an active environment, **When** I modify the JSON file on disk, **Then** the active variables are updated in the execution context immediately.

---

### Edge Cases

- **Multiple Requests in One File**: How does the form renderer handle a `.http` file containing 10 separate requests separated by `###`? (Assumption: The form renders the "Active" request block based on the cursor position in the editor).
- **Malformed AST**: What happens when the user types invalid syntax that the parser cannot recover from? (System must fallback to Raw Editor mode and show syntax errors).
- **Massive Collections**: How does the system handle a workspace with 1,000 `.http` files? (Sidebar must use virtualization and the scanner must use a background thread to avoid UI blocking).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a Lexer -> Parser -> AST pipeline for `.http` files (RFC 2616 style).
- **FR-002**: System MUST use the `.http` file content as the single source of truth for the active editor state.
- **FR-003**: The Sidebar MUST be a direct reflection of the filesystem (folders and `.http` files).
- **FR-004**: System MUST support multiple requests per file, demarcated by `###`.
- **FR-005**: System MUST provide a "Structured Form" renderer that operates directly on AST nodes.
- **FR-006**: System MUST persist session state (active tab, expanded folders) in a local SQLite metadata store, NOT the collection data itself.
- **FR-007**: System MUST support environment variables stored in JSON files (`environments/*.json`).
- **FR-008**: System MUST implement a FileSystem watcher to keep the UI synchronized with external changes.

### Key Entities *(include if feature involves data)*

- **Workspace**: The root directory containing all collections, environments, and configuration.
- **RequestBlock (AST Node)**: A structured representation of a single request within a `.http` file, including Method, URL, Headers, Body, and Metadata.
- **Environment**: A set of key-value pairs loaded from a JSON file.
- **SessionState**: Volatile UI state (tabs, scroll positions, active block) persisted in SQLite.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zero Data Drift**: 100% of changes made in the Raw Editor are reflected in the Structured Form (and vice versa) via the AST pipeline.
- **SC-002**: **Performance**: Initial workspace scan and rendering of 100 files must complete in under 2 seconds.
- **SC-003**: **Format Fidelity**: 100% compatibility with standard VS Code REST Client (`.http` / `.rest`) files.
- **SC-004**: **Git Friendliness**: Workspace can be committed, pushed, and pulled without any binary conflicts or database migrations.
- **SC-005**: **Memory Usage**: The application maintains a memory footprint < 150MB even with a large workspace open.
