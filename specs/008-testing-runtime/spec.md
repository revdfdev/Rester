# Feature Specification: JavaScript-based API Testing Runtime

**Feature Branch**: `008-testing-runtime`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Implement JavaScript-based API testing runtime. Requirements: isolated script execution, support assertions, expose request and response context, sandbox execution environment, timeout protection, use Goja JavaScript engine, support future reusable test libraries."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Assertions (Priority: P1)

As a developer, I want to verify that my API returns a 200 OK status so that I can ensure the service is healthy.

**Why this priority**: Fundamental requirement for any testing tool.

**Independent Test**: Execute a request with a test script `client.test("Status is 200", () => { client.assert(response.status === 200); });` and verify the test result is recorded.

**Acceptance Scenarios**:

1. **Given** a successful request, **When** the test script runs, **Then** the assertion should pass.
2. **Given** a failed request (e.g., 404), **When** the test script runs, **Then** the assertion should fail with a clear error message.

---

### User Story 2 - Response Context Access (Priority: P1)

As a developer, I want to access the JSON response body in my test script so that I can verify specific data fields.

**Why this priority**: Required for complex data validation.

**Independent Test**: Execute a request returning `{"id": 1}` and verify a test script `client.assert(response.body.id === 1);` passes.

**Acceptance Scenarios**:

1. **Given** a JSON response, **When** accessing `response.body`, **Then** it should be automatically parsed as a JavaScript object.
2. **Given** a non-JSON response, **When** accessing `response.body`, **Then** it should be available as a raw string.

---

### User Story 3 - Sandbox & Timeout (Priority: P2)

As a system administrator, I want test scripts to run in a sandbox with a timeout so that they cannot compromise the host system or hang the application.

**Why this priority**: Security and stability.

**Independent Test**: Run a script with an infinite loop `while(true) {}` and verify it is terminated after a defined timeout.

**Acceptance Scenarios**:

1. **Given** a long-running script, **When** execution exceeds 2 seconds, **Then** the engine should terminate the script with a "timeout" error.
2. **Given** a script trying to access `os` or `net` modules, **When** executed, **Then** it should fail because those globals are not exposed in the sandbox.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST use the `Goja` (ECMAScript 5.1+) engine for script execution.
- **FR-002**: MUST expose a `client` global object with `test(name, fn)` and `assert(condition, message)` methods.
- **FR-003**: MUST expose a `request` global object containing `url`, `method`, `headers`, and `body`.
- **FR-004**: MUST expose a `response` global object containing `status`, `headers`, and `body`.
- **FR-005**: MUST provide an isolated execution environment for each request.
- **FR-006**: MUST implement a configurable timeout (default 2s) for script execution.
- **FR-007**: MUST capture and report all test results (name, status, error) back to the execution engine.

### Key Entities *(include if feature involves data)*

- **TestResult**: Represents the outcome of a single `client.test` block.
- **ScriptRuntime**: The wrapper around the Goja VM that handles context injection and execution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Script execution overhead for a simple assertion MUST be < 50ms.
- **SC-002**: 100% of infinite loops MUST be caught and terminated by the timeout protector.
- **SC-003**: 100% of test results MUST be serializable and visible in the UI.
