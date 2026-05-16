# Tasks: Robust .http Parser

## Phase 1: Setup & Data Models
- [x] T001 [P] Expand `ASTNode` and define `RequestNode`, `HeaderNode`, `ScriptBlock` in `backend/pkg/core/models.go`
- [x] T002 [P] Update `ParserService` interface in `backend/pkg/core/services.go` to return `FileNode` or similar root AST.

## Phase 2: Lexer Refactor
- [x] T003 Implement state-machine Lexer in `backend/pkg/parser/lexer.go`
- [x] T004 Add support for `@variable` definitions and `{{ref}}` placeholders
- [x] T005 Add support for script blocks `< % ... % >`
- [x] T006 Add support for `###` delimiters

## Phase 3: Parser Implementation
- [x] T007 Implement Recursive Descent Parser in `backend/pkg/parser/parser.go`
- [x] T008 Implement metadata extraction (e.g., `@name` comments)
- [x] T009 Implement multiline body support
- [x] T010 Implement error reporting with line/column context

## Phase 4: Integration & Tests
- [x] T011 Update `bootstrap` container in `backend/pkg/bootstrap/container.go`
- [x] T012 Write comprehensive unit tests in `backend/pkg/parser/parser_test.go`
- [x] T013 Verify backward compatibility with existing `Executor` (or update Executor if needed)

## Phase 5: Documentation & Polish
- [x] T014 Document the AST structure in `docs/architecture/parser.md`
- [x] T015 Final performance check against SC-001 (50ms for 1000 lines)
