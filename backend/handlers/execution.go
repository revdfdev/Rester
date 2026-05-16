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

func (h *ExecutionHandler) Execute(req core.Request, env core.Environment, opts core.ExecutionOptions) (*core.Response, error) {
	return h.container.Executor.Execute(context.Background(), req, env, opts)
}

func (h *ExecutionHandler) CancelRequest(requestID string) error {
	return h.container.Executor.Cancel(context.Background(), requestID)
}

func (h *ExecutionHandler) GetHistory(limit int) ([]core.HistoryEntry, error) {
	return h.container.Storage.GetHistory(context.Background(), limit)
}

func (h *ExecutionHandler) ClearHistory() error {
	return h.container.Storage.ClearHistory(context.Background())
}
