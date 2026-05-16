# Feature Specification: Request History

**Feature Branch**: `016-request-history`
**Created**: 2026-05-16
**Status**: Draft
**Input**: Build request history UI. Requirements: searchable history, timestamp display, response status indicators, reopen previous requests, persistent local storage, optimized rendering for large history.

## Overview
Implement a sidebar or dedicated view to track and manage historical API requests. Users should be able to quickly find, analyze, and re-execute previous requests with full context preservation.

## User Scenarios & Testing

### User Story 1 - Quick Search (Priority: P1)
As a developer, I want to search through my request history by URL or method so that I can find a specific execution from earlier today.

**Success Criteria**:
- Real-time filtering of history items as the user types.
- Highlights matching text in the URL/Method.

### User Story 2 - Re-execution (Priority: P1)
As a developer, I want to click on a history item to restore it to the editor so that I can re-run it with or without modifications.

**Success Criteria**:
- Clicking a history item populates the Request Editor with all saved state (Method, URL, Headers, Body).

### User Story 3 - Persistence (Priority: P2)
As a developer, I want my history to be saved between application restarts so that I don't lose my work.

**Success Criteria**:
- History is persisted to local storage (SQLite or JSON file via Wails).

## Requirements

### Functional Requirements
- **FR-001**: **Searchable List**: MUST provide a sidebar list of previous requests with search/filter capabilities.
- **FR-002**: **Metadata Display**: EACH item MUST show Method (colored), URL, Timestamp (relative), and Status Code.
- **FR-003**: **Reopen**: MUST restore the full request state to the active editor tab when selected.
- **FR-004**: **Persistent Storage**: MUST use a local persistence layer to store up to 1000 history items.
- **FR-005**: **Clear History**: MUST provide an action to clear all history or delete individual items.

### Technical Requirements
- **TR-001**: Use `react-virtuoso` for optimized rendering of large history lists.
- **TR-002**: Use a Wails-based persistence helper to save history to the user's data directory.
- **TR-003**: Ensure state restoration handles all `RequestBlock` fields (Headers, Params, Body, Scripts).

## Success Criteria
- SC-001: History list renders 500+ items without scroll lag.
- SC-002: Searching is instantaneous (debounced < 100ms).
- SC-003: Request restoration completes in < 50ms.
