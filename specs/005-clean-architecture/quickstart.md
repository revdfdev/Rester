# Quickstart: Rester Clean Architecture

## Developer Setup

1. **Backend Development**:
   - Work within `backend/internal/`.
   - Each module should have its own `_test.go` file.
   - Run `go test ./backend/internal/...` to verify business logic without Wails.

2. **Frontend Development**:
   - Work within `frontend/src/`.
   - Use `npm run dev` for hot-reloading.
   - Services are exposed via `window.go.main.App`.

## Project Wiring

The entry point for all services is the `bootstrap` package:

```go
// backend/internal/bootstrap/bootstrap.go
func InitApp() *Container {
    storage := storage.NewSQLiteStorage("rester.db")
    parser := parser.NewParser()
    executor := executor.NewExecutor()
    
    return &Container{
        Storage:  storage,
        Parser:   parser,
        Executor: executor,
    }
}
```

The Wails `App` struct is then initialized with this container:

```go
type App struct {
    container *bootstrap.Container
}

func NewApp(c *bootstrap.Container) *App {
    return &App{container: c}
}
```

## Adding a New Feature

1. Define the interface in `backend/internal/core`.
2. Implement the service in its own package under `backend/internal/`.
3. Add the service to the `bootstrap.Container`.
4. Add a thin bridge method in `app.go` to expose it to the frontend.
