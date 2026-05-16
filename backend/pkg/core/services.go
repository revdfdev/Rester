package core

import "context"

// WorkspaceService handles filesystem and collection management
type WorkspaceService interface {
	GetCollections(ctx context.Context) ([]Collection, error)
	OpenWorkspace(ctx context.Context, path string) error
	CreateRequest(ctx context.Context, collectionPath string, name string) (Request, error)
	SaveRequest(ctx context.Context, req Request) error
}

// ParserService handles .http parsing
type ParserService interface {
	ParseFile(ctx context.Context, path string) (*FileNode, error)
	ParseContent(ctx context.Context, content string) (*FileNode, error)
}

// ExecutionService handles HTTP calls
type ExecutionService interface {
	Execute(ctx context.Context, req Request, env Environment) (*Response, error)
	Cancel(ctx context.Context, requestID string) error
}

// EnvironmentService handles variable management
type EnvironmentService interface {
	ListEnvironments(ctx context.Context) ([]Environment, error)
	GetEnvironmentByName(ctx context.Context, name string) (*Environment, error)
	GetActiveEnvironment(ctx context.Context) (*Environment, error)
	UpdateVariable(ctx context.Context, envName string, key string, value string) error
}

// Storage interface for SQLite persistence
type Storage interface {
	SaveHistory(ctx context.Context, res Response) error
	GetHistory(ctx context.Context, limit int) ([]Response, error)
	Close() error
}
