package handlers

import (
	"context"
	"rester/backend/pkg/bootstrap"
)

type ImportExportHandler struct {
	container *bootstrap.Container
}

func NewImportExportHandler(c *bootstrap.Container) *ImportExportHandler {
	return &ImportExportHandler{container: c}
}

func (h *ImportExportHandler) ImportPostmanCollection(ctx context.Context, jsonPath string, destDir string) error {
	return h.container.Importer.Import(jsonPath, destDir)
}

func (h *ImportExportHandler) ImportPostmanEnvironment(ctx context.Context, jsonPath string, destDir string) error {
	return h.container.Importer.ImportEnvironment(jsonPath, destDir)
}

func (h *ImportExportHandler) ExportWorkspace(ctx context.Context, srcDir string, destZipPath string) error {
	return h.container.Exporter.ExportToZip(srcDir, destZipPath)
}
