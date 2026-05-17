# Implementation Plan: Editor-First API Workspace

**Branch**: `019-editor-first-workspace` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/019-editor-first-workspace/spec.md`

## Summary

Refactor the Rester architecture to be natively `.http`-driven. The filesystem becomes the primary database, and the Monaco editor becomes the primary interface. A new Parser pipeline will synchronize the text editor and structured form UI via a shared AST, enabling a true "Git-friendly" developer workflow.

## Technical Context

**Language/Version**: Go 1.25+, TypeScript 5+  
**Primary Dependencies**: Monaco Editor, Wails v2, Zustand, fsnotify, react-virtuoso  
**Storage**: Local Filesystem (.http, .json), SQLite (Session Metadata only)  
**Testing**: Go unit tests for Parser, Vitest for Frontend State  
**Target Platform**: Windows, macOS, Linux (via Wails)
**Project Type**: Desktop Application (Wails)  
**Performance Goals**: < 2s workspace scan, zero-latency AST synchronization  
**Constraints**: < 150MB memory footprint, no database-driven collection state  
**Scale/Scope**: Optimized for 100+ files per workspace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Filesystem-First**: All API data is stored in standard text formats on disk.
- [x] **Principle II: AST-Driven UI**: Form UI is a projection of the document, not a separate state.
- [x] **Principle III: Git Compatibility**: No binary blobs or complex DB schemas for collections.

## Project Structure

### Documentation (this feature)

```text
specs/019-editor-first-workspace/
├── plan.md              # This file
├── research.md          # Parser and sync strategy
├── data-model.md        # Workspace, Document, AST entities
├── quickstart.md        # User and Dev setup
├── contracts/           # WorkspaceHandler bridge
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/
├── pkg/
│   ├── parser/          # [NEW] Lexer, Parser, AST nodes
│   ├── workspace/       # [MODIFY] FS-native workspace manager
│   └── core/            # [MODIFY] Shared models (FileNode, RequestBlock)
└── handlers/
    └── workspace.go     # [MODIFY] Exposed methods for FS/AST

frontend/
├── src/
│   ├── state/
│   │   └── slices/
│   │       ├── workspaceSlice.ts  # [MODIFY] FS-native tree state
│   │       └── editorSlice.ts     # [MODIFY] AST-driven document state
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── RequestEditor.tsx  # [MODIFY] Unified Monaco + Form
│   │   │   └── FormEditor.tsx     # [MODIFY] AST node-based renderer
│   │   └── Sidebar/
│   │       └── TreeExplorer.tsx   # [MODIFY] Virtualized FS tree
│   └── utils/
│       └── http-parser.ts         # [REPLACE] Bridge to backend parser
```

**Structure Decision**: Using the existing Wails structure but enforcing a strict boundary where the backend handles all Parsing and FS operations, and the frontend handles Rendering and State Orchestration.

## Phased Roadmap

### Phase 1: Core Parser & FS Infrastructure
1. Implement Go Lexer/Parser for `.http`.
2. Update `WorkspaceManager` to scan filesystem directly.
3. Expose `ParseContent` and `ReadFile/SaveFile` via Wails.

### Phase 2: AST-Driven State Management
1. Refactor `workspaceSlice` and `editorSlice` to use the new `FileNode` AST.
2. Implement the "Document Transformation" logic (AST -> Text).
3. Connect Monaco edits to the Parser.

### Phase 3: UI Refactor & Synchronization
1. Update `FormEditor` to render based on AST nodes.
2. Implement bidirectional sync between Monaco and Form.
3. Optimize Sidebar with virtualization (`react-virtuoso`).

### Phase 4: Migration & Cleanup
1. Implement "Export current DB to .http" utility.
2. Remove legacy SQLite collection tables and services.
3. Final verification of Git-friendly workflows.

## Risk Areas
- **Large Files**: Parsing 10k+ line `.http` files on every keystroke could lag (Mitigation: use debouncing and background workers).
- **Format Divergence**: Ensuring our parser matches VS Code Rest Client exactly (Mitigation: comprehensive test suite using VS Code sample files).
- **FS Permissions**: Handling locked files or restricted directories (Mitigation: clear error reporting in UI).
