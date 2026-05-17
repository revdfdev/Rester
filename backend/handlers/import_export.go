package handlers

import (
	"rester/backend/pkg/bootstrap"
)

type ImportExportHandler struct {
	container *bootstrap.Container
}

func NewImportExportHandler(c *bootstrap.Container) *ImportExportHandler {
	return &ImportExportHandler{container: c}
}

func (h *ImportExportHandler) ImportPostmanCollection(jsonPath string, destDir string) error {
	return h.container.Importer.Import(jsonPath, destDir)
}

func (h *ImportExportHandler) ImportPostmanEnvironment(jsonPath string, destDir string) error {
	return h.container.Importer.ImportEnvironment(jsonPath, destDir)
}

func (h *ImportExportHandler) ExportWorkspace(srcDir string, destZipPath string) error {
	return h.container.Exporter.ExportToZip(srcDir, destZipPath)
}
