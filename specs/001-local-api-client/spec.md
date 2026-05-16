# Feature Specification: Local-First Desktop API Client (Rester)

**Feature Branch**: `001-local-api-client`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Build a lightweight local-first desktop API client using Wails, Go, React, TypeScript, and SQLite. Core principles: offline-first, lightweight, low RAM usage, fast startup, Git-friendly, .http-first workflow, no cloud dependency, cross-platform support. Primary features: HTTP request execution, support GET/POST/PUT/PATCH/DELETE, request tabs, collections, folder-based workspaces, .http file support, environment variables, history, response viewer, pretty/raw response rendering, headers/cookies/timing view, cURL import, collection import/export, API testing support, JavaScript-based test scripts, pre-request scripts. Architecture requirements: Go backend engine separated from Wails UI bindings, modular architecture, AST-based .http parser, parser independent from executor, SQLite for local persistence, Monaco editor integration, Zustand for frontend state management. MVP scope: execute HTTP requests, save/load .http files, collections explorer, environments, response viewer, history, basic testing. Avoid: cloud sync, authentication accounts, AI integrations, enterprise collaboration features, telemetry requirements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Request Execution (Priority: P1)

As a developer, I want to quickly type an HTTP request and see the response so that I can debug my API without leaving my local environment.

**Why this priority**: This is the core functionality of the tool. Without it, the application has no value.

**Independent Test**: Can be fully tested by opening the app, typing a URL, selecting a method, and clicking "Send".

**Acceptance Scenarios**:

1. **Given** the application is open, **When** I enter "https://api.github.com" and click "Send", **Then** I should see the JSON response in the response viewer.
2. **Given** a new request tab, **When** I change the method to POST and add a JSON body, **Then** the system should execute a POST request with that body.

---

### User Story 2 - Local File Management (Priority: P1)

As a developer, I want to save my requests into `.http` files on my disk so that I can check them into Git and share them with my team.

**Why this priority**: "Git-friendly" and ".http-first" are core principles. This differentiates the tool from Postman.

**Independent Test**: Can be tested by creating a request, clicking "Save", choosing a file path, and verifying the file contents on disk.

**Acceptance Scenarios**:

1. **Given** a request in a tab, **When** I click "Save", **Then** I should be prompted for a file path and the request should be written in standard `.http` format.
2. **Given** an existing `.http` file on disk, **When** I open it in Rester, **Then** I should be able to execute the requests defined within it.

---

### User Story 3 - Collection Organization (Priority: P2)

As a tester, I want to organize related requests into collections and folders so that I can manage large API surfaces efficiently.

**Why this priority**: Important for organizing work, especially as projects grow.

**Independent Test**: Can be tested by creating a collection, adding a folder, and moving requests into that folder.

**Acceptance Scenarios**:

1. **Given** the collections explorer, **When** I create a new collection, **Then** it should appear as a top-level directory in my workspace.
2. **Given** a request, **When** I drag it into a folder, **Then** it should be moved and its location on disk (if applicable) should be updated.

---

### User Story 4 - Environment Variables (Priority: P2)

As a developer, I want to define variables for different environments (e.g., Local, Staging) so that I can switch between them without changing the request definition.

**Why this priority**: Essential for professional API development workflows.

**Independent Test**: Can be tested by defining a variable `{{baseUrl}}`, using it in a request, and switching between environments to see the target URL change.

**Acceptance Scenarios**:

1. **Given** an environment "Local" with `host=localhost:8080`, **When** I use `{{host}}` in a request and select "Local", **Then** the request should target localhost.
2. **Given** multiple environments, **When** I switch environments, **Then** all subsequent requests should use the newly selected variables.

---

### Edge Cases

- **Large Response Handling**: What happens when a response is several megabytes of JSON? (System should truncate or handle gracefully without crashing/lagging).
- **Network Timeouts**: How does the system handle a request that takes too long or a host that is unreachable? (Clear error message and timing information should be displayed).
- **Invalid .http Syntax**: How does the parser handle a malformed `.http` file? (Show syntax errors in the editor using Monaco).
- **Duplicate File Names**: How does the folder-based workspace handle name collisions? (Prompt for overwrite or rename).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support standard HTTP methods (GET, POST, PUT, PATCH, DELETE).
- **FR-002**: System MUST parse and execute standard `.http` files using an AST-based parser.
- **FR-003**: System MUST persist request history and collection metadata in a local SQLite database.
- **FR-004**: System MUST provide a Monaco-based editor for writing requests with syntax highlighting for `.http` files.
- **FR-005**: System MUST allow users to manage multiple request tabs simultaneously.
- **FR-006**: System MUST support environment variables with switching capabilities.
- **FR-007**: System MUST render responses in Pretty (formatted) and Raw views.
- **FR-008**: System MUST display request/response headers, cookies, and timing data.
- **FR-009**: System MUST allow importing requests via cURL commands.
- **FR-010**: System MUST support pre-request and test scripts written in JavaScript.
- **FR-011**: System MUST function entirely offline without any external cloud dependencies or telemetry.
- **FR-012**: System MUST use a folder-based workspace where each folder in the UI maps to a directory on the filesystem [NEEDS CLARIFICATION: Should the app track all files in a directory automatically, or only those manually added?].

### Key Entities *(include if feature involves data)*

- **Request**: Represents a single HTTP request, including URL, method, headers, body, and scripts. Maps to a block in a `.http` file.
- **Collection**: A logical grouping of requests, mapping to a folder on the filesystem.
- **Environment**: A set of key-value pairs used to substitute variables in requests.
- **History Record**: A log of a previously executed request and its response status/timing.
- **Workspace**: The root directory containing collections, `.http` files, and local configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application startup time MUST be under 2 seconds on a standard modern machine.
- **SC-002**: Memory usage (RAM) MUST stay under 150MB when idle with 5 tabs open.
- **SC-003**: A single HTTP request MUST be executable in under 500ms (excluding network latency).
- **SC-004**: Users MUST be able to import a 100-request Postman collection in under 5 seconds.
- **SC-005**: 100% of data MUST be stored locally on the user's machine (no network requests to any non-target host).
