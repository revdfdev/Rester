package bootstrap

import (
	"rester/backend/pkg/core"
	"rester/backend/pkg/executor"
	"rester/backend/pkg/parser"
	"rester/backend/pkg/storage"
)

// Container holds all application services and their dependencies
type Container struct {
	Workspace   core.WorkspaceService
	Parser      core.ParserService
	Executor    core.ExecutionService
	Environment core.EnvironmentService
	Storage     core.Storage
	Logger      core.Logger
	Importer    *storage.PostmanImporter
	Exporter    *storage.Exporter
}

// NewContainer initializes and wires all services
func NewContainer() *Container {
	s, _ := storage.NewSQLiteStorage("rester.db")
	p := parser.NewParser()
	e := executor.NewExecutor()
	w := storage.NewWorkspaceManager()
	env := storage.NewEnvironmentManager()
	imp := storage.NewPostmanImporter()
	exp := storage.NewExporter()
	
	return &Container{
		Storage:     s,
		Parser:      p,
		Executor:    e,
		Workspace:   w,
		Environment: env,
		Importer:    imp,
		Exporter:    exp,
	}
}
