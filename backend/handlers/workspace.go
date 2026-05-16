package handlers

import (
	"context"
	"rester/backend/pkg/bootstrap"
	"rester/backend/pkg/core"
)

type WorkspaceHandler struct {
	container *bootstrap.Container
}

func NewWorkspaceHandler(c *bootstrap.Container) *WorkspaceHandler {
	return &WorkspaceHandler{container: c}
}

func (h *WorkspaceHandler) GetCollections(ctx context.Context) ([]core.Collection, error) {
	return h.container.Workspace.GetCollections(ctx)
}

func (h *WorkspaceHandler) OpenWorkspace(ctx context.Context, path string) error {
	return h.container.Workspace.OpenWorkspace(ctx, path)
}
