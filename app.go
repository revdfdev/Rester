package main

import (
	"context"
	"rester/backend/pkg/bootstrap"
	"rester/backend/pkg/core"
)

// App struct
type App struct {
	ctx       context.Context
	container *bootstrap.Container
}

// NewApp creates a new App application struct
func NewApp(c *bootstrap.Container) *App {
	return &App{
		container: c,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Execute performs an HTTP request
func (a *App) Execute(req core.Request, env core.Environment) (*core.Response, error) {
	return a.container.Executor.Execute(a.ctx, req, env)
}
