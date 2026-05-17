# Data Model: Editor-First API Workspace

## Core Entities

### 1. Workspace
- **Purpose**: Root directory for all API-related assets.
- **Attributes**:
  - `Path`: Absolute filesystem path.
  - `Name`: Workspace display name (folder basename).
  - `Metadata`: Persistent settings stored in `rester.db`.

### 2. Collection (Virtual)
- **Purpose**: Represents a filesystem directory within the workspace.
- **Attributes**:
  - `Path`: Relative path from workspace root.
  - `Files`: List of `.http` files in this directory.
  - `Subfolders`: List of child collections.

### 3. Document
- **Purpose**: An open `.http` file being edited.
- **Attributes**:
  - `Path`: Relative path.
  - `RawContent`: Full text of the file.
  - `AST`: List of `RequestBlock` nodes.
  - `IsDirty`: Boolean flag for unsaved changes.

### 4. RequestBlock (AST Node)
- **Purpose**: A single executable unit within a document.
- **Attributes**:
  - `ID`: Unique identifier (derived from `@name` or line number).
  - `Name`: Optional display name.
  - `Method`: HTTP Verb.
  - `URL`: Target endpoint.
  - `Headers`: Key-value pairs.
  - `Body`: Request payload.
  - `LineRange`: `[Start, End]` in the source document.

### 5. Environment
- **Purpose**: Set of variables for substitution.
- **Source**: Loaded from `environments/*.json`.
- **Attributes**:
  - `Name`: Filename.
  - `Variables`: Flat JSON object.

## State Transitions

| Trigger | Action | Result |
|---------|--------|--------|
| App Start | Scan Workspace | Sidebar populated with FileTree |
| File Click | Load Document | Parser generates AST; Editor opens |
| Monaco Edit | Re-parse | AST updated; Form UI re-renders |
| Form Edit | Transform Document | Monaco text updated via AST range replacement |
| Save | Write to Disk | `.http` file updated; `IsDirty` reset |
| External Change | FS Watcher Trigger | App prompts to reload or auto-refreshes |
