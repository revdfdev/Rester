# Feature Specification: HTTP Execution Engine

**Feature Branch**: `004-http-execution-engine`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Implement HTTP execution engine with timeout, redirects, cookies, and cancellation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Request Execution (Priority: P1)

As a developer, I want to execute HTTP requests and receive the status code, headers, and body so that I can verify my API behavior.

**Why this priority**: Core functionality of the engine.

**Independent Test**: Provide a `RequestNode` to the engine, execute it against a known endpoint (e.g., `https://httpbin.org/get`), and verify the returned `Response` object.

**Acceptance Scenarios**:

1. **Given** a valid Request, **When** executed, **Then** the engine should return the full response including status (e.g., 200 OK), all headers, and the response body.
2. **Given** a request to a non-existent host, **When** executed, **Then** the engine should return a clear network error message.

---

### User Story 2 - Request Cancellation (Priority: P1)

As a developer, I want to cancel a long-running request so that I can stop wasting resources if I realize I made a mistake.

**Why this priority**: Essential for UX, especially with slow or hanging APIs.

**Independent Test**: Start a request to a slow endpoint, trigger cancellation after 1 second, and verify the engine stops the network call and returns a "Cancelled" status.

**Acceptance Scenarios**:

1. **Given** a pending request, **When** the cancel signal is triggered, **Then** the engine MUST immediately terminate the TCP connection/HTTP call.
2. **Given** a cancelled request, **When** checked, **Then** it should not produce any further updates or side effects.

---

### User Story 3 - Automatic Redirect Handling (Priority: P2)

As a developer, I want the engine to follow redirects automatically so that I don't have to manually execute each step of a redirect chain.

**Why this priority**: Standard feature for API clients.

**Independent Test**: Execute a request to `https://httpbin.org/redirect/3` and verify the final response is from the target URL after 3 jumps.

**Acceptance Scenarios**:

1. **Given** a redirect response (3xx), **When** redirects are enabled, **Then** the engine should follow the `Location` header until it reaches a non-3xx response or a maximum depth.
2. **Given** a redirect loop, **When** executed, **Then** the engine should fail gracefully after a certain number of redirects (e.g., 10).

---

### User Story 4 - Session Persistence via Cookies (Priority: P2)

As a developer, I want the engine to handle cookies so that I can test authenticated sessions that rely on cookie-based auth.

**Why this priority**: Required for testing many legacy or web-oriented APIs.

**Independent Test**: Execute a request that sets a cookie, then execute another request to the same domain and verify the cookie is sent back in the `Cookie` header.

**Acceptance Scenarios**:

1. **Given** a `Set-Cookie` header in a response, **When** received, **Then** the engine should store it in a cookie jar.
2. **Given** a stored cookie for a domain, **When** a subsequent request is made to that domain, **Then** the engine should automatically include the cookie.

---

### Edge Cases

- **Mixed Protocols**: Handling a redirect from HTTPS to HTTP.
- **Large Response Bodies**: Ensuring the engine doesn't buffer the entire response in memory if it exceeds a certain size (e.g., 50MB).
- **Certificate Errors**: How should the engine handle self-signed or invalid SSL certificates? (Should provide an "Insecure" toggle).
- **Timeout vs. Cancellation**: Distinguishing between a request that was stopped by the user vs. one that exceeded the `timeout` limit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an execution engine in Go that uses `net/http` (or a similar high-performance library).
- **FR-002**: System MUST support configurable timeouts per request (defaulting to 30 seconds).
- **FR-003**: System MUST support automatic redirect following with a configurable limit (default: 10).
- **FR-004**: System MUST implement a cookie jar for managing and persisting cookies across requests in a session.
- **FR-005**: System MUST support request cancellation using Go's `context.Context`.
- **FR-006**: System MUST resolve environment variables in the URL, headers, and body before execution.
- **FR-007**: System MUST support standard HTTP methods and custom methods if defined in the AST.
- **FR-008**: System MUST capture and return detailed timing information (DNS lookup, TCP connection, TLS handshake, Time to First Byte, Total time).
- **FR-009**: System MUST allow configuring redirect policy (Follow vs. Stop) on a per-request basis using metadata (e.g., `@followRedirects: false`).
- **FR-010**: System MUST handle cookie persistence by saving cookies to the local SQLite database and scoping them to the active workspace.

### Key Entities *(include if feature involves data)*

- **ExecutionContext**: Holds the state for a single execution (context, variable map, cookie jar).
- **Response**: The result of an execution (status, headers, body, timing, history of redirects).
- **Cookie Jar**: A container for storing and retrieving cookies based on domain/path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Engine MUST be able to handle 10 concurrent requests without significant performance degradation.
- **SC-002**: Cancellation MUST take effect in under 100ms from the time the signal is received.
- **SC-003**: Timing data accuracy MUST be within +/- 5ms compared to system network logs.
- **SC-004**: Memory usage for a single request (excluding body) MUST be under 1MB.
- **SC-005**: Redirect chains up to 10 deep MUST be handled correctly without memory leaks.
