# Tasks: Visual-First API Workspace

**Input**: Design documents from `/specs/020-visual-first-workspace/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create `backend/pkg/document/` directory for document state logic
- [x] T002 [P] Create `frontend/src/components/VisualBuilder/` directory for modular cards
- [x] T003 [P] Configure `vitest` for frontend state synchronization testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Implement `VisualDocument` state in `frontend/src/state/slices/documentSlice.ts`
- [x] T005 [P] Implement `Serializer` in `backend/pkg/parser/serializer.go` to convert UI state to .http
- [x] T006 [P] Create `DocumentHandler` in `backend/handlers/document.go` for Wails bridge
- [x] T007 Implement `documentService.ts` in `frontend/src/services/documentService.ts` for two-way sync
- [x] T008 Setup sidecar SQLite `session.db` in `backend/pkg/storage/sqlite.go` for local metadata

**Checkpoint**: Foundation ready - document synchronization pipeline is functional.

---

## Phase 3: User Story 1 - Visual Request Creation (Priority: P1) 🎯 MVP

**Goal**: Allow users to create and execute requests using a clean visual interface.

**Independent Test**: Create a GET request via the UI and execute it without seeing .http source.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `MethodUrlBar.tsx` in `frontend/src/components/VisualBuilder/`
- [x] T010 [P] [US1] Create `ParamsEditor.tsx` in `frontend/src/components/VisualBuilder/`
- [x] T011 [US1] Refactor `RequestEditor.tsx` in `frontend/src/components/Editor/` to use `VisualBuilder` by default
- [x] T012 [US1] Connect `MethodUrlBar` and `ParamsEditor` to `documentSlice.ts`
- [x] T013 [US1] Implement real-time URL-Param synchronization logic in `documentSlice.ts`

**Checkpoint**: User Story 1 is functional.

---

## Phase 4: User Story 2 - Structured Header & Param Editing (Priority: P1)

**Goal**: Manage complex request components in a structured, tabular format.

**Independent Test**: Add multiple headers via a table and verify they are correctly serialized to the .http file.

### Implementation for User Story 2

- [x] T014 [P] [US2] Create `HeadersEditor.tsx` in `frontend/src/components/VisualBuilder/`
- [x] T015 [P] [US2] Create `AuthEditor.tsx` in `frontend/src/components/VisualBuilder/`
- [x] T016 [P] [US2] Create `BodyEditor.tsx` in `frontend/src/components/VisualBuilder/`
- [x] T017 [US2] Implement autocomplete for common headers in `HeadersEditor.tsx`
- [x] T018 [US2] Map structured `Auth` forms (Bearer, Basic) to internal header state in `documentSlice.ts`

**Checkpoint**: User Story 2 is functional.

---

## Phase 5: User Story 3 - Visual Collections & Environment Explorer (Priority: P2)

**Goal**: Browse collections and manage environments using a visual tree.

**Independent Test**: Create a folder via the UI and verify it appears on the filesystem.

### Implementation for User Story 3

- [x] T019 [US3] Update `Sidebar.tsx` in `frontend/src/components/Sidebar/` to use `WorkspaceNode` models
- [x] T020 [P] [US3] Implement `EnvironmentManager.tsx` in `frontend/src/components/VisualBuilder/`
- [x] T021 [US3] Add right-click context menu for "New Collection" in `Sidebar.tsx`
- [x] T022 [US3] Implement FS-to-UI update logic for Environments in `workspaceSlice.ts`

**Checkpoint**: User Story 3 is functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final UI refinements and synchronization stability.

- [x] T023 [P] Implement `SourceView.tsx` as a secondary toggle in `frontend/src/components/Editor/`
- [x] T024 [P] Add "File changed on disk" banner in `RequestEditor.tsx`
- [x] T025 Optimize performance for 60fps UI updates during complex document sync
- [x] T026 Final verification of zero-data-loss during .http serialization

---

## Dependencies & Execution Order

- **Foundational (Phase 2)**: MUST complete before any User Story work.
- **User Story 1 & 2**: Can be worked on in parallel once Phase 2 is complete.
- **User Story 3**: Independent of US1/US2 but depends on Phase 2.
- **Polish**: Final stage after all stories are verified.
