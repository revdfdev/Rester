package handlers

import (
	"context"
	"path/filepath"
	"rester/backend/pkg/bootstrap"
	"rester/backend/pkg/core"
	"rester/backend/pkg/storage"
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

func (h *WorkspaceHandler) SaveEnvironments(envs []core.Environment) error {
	return h.container.Environment.SaveEnvironments(context.Background(), envs)
}

func (h *WorkspaceHandler) OpenWorkspace(path string) error {
	h.container.Environment.SetWorkspace(path)
	err := h.container.Workspace.OpenWorkspace(context.Background(), path)
	if err == nil {
		name := filepath.Base(path)
		_ = h.AddRecentWorkspace(path, name)
	}
	return err
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

func (h *WorkspaceHandler) GetRecentWorkspaces() ([]core.RecentWorkspace, error) {
	if dbStore, ok := h.container.Storage.(*storage.SQLiteStorage); ok {
		return dbStore.GetRecentWorkspaces(context.Background())
	}
	return []core.RecentWorkspace{}, nil
}

func (h *WorkspaceHandler) AddRecentWorkspace(path string, name string) error {
	if dbStore, ok := h.container.Storage.(*storage.SQLiteStorage); ok {
		return dbStore.SaveRecentWorkspace(context.Background(), path, name)
	}
	return nil
}

func (h *WorkspaceHandler) RemoveRecentWorkspace(path string) error {
	if dbStore, ok := h.container.Storage.(*storage.SQLiteStorage); ok {
		return dbStore.RemoveRecentWorkspace(context.Background(), path)
	}
	return nil
}

func (h *WorkspaceHandler) GetCurrentWorkspace() (string, error) {
	return h.container.Workspace.GetCurrentPath(), nil
}
