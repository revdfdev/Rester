# Data Model: Dual-Mode Request Editor

## Entities

### RequestBlock
Represents a single request within a `.http` file.
- `id`: string (unique identifier within the session)
- `name`: string (derived from preceding comment)
- `method`: string (GET, POST, etc.)
- `url`: string (unresolved URL with variables)
- `headers`: array of `{ key: string, value: string }`
- `params`: array of `{ key: string, value: string }` (derived from URL query)
- `body`: object (type: 'none' | 'raw' | 'json' | 'form-data', content: string)
- `preRequestScript`: string (JS code from `<% ... %>` before headers)
- `testScript`: string (JS code from `<% ... %>` after response/body)
- `rawContent`: string (exact text segment in the file)

### EnvironmentState
Represents the active environment context.
- `activeEnv`: string (e.g., 'dev', 'prod')
- `variables`: record of key-value pairs
- `sourceFile`: string (path to `http-client.env.json`)

## Relationships
- A `WorkspaceSession` contains multiple `Tab`s.
- Each `Tab` maps to one `.http` file.
- One `.http` file can contain multiple `RequestBlock`s.
- The `RequestNavigator` switches the active `RequestBlock` in the Form UI.
