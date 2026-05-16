# Research: Dual-Mode Request Editor

## Decision: Bidirectional Sync Strategy
**Decision**: Use a single source of truth (the raw `.http` string) in the `useWorkspaceStore`.
**Rationale**: By treating the text content as the source of truth, we can use a debounced parser to update the Form UI state. Changes in the Form UI will trigger a serialization function that updates the text.
**Alternatives considered**: Maintaining separate states for Form and Text and syncing them via effects (Risky for consistency and race conditions).

## Decision: Multi-Request Parsing
**Decision**: Utilize the existing `rester-cli` parser logic (ported to JS or called via Wails) to split the file into `RequestBlock` objects.
**Rationale**: Reuse existing AST/Lexer logic to ensure consistent behavior between CLI and Desktop.
**Alternatives considered**: Custom regex-based splitting (Fragile for complex files).

## Decision: Environment Resolution
**Decision**: Implement a `VariableResolver` utility that performs mustache-style replacement based on the active environment selected from `http-client.env.json`.
**Rationale**: Standardizes variable handling across the entire application and maintains compatibility with JetBrains/VS Code ecosystems.
**Alternatives considered**: Proprietary environment storage (Rejected due to portability requirement).
