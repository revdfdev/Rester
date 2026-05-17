# Spec: Rester Architectural Stabilization & Cleanup

## Overview
Perform a full architectural cleanup and removal pass before introducing new filesystem-first workflows.

## Functional Requirements
- Remove conflicting Postman-style in-memory saving modals (`SaveRequestModal.tsx`).
- Remove internal database-driven request/collection persistence from SQLite.
- Retain only history, recent workspaces, and session/tab states in SQLite.
- Eliminate disconnected request state systems and duplicated request payload models.
- Simplify state ownership to treat active tabs mapping directly to `.http` file paths.
- Seamlessly synchronize visual editor forms and raw source editor content.

## SQLite Requirements
- Remove canonical request persistence.
- Retain:
  - `history`
  - `workspace_meta`
  - `recent_workspaces`
  - `workspace_tabs`
  - `workspace_session`
  - `window_state`
  - `cookies`

## Non-Functional Requirements
- Maintain premium visual design and layout.
- Ensure Vite typecheck and compilation pass.
- Ensure Go backend test suites pass.
