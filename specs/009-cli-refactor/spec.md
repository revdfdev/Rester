# Feature Specification: CLI-Ready Backend Refactor

**Feature Branch**: `009-cli-refactor`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Refactor backend architecture to support future CLI execution. Requirements: request execution engine must be UI-independent, parser must work without Wails, environments must be reusable, workspace loading must be reusable, executor should support headless execution, prepare for future commands like: myclient run auth/login.http --env dev"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Headless File Execution (Priority: P1)

As a DevOps engineer, I want to run a specific `.http` file from the command line so that I can automate API testing in CI/CD.

**Why this priority**: Core requirement for CLI support.

**Independent Test**: Run a command in `cmd/rester-cli/main.go` that takes a file path, parses it, and executes the first request.

**Acceptance Scenarios**:

1. **Given** a valid `.http` file path, **When** running the CLI, **Then** it should parse the file and execute the request successfully.
2. **Given** an invalid file path, **When** running the CLI, **Then** it should return a clear "file not found" error.

---

### User Story 2 - Environment Selection (Priority: P1)

As a developer, I want to specify an environment (e.g., `dev`, `prod`) when running a request via CLI so that I can target different servers.

**Why this priority**: Essential for multi-stage development.

**Independent Test**: Run the CLI with `--env dev` and verify that variables from the `dev` environment are resolved.

**Acceptance Scenarios**:

1. **Given** multiple environment files, **When** specifying one via CLI, **Then** only those variables should be used for resolution.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST decouple the `WorkspaceService` from any UI-specific logic.
- **FR-002**: MUST implement a `Runner` service that orchestrates parsing, environment resolution, and execution.
- **FR-003**: MUST support loading environments from standard locations (e.g., `http-client.env.json`).
- **FR-004**: MUST provide a way to find and select specific requests within a `.http` file by name or index.
- **FR-005**: MUST ensure all core services are initialized via the `bootstrap` container without requiring Wails runtime.

### Key Entities *(include if feature involves data)*

- **Runner**: Orchestrator for headless execution.
- **WorkspaceManager**: Reusable logic for navigating and loading `.http` files.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of core logic must be testable via `go test` without a display server.
- **SC-002**: The `cmd/rester-cli` must be able to execute a full request lifecycle (parse -> resolve -> run) in under 500ms (excluding network latency).
