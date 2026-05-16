# Project Context: Rester

**Last Updated**: 2026-05-16
**Updated By**: Feature 005-clean-architecture

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
| ReadFile | app.ReadFile | Reads file content from local filesystem |
| SaveFile | app.SaveFile | Writes file content to local filesystem |

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