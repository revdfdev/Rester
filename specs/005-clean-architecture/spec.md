# Feature Specification: Clean Architecture Boundaries

**Feature Branch**: `005-clean-architecture`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Refactor and enforce clean architecture boundaries. Requirements: Wails must only act as a bridge layer, business logic must not exist inside Wails handlers, core engine must remain independently runnable without UI, parser, executor, storage, and testing systems must be isolated modules, frontend must communicate through stable service APIs, avoid circular dependencies, avoid singleton-heavy architecture, use interfaces where future extensibility matters, prepare architecture for future CLI support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Headless Request Execution (Priority: P1)

As a developer, I want to execute HTTP requests using the core engine without starting the Wails GUI so that I can run automated tests or use a CLI.

**Why this priority**: Core requirement for modularity and "independent runnable" engine.

**Independent Test**: Create a Go test file in `backend/internal/executor` that imports the parser and executor directly and runs a successful `.http` file execution.

**Acceptance Scenarios**:

1. **Given** a valid `.http` file, **When** passed to the core engine's execution service, **Then** it should return results without any reference to Wails or UI components.
2. **Given** the core package, **When** imported by a minimal `main.go` (CLI), **Then** it should compile and run successfully.

---

### User Story 2 - Swappable Storage Implementation (Priority: P2)

As a developer, I want the storage layer to be isolated via interfaces so that I can use in-memory mocks for testing and SQLite for production.

**Why this priority**: Ensures "independently testable" modules and avoids "singleton-heavy" architecture.

**Independent Test**: Verify that the `storage` module defines an interface and that a mock implementation can be used in unit tests for other services.

**Acceptance Scenarios**:

1. **Given** a service that requires persistence, **When** initialized, **Then** it should accept a storage interface rather than a concrete SQLite connection.
2. **Given** unit tests, **When** running, **Then** they should use an in-memory storage implementation.

---

### User Story 3 - Lean Wails Bridge (Priority: P1)

As a developer, I want the Wails handlers to be minimal so that the UI logic and business logic are clearly separated.

**Why this priority**: Prevents "logic leak" and ensures the UI is just a view on the core services.

**Independent Test**: Inspect `backend/handlers/` (or equivalent) and ensure no business logic (like URL parsing or HTTP calling) exists there.

**Acceptance Scenarios**:

1. **Given** a Wails handler call, **When** executed, **Then** its only responsibility should be to call a method on a core service and return the result.
2. **Given** a change in business logic, **When** implemented, **Then** the Wails handlers should remain unchanged.

---

### Edge Cases

- **Circular Dependencies**: How do we prevent the `executor` from needing the `storage` while the `storage` needs the `executor` for some reason? (Use a `service` layer or dependency inversion).
- **Initialization Order**: How are services started and wired together? (Should use a central "App" or "Container" structure).
- **CLI vs. GUI Config**: How are environment variables or workspace paths passed to the engine? (Should be via config structs passed during initialization).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define a `backend/internal/core` (or equivalent) package that houses high-level service interfaces.
- **FR-002**: System MUST isolate `parser`, `executor`, `storage`, and `testing` into separate Go packages without circular dependencies.
- **FR-003**: Wails bindings MUST reside in a separate layer (e.g., `backend/handlers`) and only call core service interfaces.
- **FR-004**: System MUST use manual constructor-based dependency injection to wire components together, avoiding runtime DI frameworks.
- **FR-005**: All core services MUST be independently testable with mocks.
- **FR-006**: System MUST NOT use global singletons for state management; instead, stateful objects should be passed via dependency injection.
- **FR-007**: System MUST provide a stable API (Go interfaces) for the frontend to interact with.
- **FR-008**: Architecture MUST support a future CLI by ensuring all essential features are accessible via a command-line wrapper.

### Key Entities *(include if feature involves data)*

- **Service Interface**: Defines the contract for a module (e.g., `ParserService`, `ExecutorService`).
- **Dependency Container**: A structure that holds and wires all service instances.
- **Bridge Layer**: The glue between Wails/CLI and the core services.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Wails handlers MUST be under 10 lines of code (excluding error handling/boilerplate).
- **SC-002**: No circular dependencies MUST exist in the `backend/` directory (verifiable via `go list`).
- **SC-003**: Unit test coverage for the `executor` and `parser` MUST be achievable without mock Wails contexts.
- **SC-004**: Adding a new storage implementation (e.g., JSON file instead of SQLite) MUST NOT require changes to the `executor` or `parser`.
