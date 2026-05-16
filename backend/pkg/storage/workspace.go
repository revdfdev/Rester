package storage

import (
	"context"
	"encoding/json"
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

func (m *WorkspaceManager) ReadFile(ctx context.Context, path string) (string, error) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func (m *WorkspaceManager) SaveFile(ctx context.Context, path string, content string) error {
	return os.WriteFile(path, []byte(content), 0644)
}

func (m *WorkspaceManager) CreateFolder(ctx context.Context, path string) error {
	return os.MkdirAll(path, 0755)
}

func (m *WorkspaceManager) Delete(ctx context.Context, path string) error {
	return os.RemoveAll(path)
}

func (m *WorkspaceManager) Rename(ctx context.Context, oldPath string, newPath string) error {
	return os.Rename(oldPath, newPath)
}

func (m *WorkspaceManager) GetWorkspaceMetadata(ctx context.Context) (*core.WorkspaceMetadata, error) {
	if m.currentPath == "" {
		return nil, fmt.Errorf("no workspace opened")
	}

	metaPath := filepath.Join(m.currentPath, ".rester", "metadata.json")
	bytes, err := os.ReadFile(metaPath)
	if err != nil {
		if os.IsNotExist(err) {
			return &core.WorkspaceMetadata{}, nil
		}
		return nil, err
	}

	var meta core.WorkspaceMetadata
	if err := json.Unmarshal(bytes, &meta); err != nil {
		return nil, err
	}

	return &meta, nil
}

func (m *WorkspaceManager) SaveWorkspaceMetadata(ctx context.Context, meta core.WorkspaceMetadata) error {
	if m.currentPath == "" {
		return fmt.Errorf("no workspace opened")
	}

	metaDir := filepath.Join(m.currentPath, ".rester")
	if err := os.MkdirAll(metaDir, 0755); err != nil {
		return err
	}

	metaPath := filepath.Join(metaDir, "metadata.json")
	bytes, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(metaPath, bytes, 0644)
}

func (m *WorkspaceManager) scanDirectory(path string) ([]core.Collection, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var collections []core.Collection
	var requests []core.Request

	for _, entry := range entries {
		name := entry.Name()
		fullPath := filepath.Join(path, name)

		if entry.IsDir() {
			// Skip noisy directories
			if name == ".git" || name == "node_modules" || name == ".rester" || name == "dist" || name == "build" {
				continue
			}

			subCols, err := m.scanDirectory(fullPath)
			if err != nil {
				continue
			}

			// Add as a folder if it has content (or we can always add it)
			collections = append(collections, core.Collection{
				Path:    fullPath,
				Name:    name,
				Folders: subCols,
			})
		} else if strings.HasSuffix(name, ".http") {
			requests = append(requests, core.Request{
				ID:   fullPath,
				Name: strings.TrimSuffix(name, ".http"),
				URL:  fullPath,
			})
		}
	}

	return []core.Collection{
		{
			Path:     path,
			Name:     filepath.Base(path),
			Requests: requests,
			Folders:  collections,
		},
	}, nil
}
