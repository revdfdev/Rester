package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"rester/backend/pkg/core"
	"strings"
)

type WorkspaceManager struct {
	currentPath string
}

func NewWorkspaceManager() *WorkspaceManager {
	return &WorkspaceManager{}
}

func (m *WorkspaceManager) OpenWorkspace(ctx context.Context, path string) error {
	info, err := os.Stat(path)
	if err != nil {
		return err
	}
	if !info.IsDir() {
		return fmt.Errorf("path is not a directory: %s", path)
	}
	m.currentPath = path
	return nil
}

func (m *WorkspaceManager) GetCollections(ctx context.Context) ([]core.Collection, error) {
	if m.currentPath == "" {
		return nil, fmt.Errorf("no workspace opened")
	}

	return m.scanDirectory(m.currentPath)
}

func (m *WorkspaceManager) CreateRequest(ctx context.Context, collectionPath string, name string) (core.Request, error) {
	// Implementation for creating a new .http file or adding to one
	return core.Request{}, fmt.Errorf("not implemented")
}

func (m *WorkspaceManager) SaveRequest(ctx context.Context, req core.Request) error {
	// Implementation for saving changes back to the .http file
	return fmt.Errorf("not implemented")
}

func (m *WorkspaceManager) scanDirectory(path string) ([]core.Collection, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var collections []core.Collection
	var requests []core.Request

	for _, entry := range entries {
		fullPath := filepath.Join(path, entry.Name())
		if entry.IsDir() {
			if entry.Name() == ".git" || entry.Name() == "node_modules" {
				continue
			}
			subCols, err := m.scanDirectory(fullPath)
			if err == nil && len(subCols) > 0 {
				collections = append(collections, core.Collection{
					Path:    fullPath,
					Name:    entry.Name(),
					Folders: subCols,
				})
			}
		} else if strings.HasSuffix(entry.Name(), ".http") {
			requests = append(requests, core.Request{
				ID:   fullPath,
				Name: entry.Name(),
				URL:  fullPath, // Using URL to store path for now
			})
		}
	}

	if len(requests) > 0 || len(collections) > 0 {
		return append(collections, core.Collection{
			Path:     path,
			Name:     filepath.Base(path),
			Requests: requests,
		}), nil
	}

	return collections, nil
}
