# Feature Specification: Collection Import/Export System

**Feature Branch**: `010-import-export`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Implement collection import/export system. Requirements: import Postman collections, export collections, preserve environments, preserve folder hierarchy, support .http workspace export, ensure portability, avoid proprietary lock-in"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Postman Migration (Priority: P1)

As a new user, I want to import my existing Postman collection so that I can switch to Rester without manual effort.

**Why this priority**: Essential for user acquisition and onboarding.

**Independent Test**: Use a sample Postman v2.1 collection JSON and verify that all requests, folders, and variables are correctly converted to `.http` files and directories.

**Acceptance Scenarios**:

1. **Given** a valid Postman v2.1 JSON file, **When** importing, **Then** it should create a directory structure matching the collection folders and generate valid `.http` files for each request.
2. **Given** Postman environment variables, **When** importing, **Then** it should generate a corresponding `http-client.env.json` file.

---

### User Story 2 - Workspace Export (Priority: P1)

As a developer, I want to export my entire Rester workspace as a portable format (e.g., ZIP or directory) so that I can share it with colleagues.

**Why this priority**: Core collaboration requirement.

**Independent Test**: Trigger an export of a workspace and verify that the resulting output contains all `.http` files and environments in the correct hierarchy.

**Acceptance Scenarios**:

1. **When** exporting a workspace, **Then** it should preserve the folder structure and all file contents exactly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST support Postman Collection Format v2.1.
- **FR-002**: MUST convert Postman tests/scripts to Goja-compatible JavaScript (best effort).
- **FR-003**: MUST preserve folder hierarchy during both import and export.
- **FR-004**: MUST map Postman variables (`{{var}}`) to Rester variable syntax.
- **FR-005**: MUST export environments into the standard `http-client.env.json` format.
- **FR-006**: MUST support importing from and exporting to a local directory or a ZIP archive.

### Key Entities *(include if feature involves data)*

- **Importer**: Core logic for converting external formats to Rester's native `.http` structure.
- **Exporter**: Logic for packaging Rester workspaces for portability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Successful conversion of 95%+ of standard HTTP requests from a Postman collection (URL, Method, Headers, Body).
- **SC-002**: 100% preservation of folder hierarchy during import/export.
- **SC-003**: Generated `.http` files must be valid and runnable by the Rester executor immediately after import.
