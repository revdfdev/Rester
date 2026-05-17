# Project Context: Rester

**Last Updated**: 2026-05-17
**Updated By**: Performed a thorough architectural cleanup and removal pass. Removed the dead backend `MockStorage` package, deleted the Postman-style in-memory `SaveRequestModal` component, and streamlined request saving to a pure filesystem-first workflow with atomic Zustand document state synchronization.

## Project Identity

- **Name**: Rester
- **Type**: web-app (Wails Desktop)
- **Purpose**: Lightweight local-first desktop API client
- **Domain**: Developer Tools / API Testing

## Technology Stack

### Languages & Versions
- Go: 1.25.0+ (upgraded by 005-clean-architecture)
- React: 18+
- TypeScript: latest

### Frameworks & Libraries
- Wails: v2
- Monaco Editor: latest
- Zustand: latest
- fsnotify: latest (added for workspace watching)
- react-virtuoso: latest (added for high-performance JSON rendering)
- Web Workers: utilized for background JSON processing
- Vitest: added for frontend state and service testing

### Storage
- modernc.org/sqlite: latest (CGO-free SQLite driver)
- Local Filesystem: (.http files)

### Testing
- Go Testing: standard unit tests in `backend/pkg/...`

## Project Structure

```
/
├── main.go             # Application Entry Point
├── app.go              # Wails App Lifecycle
cmd/
└── rester-cli/         # Headless CLI Proof of Concept
```

## API Surface (Internal/Wails)

| Method | Path | Purpose |
|--------|------|---------|
| Execute | app.Execute | Executes an HTTP request with variable resolution |
| GetCollections | app.GetCollections | Lists available collections |
| SetActiveEnv | app.SetActiveEnv | Switches active environment |
| GetWorkspaceMetadata | app.GetWorkspaceMetadata | Loads persistent UI state (tabs, expanded folders) |
| SaveWorkspaceMetadata | app.SaveWorkspaceMetadata | Persists UI state to the workspace folder |
| GetRecentWorkspaces | workspace.GetRecentWorkspaces | Queries the list of recently opened workspace directories |
| RemoveRecentWorkspace | workspace.RemoveRecentWorkspace | Deletes a workspace directory from history records |
| GetWindowState | app.GetWindowState | Fetches the saved window size, maximize, and position parameters |
| SaveWindowState | app.SaveWindowState | Atomically persists window coordinates and maximize bounds |
| ReadFile | app.ReadFile | Reads file content from local filesystem |
| SaveFile | app.SaveFile | Writes file content to local filesystem |
| ParseContent | document.ParseContent | Parses .http content into AST nodes |
| SerializeNode | document.SerializeNode | Serializes AST node back to .http text |

## Runtime Dependency Graph

```
[Frontend :WailsRuntime] → [Backend :Bridge] → [Core Services] → [SQLite/FS]
```

## Local Dev Runbook

1. `wails dev` (Starts backend and frontend in dev mode)
2. `go test ./backend/internal/...` (Runs core unit tests)

## Data Model Overview

### Entities (Cross-Feature)
- **Request** (defined in 001-local-api-client):
  - Purpose: Single HTTP request definition
  - Key fields: ID, Method, URL, Headers, Body
- **AST Node** (defined in 002-http-parser-ast):
  - Purpose: Parsed element of an .http file
- **Environment** (defined in 001-local-api-client):
  - Purpose: Variable substitution set
- **Tab & WorkspaceMetadata** (added by 015-response-viewer):
  - Purpose: Persistent UI session state and open editor tabs
  - Key fields: ID, Path, IsDirty, OpenTabs, ActiveTabId

## Domain Glossary

| Term | Definition |
|------|-----------|
| .http file | A standard text-based format for defining HTTP requests |
| Collection | A folder containing multiple .http files |

## External Integrations

- **Any target API**: The engine executes requests against external hosts (added by 004-http-execution-engine)

## Development Workflow

- **Branch Strategy**: Feature branches numbered `###-feature-name`
- **Commit Convention**: standard
- **Build Command**: `wails build`
- **Test Command**: `go test ./...`

## Architecture Patterns

- **Code Organization**: Clean Architecture (Interfaces in `internal/core`)
- **Error Handling**: Bridge layer translates core errors to UI messages
- **State Management**: Zustand in frontend, Manual DI in backend
- **Naming Conventions**: standard Go/React conventions

## Recent Features

