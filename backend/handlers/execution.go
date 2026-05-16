package handlers

import (
	"context"
	"rester/backend/pkg/bootstrap"
	"rester/backend/pkg/core"
)

type ExecutionHandler struct {
	container *bootstrap.Container
}

func NewExecutionHandler(c *bootstrap.Container) *ExecutionHandler {
	return &ExecutionHandler{container: c}
}

func (h *ExecutionHandler) Execute(ctx context.Context, req core.Request, env core.Environment) (*core.Response, error) {
	return h.container.Executor.Execute(ctx, req, env)
}

func (h *ExecutionHandler) Cancel(ctx context.Context, requestID string) error {
	return h.container.Executor.Cancel(ctx, requestID)
}
