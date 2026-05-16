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
| Execute | app.Execute | Executes an HTTP request |
| GetCollections | app.GetCollections | Lists available collections |
| SetActiveEnv | app.SetActiveEnv | Switches active environment |

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

- 007-performance-optimization: Optimized for low memory and fast startup via lazy loading and virtualization
- 006-frontend-state-management: Refactored frontend state using Zustand partitioned stores
- 005-clean-architecture: Refactored and enforced clean architecture boundaries
- 004-http-execution-engine: Implemented HTTP execution with timeout and cookies
- 003-monaco-http-editor: Implemented Dual-Mode Editor (Form + Monaco) with real-time bidirectional sync
- 002-http-parser-ast: Implemented .http lexer and parser
- 001-local-api-client: Initial setup and core client features

## Configuration

- **Config Files**: `wails.json`, `.http` files, `sqlite.db`

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual context below this line -->
<!-- MANUAL ADDITIONS END -->