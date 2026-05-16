# Implementation Plan: Dual-Mode Request Editor (Form + Monaco)

**Branch**: `003-monaco-http-editor` | **Date**: 2026-05-16 | **Spec**: [003-monaco-http-editor/spec.md](file:///home/rehan/GolandProjects/rester/specs/003-monaco-http-editor/spec.md)

## Summary
Implement a high-performance, dual-view editor for `.http` requests. The system features a structured Form UI (Postman-style) for rapid configuration and a Monaco-based text editor for power-user flexibility, synchronized bidirectionally in real-time.

## Technical Context
- **Language/Version**: TypeScript / React 18
- **Primary Dependencies**: `@monaco-editor/react`, `zustand`, `lucide-react`, `lodash.debounce`
- **Storage**: `.http` file segments (FileSystem via Wails)
- **Testing**: Vitest + React Testing Library
- **Target Platform**: Desktop (Wails)
- **Performance Goals**: Mode switching < 50ms, Serialization < 20ms
- **Constraints**: Standard `.http` syntax compliance, no proprietary metadata

## Constitution Check
- **Library-First**: Parsing and serialization logic will be extracted into a standalone `http-parser` utility.
- **CLI Interface**: Parser logic is shared with `rester-cli` for consistency.
- **Test-First**: Unit tests for parser/serializer required before UI implementation.

## Project Structure

### Documentation (this feature)
```text
specs/003-monaco-http-editor/
├── plan.md              # This file
├── research.md          # Synchronisation and Parsing strategies
├── data-model.md        # RequestBlock and EnvironmentState definitions
├── quickstart.md        # User-facing usage guide
├── contracts/           # Internal state synchronization schemas
└── tasks.md             # Implementation tasks
```

### Source Code
```text
frontend/src/
├── components/
│   ├── Editor/
│   │   ├── RequestEditor.tsx    # Main container + Toggle
│   │   ├── FormEditor/          # Postman-style UI components
│   │   │   ├── MethodUrlBar.tsx
│   │   │   ├── KeyValueGrid.tsx
│   │   │   └── ScriptTabs.tsx
│   │   └── MonacoEditor/        # Monaco wrapper + Highlighter
│   └── common/
│       └── RequestNavigator.tsx # Multi-request switcher
├── state/
│   └── editorStore.ts           # Sync logic and active block tracking
└── utils/
    ├── http-parser.ts           # .http -> Form state
    └── http-serializer.ts       # Form state -> .http
```

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Bidirectional Sync | Core user requirement for "Postman-style" while keeping .http format | Form-only lacks power-user flexibility; Text-only lacks accessibility. |
