# Tasks: Clean Architecture Boundaries

**Input**: Design documents from `/specs/005-clean-architecture/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are explicitly requested in the specification for verifying modularity and independent execution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create core project structure in `backend/internal/` and `backend/handlers/`
- [ ] T002 [P] Initialize `go.mod` if needed and verify dependencies (Wails, etc.)
- [ ] T003 [P] Configure Go linting and formatting in the root directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create core service interfaces in `backend/internal/core/services.go`
- [ ] T005 [P] Define shared domain models (Request, Response, AST) in `backend/internal/core/models.go`
- [ ] T006 Implement the `bootstrap` container for manual DI in `backend/internal/bootstrap/container.go`
- [ ] T007 [P] Define global error types in `backend/internal/core/errors.go`
- [ ] T008 [P] Setup logging service interface in `backend/internal/core/logger.go`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Headless Request Execution (Priority: P1) 🎯 MVP

**Goal**: Execute HTTP requests using the core engine without starting the Wails GUI.

**Independent Test**: Run `go test ./backend/internal/executor/...` with a sample `.http` file.

### Tests for User Story 1
- [ ] T009 [P] [US1] Create unit tests for .http parser in `backend/internal/parser/parser_test.go`
- [ ] T010 [P] [US1] Create unit tests for execution engine in `backend/internal/executor/executor_test.go`

### Implementation for User Story 1
- [ ] T011 [P] [US1] Implement VS Code style .http Lexer in `backend/internal/parser/lexer.go`
- [ ] T012 [P] [US1] Implement AST-based .http Parser in `backend/internal/parser/parser.go`
- [ ] T013 [US1] Implement HTTP Execution Service in `backend/internal/executor/executor.go` (depends on parser)
- [ ] T014 [US1] Add variable resolution logic in `backend/internal/executor/variables.go`
- [ ] T015 [US1] Implement request cancellation logic in `backend/internal/executor/cancellation.go`

**Checkpoint**: User Story 1 is functional; core engine can execute requests headlessly.

---

## Phase 4: User Story 2 - Swappable Storage Implementation (Priority: P2)

**Goal**: Isolate storage layer via interfaces to support both SQLite and Mocks.

**Independent Test**: Use a MockStorage implementation in a test case and verify no SQLite dependency.

### Tests for User Story 2
- [ ] T016 [P] [US2] Create unit tests for SQLite storage in `backend/internal/storage/sqlite_test.go`
- [ ] T017 [P] [US2] Implement MockStorage for testing in `backend/internal/storage/mock_storage.go`

### Implementation for User Story 2
- [ ] T018 [P] [US2] Implement SQLite storage provider in `backend/internal/storage/sqlite.go`
- [ ] T019 [US2] Implement request history persistence in `backend/internal/storage/history.go`
- [ ] T020 [US2] Implement workspace/collection filesystem watcher in `backend/internal/storage/watcher.go`
- [ ] T021 [US2] Integrate storage into the `bootstrap` container in `backend/internal/bootstrap/container.go`

**Checkpoint**: Storage is isolated; application state can be persisted or mocked.

---

## Phase 5: User Story 3 - Lean Wails Bridge (Priority: P1)

**Goal**: Refactor Wails handlers to be minimal bridge layers.

**Independent Test**: Verify `app.go` contains no business logic; all calls are delegated to `container.Services`.

### Implementation for User Story 3
- [ ] T022 [US3] Refactor `NewApp` to accept the bootstrap container in `backend/app.go`
- [ ] T023 [US3] Migrate business logic from `app.go` to specific core services
- [ ] T024 [P] [US3] Create lean handlers for Execution in `backend/handlers/execution.go`
- [ ] T025 [P] [US3] Create lean handlers for Workspace in `backend/handlers/workspace.go`
- [ ] T026 [US3] Bind all handlers to Wails in `backend/main.go`

**Checkpoint**: UI and Backend are perfectly decoupled; Wails only acts as a bridge.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T027 [P] Update `README.md` and `quickstart.md` with the new architecture details
- [ ] T028 Perform final check for circular dependencies using `go list -f '{{.ImportPath}} -> {{.Imports}}' ./backend/...`
- [ ] T029 [P] Document all core interfaces in `backend/internal/core/services.go`
- [ ] T030 Final validation of "independent runnable" engine by creating a minimal `cmd/rester-cli/main.go`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - US1 and US2 can proceed in parallel.
  - US3 depends on the completion of service implementations in US1/US2.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Foundation -> US1.
- **User Story 2 (P2)**: Foundation -> US2.
- **User Story 3 (P1)**: US1 + US2 -> US3.

---

## Parallel Example: User Story 1

```bash
# Launch parser and executor implementation together:
Task: "Implement .http Lexer in backend/internal/parser/lexer.go"
Task: "Implement HTTP Execution Service in backend/internal/executor/executor.go"
```

---

## Implementation Strategy

### MVP First (Headless Engine)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Headless Execution)
4. **STOP and VALIDATE**: Run `go test` on the core engine.

### Incremental Delivery

1. Foundation ready.
2. Add Headless Engine (US1) -> Demo via tests.
3. Add Isolated Storage (US2) -> Demo history saving.
4. Refactor Wails Bridge (US3) -> Restore UI functionality.
