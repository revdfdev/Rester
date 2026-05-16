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

func (h *WorkspaceHandler) GetCollections() ([]core.Collection, error) {
	return h.container.Workspace.GetCollections(context.Background())
}

func (h *WorkspaceHandler) GetEnvironments() ([]core.Environment, error) {
	return h.container.Environment.ListEnvironments(context.Background())
}

func (h *WorkspaceHandler) OpenWorkspace(path string) error {
	h.container.Environment.SetWorkspace(path)
	return h.container.Workspace.OpenWorkspace(context.Background(), path)
}

func (h *WorkspaceHandler) GetWorkspaceMetadata() (*core.WorkspaceMetadata, error) {
	return h.container.Workspace.GetWorkspaceMetadata(context.Background())
}

func (h *WorkspaceHandler) SaveWorkspaceMetadata(meta core.WorkspaceMetadata) error {
	return h.container.Workspace.SaveWorkspaceMetadata(context.Background(), meta)
}

func (h *WorkspaceHandler) ReadFile(path string) (string, error) {
	return h.container.Workspace.ReadFile(context.Background(), path)
}

func (h *WorkspaceHandler) SaveFile(path string, content string) error {
	return h.container.Workspace.SaveFile(context.Background(), path, content)
}

func (h *WorkspaceHandler) CreateFolder(path string) error {
	return h.container.Workspace.CreateFolder(context.Background(), path)
}

func (h *WorkspaceHandler) Delete(path string) error {
	return h.container.Workspace.Delete(context.Background(), path)
}

func (h *WorkspaceHandler) Rename(oldPath string, newPath string) error {
	return h.container.Workspace.Rename(context.Background(), oldPath, newPath)
}

func (h *WorkspaceHandler) GetMetadata(key string) (string, error) {
	return h.container.Storage.GetMetadata(context.Background(), key)
}

func (h *WorkspaceHandler) SaveMetadata(key string, value string) error {
	return h.container.Storage.SaveMetadata(context.Background(), key, value)
}
