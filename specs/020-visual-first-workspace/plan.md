# Implementation Plan: Visual-First API Workspace

**Branch**: `020-visual-first-workspace` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/020-visual-first-workspace/spec.md`

## Summary

Transition Rester from an editor-centric tool to a visual-first API workspace. The primary interaction will be through structured forms and a clean request builder, while preserving the portability and Git-friendliness of `.http` files. A centralized document store will synchronize visual UI state with an internal AST, ensuring zero data loss and high performance.

## Technical Context

**Language/Version**: Go 1.25+, TypeScript 5+  
**Primary Dependencies**: Wails v2, React, Zustand, fsnotify  
**Storage**: Local Filesystem (.http, .json), SQLite (Session Metadata)  
**Testing**: Vitest for document state sync, Go tests for AST serialization  
**Target Platform**: Desktop (Windows, macOS, Linux)
**Project Type**: Desktop-Native API Client  
**Performance Goals**: 60fps UI responsiveness, instantaneous document serialization  
**Constraints**: Zero proprietary binary formats for collection data  
**Scale/Scope**: Optimized for teams using Git-based API collaboration

## Constitution Check

- [x] **Visual-First**: GUI is the primary driver, not text.
- [x] **Portable Documents**: .http is the internal representation.
- [x] **Zero Drift**: Continuous sync between UI state and file content.

## Project Structure

### Documentation (this feature)

```text
specs/020-visual-first-workspace/
├── plan.md              # This file
├── research.md          # Sync model and preservation strategy
├── data-model.md        # VisualDocument and Sync flow
├── quickstart.md        # User and Dev setup
├── contracts/           # DocumentService bridge
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/
├── pkg/
│   ├── parser/          # [MODIFY] Added Serializer for VisualDocument
│   └── document/        # [NEW] Document state synchronization logic
└── handlers/
    └── document.go      # [NEW] Bridge for SyncToDocument/SyncFromDocument

frontend/
├── src/
│   ├── components/
│   │   ├── VisualBuilder/ # [NEW] Modular cards for URL, Auth, Body, etc.
│   │   └── Editor/
│   │       └── SourceView.tsx # [RENAME] Optional raw source editor
│   ├── state/
│   │   └── slices/
│   │       └── documentSlice.ts # [NEW] Centralized reactive state
│   └── services/
│       └── documentService.ts # [NEW] Bridge to backend sync
```

## Phased Roadmap

### Phase 1: Document Store & Synchronization
1. Implement the `VisualDocument` state in Zustand.
2. Build the backend `Serializer` to convert UI state to valid `.http`.
3. Implement the `DocumentService` bridge for two-way sync.

### Phase 2: Visual Builder Components
1. Develop modular UI components for Method, URL, and Params.
2. Build structured editors for Headers and Authentication.
3. Integrate Monaco as an optional "Source View" toggle.

### Phase 3: Workspace & Environment Refactor
1. Update the Sidebar to act as a visual explorer for the FS.
2. Implement the visual Environment management screen.
3. Add the sidecar SQLite storage for session-only metadata.

### Phase 4: Migration & Validation
1. Implement a "Visual-First" onboarding flow for existing workspaces.
2. Verify zero-data-loss during complex AST serialization.
3. Optimize performance for 60fps UI updates during sync.

## Risk Areas
- **State Divergence**: Users editing both visually and via text simultaneously (Mitigation: atomic transactions and FS lock detection).
- **Complexity**: Handling complex `.http` features (scripts, multi-part) in a simple GUI (Mitigation: use "Advanced" disclosure panels or raw fallback).
- **Performance**: High-frequency sync between frontend and backend (Mitigation: debounce serialization and use binary bridge for large bodies).