- 029-filesystem-first-workspace: Refactored the application into a filesystem-first REST workspace architecture. Integrated a recursive fsnotify watcher in the Go backend that automatically monitors the workspace directory for external changes, dynamically watching newly created subdirectories, and broadcasts "workspace:changed" events to the frontend via Wails. Subscribed the React layout to automatically reload the collection tree. Guarded the file-save workflow to resolve and enforce exactly one .http extension suffix, preventing duplicate file extensions.
- 028-activedocument-architecture: Introduced a centralized, synchronized ActiveDocument architecture for filesystem-backed request workflows. Refactored the Go backend directory scanner to dynamically shallow-parse `.http` files on disk, automatically extracting HTTP methods and custom `@name` comment tags to hydrate collections metadata. Updated the Vite React frontend's mapping slice to be 100% case-resilient, guaranteeing flawless deserialization across all Go capitalized and JS lowercase properties.
- 027-architectural-cleanup-and-removal: Performed a comprehensive cleanup pass. Deleted dead backend `MockStorage` packages, eliminated Postman-style in-memory save request modals, and fully simplified request saving to a native desktop filesystem-first workflow using `SaveFileDialog`. Refactored Zustand `workspaceSlice` actions atomically to synchronize the visual document registry and shortcuts when tabs are saved or items are renamed.
- 026-cleanup-and-stabilization: Completed a comprehensive architecture cleanup and stabilization pass. Consolidated duplicate types in `types/index.ts` to export directly from the canonical `types.ts` source of truth. Refactored `workspaceSlice.ts` to convert all remaining static Wails imports into runtime lazy dynamic-imports inside method callbacks, fully decoupling the Zustand state definition from Wails. Validated compiler integrity with successful Vite production builds and Go backend test suites.
- 025-wails-refactor: Refactored visual application layer to cleanly decouple UI components from direct Wails IPC bridge bindings via centralized Zustand store actions. Transformed static binding references in AdvancedSettings into dynamic runtime imports (`await import(...)`), enabling Vite to perform chunk-splitting that reduces the initial JS bundle size and boosts startup loading speed. Verified Go backend core packages have absolutely zero Wails/GUI dependencies, guaranteeing seamless CLI reusability.
- 024-http-execution-engine: Rebuilt Go-based execution engine to support workspace-isolated execution clients, persistent workspace-scoped SQLite cookie jars with domain/path matching rules, redirection limits/policies, SSL validation bypasses, and comprehensive trace logs.
- 023-sqlite-persistence-layer: Refactored persistence logic to store execution history, recent workspaces, open tabs, expanded directory structures, and window coordinate/size parameters in SQLite. Wrote a robust database layer with migrations, indices, and transaction boundaries using WAL mode, and built a premium glassmorphic Recent Workspaces modal and quick-start card panel for frictionless workspace jumping.
- 022-environment-manager: Developed Go SaveEnvironments and UpdateVariable in EnvironmentManager to marshal IntelliJ http-client.env.json files, exposed Wails bridge bindings, built a visual-first glassmorphic EnvironmentModal React manager supporting CRUD operations, and implemented a 1s debounced background filesystem autosave thread to prevent state drift.
- 021-stability-enhancements: Resolved SQLite database locks (SQLITE_BUSY) via MaxOpenConns(1) and debounced wailsStorage/saveMetadata; silenced ErrNotExist file logs; added composite React keys and null-safety guards.
- 020-visual-first-workspace: Refactored architecture into a visual-first API workspace with .http as the canonical source of truth, a synchronized Visual Builder UI, real-time request naming, optional raw source editor companion with debounced sync, active block decorators, syntax diagnostics, and premium dark/brand-primary component aesthetics.
- 018-frontend-refactor: Major refactor establishing a design-system-driven architecture with a unified Zustand slice-based store and core UI primitives.
- 017-settings-ui: Implemented a high-fidelity Settings UI with persistent configuration and real-time theme/editor synchronization.
- 007-performance-optimization: Optimized for low memory and fast startup via lazy loading and virtualization
- 006-frontend-state-management: Refactored frontend state using Zustand partitioned stores
- 015-response-viewer: Implemented a production-grade response rendering system with virtualization, background JSON processing, and 1MB+ payload safety.
- 004-http-execution-engine: Finalized the E2E execution flow with high-performance variable resolution and workspace-relative persistence.
- 005-clean-architecture: Refactored and enforced clean architecture boundaries and fixed SQLite concurrency issues.

## Configuration

- **Config Files**: `wails.json`, `.http` files, `sqlite.db`

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual context below this line -->
<!-- MANUAL ADDITIONS END -->