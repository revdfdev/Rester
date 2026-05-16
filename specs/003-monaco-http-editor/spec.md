# Feature Specification: Dual-Mode Request Editor (Form + Monaco)

## Overview
Implement a "best of both worlds" request editor that provides a Postman-like Form UI for structured editing and a Monaco-based text editor for raw `.http` file manipulation. Both views are synchronized bidirectionally in real-time.

## Clarifications
### Session 2026-05-16
- Q: Preference between Form-Only UI vs Bidirectional Sync with Text Editor? → A: Bidirectional Sync: Both a Form UI and a Text Editor (Monaco) are available; changes in one instantly reflect in the other.

## User Scenarios & Testing

### User Story 1 - Seamless Mode Switching (Priority: P1)
As a developer, I want to switch between a structured Form UI and a raw Text view without losing my current request state.

**Acceptance Scenarios**:
1. **Given** I am in Form mode, **When** I add a header `X-Test: value`, **Then** switching to Text mode should show that header in the `.http` syntax.
2. **Given** I am in Text mode, **When** I change the method from `GET` to `POST`, **Then** switching back to Form mode should show the POST method selected in the dropdown.

## Requirements

### Functional Requirements
- **FR-001**: System MUST provide a toggle to switch between "Form" and "Text" modes.
- **FR-002**: System MUST maintain bidirectional real-time synchronization between the Form UI state and the Monaco Editor content.
- **FR-003**: The Form UI MUST include structured inputs for:
  - HTTP Method (Dropdown)
  - URL (Text Input with Variable Support)
  - Query Parameters (Key-Value Grid)
  - Headers (Key-Value Grid)
  - Body (Textarea or nested Monaco instance with type selector)
- **FR-004**: Changes in the Form UI MUST be serialized to standard `.http` syntax.
- **FR-005**: Raw text in the Monaco editor MUST be parsed into the Form UI model.
- **FR-006**: The Form UI MUST include a "Request Navigator" (e.g., a sub-tabs or dropdown) to switch between multiple request blocks defined in a single file via `###` separators.
- **FR-007**: When switching between requests in the Navigator, the Form UI MUST update its fields to reflect the selected request block.
- **FR-008**: The Form UI MUST include dedicated tabs for "Pre-request" and "Tests" scripts, mapping to `<% ... %>` blocks.
- **FR-009**: Script blocks MUST be synchronized between Form tabs and their respective locations in the Monaco text editor.
- **FR-010**: The Form UI MUST treat the first comment line (`#` or `//`) immediately preceding a request block as its "Display Name".
- **FR-011**: Updating the "Display Name" in the Form UI MUST update the corresponding comment line in the `.http` file.
- **FR-012**: The application MUST include a global "Environment" selector that reads and writes to standard `http-client.env.json` files.
- **FR-013**: Variable resolution (`{{...}}`) in both Form UI and Monaco Editor MUST be driven by the active environment selected.
