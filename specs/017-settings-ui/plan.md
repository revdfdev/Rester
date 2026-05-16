# Implementation Plan: Settings UI & Configuration

**Branch**: `017-settings-ui` | **Date**: 2026-05-16 | **Spec**: [017-settings-ui/spec.md](file:///home/rehan/GolandProjects/rester/specs/017-settings-ui/spec.md)

## Summary
Implement a tabbed settings modal with persistent storage. The settings will control UI themes, request timeouts, and editor behaviors.

## Technical Context
- **Persistence**: Save settings to `~/.config/rester/config.json` (or OS equivalent) via a backend bridge.
- **Theme**: Use Tailwind's `dark` mode and Monaco's theme API.
- **State**: `settingsStore.ts` using Zustand.
- **UI**: A modal overlay with a sidebar for categories (General, Editor, Request, Advanced).

## Project Structure

### Documentation
```text
specs/017-settings-ui/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code Revisions
```text
frontend/src/
├── components/
│   └── Settings/
│       ├── SettingsModal.tsx      # Main modal container
│       ├── GeneralSettings.tsx    # Theme, Language
│       ├── EditorSettings.tsx     # Monaco config
│       ├── RequestSettings.tsx    # Timeouts, Proxy
│       └── ShortcutSection.tsx    # Keyboard shortcut list
├── state/
│   └── settingsStore.ts           # Settings state and actions
└── utils/
    └── config-bridge.ts           # Wails bridge for config persistence
```

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Real-time Sync | Instant feedback on theme/font size | Manual "Save" button would feel clunky for UI-only changes. |
| Global Timeout Injection | Apply setting to every 'Execute' call | Hardcoding defaults would require per-request overrides everywhere. |

## Verification Plan

### Automated Tests
- Unit tests for `settingsStore` to ensure default values are correct.
- Verification that `config.json` is correctly serialized and deserialized.

### Manual Verification
- Change theme and verify it applies to all components (including Monaco).
- Set timeout to 1ms and verify requests fail with a timeout error.
- Verify that closing/reopening the app preserves all settings.
- Test the "Reset to Defaults" functionality.
