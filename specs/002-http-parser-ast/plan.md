# Implementation Plan: Robust .http Parser with AST Generation

## Overview
We will implement a hand-written recursive descent parser for `.http` files. This will replace the basic heuristic-based parser currently in `backend/pkg/parser/`. The new architecture will strictly separate Lexing (tokenization) from Parsing (structure building), ensuring robustness and extensibility for future protocols like GraphQL and gRPC.

## User Review Required

> [!IMPORTANT]
> **Extensibility**: The AST nodes will be designed as interfaces or structs with type-switch capabilities to allow adding `GraphQLRequest` or `GRPCRequest` later without breaking the core `FileNode` structure.

> [!NOTE]
> **Compatibility**: We are targeting the VS Code REST Client specification. This includes `@variable` definitions and `###` delimiters.

## Proposed Changes

### Core Parser Package

#### [MODIFY] [lexer.go](file:///home/rehan/GolandProjects/rester/backend/pkg/parser/lexer.go)
- Refactor to a state-machine based lexer (Hand-written, no regex for core transitions).
- Support state-based tokenization (e.g., transition from `URL` state to `HEADERS` state).
- Tokens: `IDENTIFIER`, `STRING`, `METHOD`, `URL`, `HEADER_KEY`, `HEADER_VALUE`, `BODY`, `VARIABLE_REF`, `VARIABLE_DEF`, `COMMENT`, `SEPARATOR`, `SCRIPT_BLOCK`.

#### [MODIFY] [parser.go](file:///home/rehan/GolandProjects/rester/backend/pkg/parser/parser.go)
- Implement `FileNode` as the root of the AST.
- Implement `RequestNode` containing:
    - `Name` (from `@name` comment or metadata)
    - `Method`
    - `URL`
    - `Headers` (list of `HeaderNode`)
    - `Body` (raw string or `ContentNode`)
    - `PreRequestScript` / `TestScript` (extracted from `< % ... % >` blocks).
- Implement error reporting with `Line` and `Column` tracking.

#### [MODIFY] [models.go](file:///home/rehan/GolandProjects/rester/backend/pkg/core/models.go)
- Expand `ASTNode` to support a more hierarchical structure.
- Add `ScriptBlock` type for pre-request/test scripts.

### Dependency Injection

#### [MODIFY] [container.go](file:///home/rehan/GolandProjects/rester/backend/pkg/bootstrap/container.go)
- Wire the new `Parser` implementation into the container.

## Verification Plan

### Automated Tests
- `go test ./backend/pkg/parser/...`:
    - Test single GET/POST requests.
    - Test multiple requests with `###`.
    - Test variable extraction in URL and Headers.
    - Test script block extraction.
    - Test named requests (metadata).
    - Test error reporting on malformed headers.

### Manual Verification
- Use a large `.http` file with 50+ requests and verify AST generation speed.
- Verify that a request with a multiline body is correctly parsed.
