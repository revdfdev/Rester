# Data Model: Rester Core

## Entities

### Request
Represents a single HTTP request definition.
- **ID**: UUID (for tracking in tabs/history)
- **Name**: String (optional)
- **Method**: Enum (GET, POST, etc.)
- **URL**: String (with variable placeholders)
- **Headers**: Map<String, String>
- **Body**: String / Byte Array
- **Metadata**: Map<String, Any> (e.g., line numbers, `@name`)

### AST Node
Result of parsing a `.http` file.
- **Type**: Token type (Method, Header, Body, etc.)
- **Content**: Raw text
- **LineRange**: [Start, End]
- **Variables**: List of discovered `{{var}}` placeholders

### Collection
A group of requests mapped to a filesystem directory.
- **Path**: Absolute path on disk
- **Name**: Folder name
- **Requests**: List of `.http` files
- **Subfolders**: Nested collections

### Environment
A named set of variables.
- **Name**: e.g., "Local", "Production"
- **Variables**: Map<String, String>
- **IsActive**: Boolean

### Execution Result (Response)
- **Status**: Int (200, 404, etc.)
- **StatusText**: String
- **Headers**: Map<String, String>
- **Body**: String (Formatted or Raw)
- **Timing**:
  - **Start**: Timestamp
  - **TTFB**: Milliseconds
  - **Total**: Milliseconds
- **Error**: String (if network failure)

## Relationships

- **Workspace** contains many **Collections**.
- **Collection** contains many **Requests** (via files).
- **Request** is parsed into an **AST**.
- **Request** + **Environment** -> **Execution Result**.
