package bootstrap

import (
	"rester/backend/pkg/core"
	"rester/backend/pkg/executor"
	"rester/backend/pkg/parser"
	"rester/backend/pkg/storage"
)

// Container holds all application services
type Container struct {
	Workspace   core.WorkspaceService
	Parser      core.ParserService
	Executor    core.ExecutionService
	Environment core.EnvironmentService
	Storage     core.Storage
	Importer    *storage.PostmanImporter
	Exporter    *storage.Exporter
	Config      *storage.ConfigManager
}

// NewContainer initializes and returns a new dependency container
func NewContainer(dbPath string) (*Container, error) {
	sqliteStore, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		return nil, err
	}

	return &Container{
		Workspace: storage.NewWorkspaceManager(), // Root will be set later
		Parser:      parser.NewParser(),
		Executor:    executor.NewHttpExecutor(),
		Storage:     sqliteStore,
		Environment: storage.NewEnvironmentManager(),
		Importer:    storage.NewPostmanImporter(),
		Exporter:    storage.NewExporter(),
		Config:      storage.NewConfigManager("settings.json"),
	}, nil
}
