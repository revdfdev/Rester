# Implementation Plan: Request History UI & Persistence

**Branch**: `016-request-history` | **Date**: 2026-05-16 | **Spec**: [016-request-history/spec.md](file:///home/rehan/GolandProjects/rester/specs/016-request-history/spec.md)

## Summary
Implement a high-performance history sidebar with local persistence. Each executed request will be captured and stored, allowing users to search and restore previous states.

## Technical Context
- **Persistence**: Use a JSON-based store in the user data directory (via Wails).
- **Rendering**: `react-virtuoso` for virtualization of the history list.
- **State Management**: New `historyStore.ts` using Zustand.
- **Interactions**: Clicking a history item will trigger a `restoreBlock` action in `editorStore.ts`.

## Project Structure

### Documentation
```text
specs/016-request-history/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code Revisions
```text
frontend/src/
├── components/
│   └── Sidebar/
│       ├── HistorySidebar.tsx  # Main sidebar panel
│       └── HistoryItem.tsx     # Individual history entry
├── state/
│   └── historyStore.ts         # Logic for managing and persisting history
└── utils/
    └── history-persistence.ts   # Wails bridge for local storage
```

## complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Virtualization | Handle 1000+ items smoothly | Standard mapping causes DOM bloat and scroll jitter with large history. |
| Deep State Capture | Restore scripts and complex bodies | Shallow capture would lose critical request context (e.g., pre-request scripts). |

## Verification Plan

### Automated Tests
- Unit tests for history filtering logic.
- Persistence tests ensuring state survives reload.

### Manual Verification
- Execute 50+ requests and verify search performance.
- Verify that a request with complex headers and body is restored exactly as it was.
- Check that the "Clear All" action works and persists.
