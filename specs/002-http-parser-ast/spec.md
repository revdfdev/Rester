# Feature Specification: .http Lexer and Parser with AST Generation

**Feature Branch**: `002-http-parser-ast`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Implement .http lexer and parser with AST generation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Request Parsing (Priority: P1)

As a developer, I want the system to correctly parse a simple GET request so that the backend can understand which URL to target.

**Why this priority**: Fundamental building block for the entire application.

**Independent Test**: Can be tested by passing the string `GET https://example.com` to the parser and verifying the AST contains a `Request` node with `Method="GET"` and `URL="https://example.com"`.

**Acceptance Scenarios**:

1. **Given** a string `GET https://api.github.com`, **When** parsed, **Then** the AST should have one Request node with the correct method and URL.
2. **Given** a string `https://api.github.com` (no method), **When** parsed, **Then** it should default to a GET request in the AST.

---

### User Story 2 - Multi-Request File Parsing (Priority: P1)

As a developer, I want to define multiple requests in a single file using `###` separators so that I can group related tests together.

**Why this priority**: Required for "Collections" and standard `.http` file support.

**Independent Test**: Pass a multi-request string to the parser and verify the resulting AST (or slice of requests) contains the correct number of distinct request objects.

**Acceptance Scenarios**:

1. **Given** a file with two requests separated by `###`, **When** parsed, **Then** the result should contain exactly two request definitions.
2. **Given** requests with comments (`#` or `//`), **When** parsed, **Then** the comments should be either ignored or attached as metadata to the following request.

---

### User Story 3 - Headers and Body Extraction (Priority: P2)

As a developer, I want to include headers and a request body so that I can perform complex POST/PUT operations.

**Why this priority**: Necessary for real-world API testing (Auth headers, JSON bodies).

**Independent Test**: Pass a POST request with headers and a JSON body to the parser and verify the AST correctly captures all headers and the full body string.

**Acceptance Scenarios**:

1. **Given** a request with `Content-Type: application/json` header and a JSON body, **When** parsed, **Then** the AST should contain a map of headers and the body as a raw string or structured data.
2. **Given** a body separated by a blank line, **When** parsed, **Then** everything after the blank line (until the next separator) should be treated as the request body.

---

### User Story 4 - Variable Placeholder Detection (Priority: P2)

As a developer, I want to use placeholders like `{{baseUrl}}` in my requests so that I can support environments.

**Why this priority**: Enables environment-driven testing without modifying files.

**Independent Test**: Pass a URL containing `{{host}}` and verify the AST node for the URL indicates it contains a variable placeholder.

**Acceptance Scenarios**:

1. **Given** `GET {{host}}/api/users`, **When** parsed, **Then** the URL node in the AST should identify `{{host}}` as a variable token.
2. **Given** variables in headers or body, **When** parsed, **Then** they should be correctly tokenized as variable placeholders.

---

### Edge Cases

- **Malformed URL**: How does the parser handle `GET http://invalid^url`? (Should report a syntax error or a "Malformed URL" node).
- **Missing Separators**: How does the parser handle multiple requests without `###`? (Usually treated as a single request or an error depending on syntax).
- **Extremely Large Bodies**: Can the lexer handle a 10MB JSON body efficiently? (Should use streaming or buffered reading if possible, but for MVP, just not crashing is enough).
- **Unicode Support**: Ensure the lexer handles non-ASCII characters in headers and body.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Lexer that converts `.http` text into a stream of tokens (Method, URL, Header, Body, Separator, Variable, Comment).
- **FR-002**: System MUST provide a Parser that consumes tokens and generates a structured AST (Abstract Syntax Tree).
- **FR-003**: The AST MUST represent a file as a collection of `Request` nodes.
- **FR-004**: Each `Request` node MUST include fields for Method, URL, Headers (map), Body (string), and Metadata (e.g., line numbers, comments).
- **FR-005**: Parser MUST support the `###` separator for multiple requests in a single file.
- **FR-006**: Parser MUST identify variable placeholders using the `{{variableName}}` syntax.
- **FR-007**: Parser MUST support standard HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS).
- **FR-008**: Parser MUST be independent of the execution engine (it only produces the AST).
- **FR-009**: Parser MUST report syntax errors with line and column numbers and stop at the first error encountered (Fail-Fast).
- **FR-010**: Parser MUST target the VS Code REST Client specification for .http grammar (supporting standard request definitions, headers, and variables).

### Key Entities *(include if feature involves data)*

- **Token**: The smallest unit of syntax (e.g., a Method string, a separator).
- **AST Node**: A structured element in the tree (e.g., `FileNode`, `RequestNode`, `HeaderNode`).
- **RequestNode**: Contains all components of a single HTTP request.
- **VariableNode**: Represents a placeholder for environment substitution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parser MUST process a 1000-line `.http` file in under 50ms on a standard modern CPU.
- **SC-002**: Parser MUST achieve 100% accuracy on a standard suite of `.http` samples (GET, POST with JSON, multiple requests, variables).
- **SC-003**: Error messages MUST point to the exact line and column where the syntax error occurred in at least 90% of malformed input cases.
- **SC-004**: Memory overhead for the AST of a 100-request file MUST be under 5MB.
