# Research: Clean Architecture for Wails

## Decision: Decoupled Service Layer with Bridge Handlers

### Rationale
To ensure the core engine is independently runnable and testable, we must separate the business logic from the Wails `App` struct. Wails `App` will act solely as a "Bridge" or "Gateway", translating frontend calls to service calls.

### Technical Implementation

#### 1. Core Services via Interfaces
All core logic (Parsing, Execution, Storage) will be defined as Go interfaces in `backend/internal/core`. This allows for mocking and swapping implementations without touching the consumers.

#### 2. Manual Dependency Injection (Bootstrap)
We will implement a `bootstrap` package that is responsible for:
- Initializing the SQLite database.
- Initializing the FileSystem watcher.
- Constructing all services (Parser, Executor, etc.).
- Wiring them together (passing Storage to Executor, etc.).
- Returning a `Container` struct that the Wails `App` can use.

#### 3. Wails Context Isolation
Core services should NOT take `context.Context` from Wails as their only context. They should be designed to take a standard Go context, allowing them to be run in a CLI or background job. Wails-specific features (like event emission) will be handled by the Bridge layer or via an "EventBus" interface.

## Alternatives Considered

### Alternative 1: Single Monolithic App Struct
- **Pros**: Simple, fast for MVP.
- **Cons**: Becomes a "God Object", impossible to test without Wails, prone to circular dependencies.
- **Result**: Rejected in favor of clean architecture.

### Alternative 2: Uber-fx for DI
- **Pros**: Clean wiring for complex apps.
- **Cons**: Adds a heavy dependency, runtime reflection makes debugging harder, increases binary size slightly.
- **Result**: Rejected in favor of Manual DI to keep the project "lightweight".

### Alternative 3: Global Singletons (e.g. `storage.DB`)
- **Pros**: Easy access from anywhere.
- **Cons**: Hidden dependencies, hard to mock, race conditions during tests.
- **Result**: Rejected in favor of explicit constructor injection.

## Best Practices for Rester

1. **Error Handling**: Use custom error types in core services; let the Bridge layer convert them to user-friendly strings for the frontend.
2. **Data Transfer Objects (DTOs)**: Ensure the AST and Response models are serializable to JSON so they can cross the Wails bridge easily.
3. **Frontend API Wrapper**: Create a TypeScript service in the frontend that wraps the `window.go` calls to provide a clean, type-safe API for components.
