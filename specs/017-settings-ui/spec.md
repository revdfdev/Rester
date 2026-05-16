# Feature Specification: Settings UI

**Feature Branch**: `017-settings-ui`
**Created**: 2026-05-16
**Status**: Draft
**Input**: Build settings UI. Requirements: theme settings, request timeout settings, editor settings, workspace settings, environment management, import/export settings, keyboard shortcuts section.

## Overview
Implement a comprehensive settings modal to allow users to customize the application behavior, appearance, and global configurations. The settings should be persistent and affect the application in real-time where applicable.

## User Scenarios & Testing

### User Story 1 - Theme Customization (Priority: P1)
As a user, I want to switch between different themes (Dark, Light, System) so that I can customize the app's appearance to my preference.

**Success Criteria**:
- Theme changes immediately upon selection.
- Preference is persisted across restarts.

### User Story 2 - Request Timeout (Priority: P1)
As a developer, I want to set a global request timeout so that my requests don't hang indefinitely if a server is unresponsive.

**Success Criteria**:
- Timeout setting (in ms) is applied to all outgoing requests.
- Setting is validated (must be a positive number).

### User Story 3 - Keyboard Shortcuts (Priority: P2)
As a power user, I want to view all available keyboard shortcuts so that I can improve my productivity.

**Success Criteria**:
- A dedicated section lists all shortcuts (e.g., Ctrl+Enter to send, Ctrl+S to save).

## Requirements

### Functional Requirements
- **FR-001**: **Theming**: MUST support Dark, Light, and System themes.
- **FR-002**: **Request Configuration**: MUST allow setting a global timeout (default 30s).
- **FR-003**: **Editor Customization**: MUST allow toggling line numbers, minimap, and font size in Monaco.
- **FR-004**: **Environment Management**: MUST provide a global view to manage environments (Create, Delete, Rename).
- **FR-005**: **Data Portability**: MUST provide options to Import and Export application data (Collections, Environments).
- **FR-006**: **Persistence**: ALL settings MUST be persisted to the local configuration file.

### Technical Requirements
- **TR-001**: Use a new `settingsStore.ts` (Zustand) for global settings state.
- **TR-002**: Use a Wails-based bridge to save settings to `rester.config.json` in the user's config directory.
- **TR-003**: Integrate theme changes with TailwindCSS and Monaco Editor.

## Success Criteria
- SC-001: Settings modal opens and closes smoothly.
- SC-002: Settings are applied immediately (real-time preview).
- SC-003: App reloads with the last saved settings correctly.
