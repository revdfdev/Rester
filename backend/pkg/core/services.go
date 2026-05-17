package core

import (
	"context"
	"net/http"
)

// WorkspaceService handles filesystem and collection management
type WorkspaceService interface {
	GetCollections(ctx context.Context) ([]Collection, error)
	OpenWorkspace(ctx context.Context, path string) error
	ReadFile(ctx context.Context, path string) (string, error)
	SaveFile(ctx context.Context, path string, content string) error
	CreateFolder(ctx context.Context, path string) error
	Delete(ctx context.Context, path string) error
	Rename(ctx context.Context, oldPath string, newPath string) error
	GetWorkspaceMetadata(ctx context.Context) (*WorkspaceMetadata, error)
	SaveWorkspaceMetadata(ctx context.Context, meta WorkspaceMetadata) error
	GetCurrentPath() string
	GetSessionStorage() Storage
}

// ParserService handles .http parsing
type ParserService interface {
	ParseFile(ctx context.Context, path string) (*FileNode, error)
	ParseContent(ctx context.Context, content string) (*FileNode, error)
}

// ExecutionOptions for customizing request behavior
type ExecutionOptions struct {
	TimeoutMs int    `json:"timeout_ms"`
	RequestID string `json:"request_id"` // Usually the tab ID
}

// ExecutionService handles HTTP calls with lifecycle support
type ExecutionService interface {
	Execute(ctx context.Context, req Request, env Environment, opts ExecutionOptions) (*Response, error)
	Cancel(ctx context.Context, requestID string) error
}

// EnvironmentService handles variable management
type EnvironmentService interface {
	ListEnvironments(ctx context.Context) ([]Environment, error)
	GetEnvironmentByName(ctx context.Context, name string) (*Environment, error)
	GetActiveEnvironment(ctx context.Context) (*Environment, error)
	UpdateVariable(ctx context.Context, envName string, key string, value string) error
	SaveEnvironments(ctx context.Context, envs []Environment) error
	SetWorkspace(path string)
}

// Storage interface for persistence
type Storage interface {
	SaveHistory(ctx context.Context, req Request, res Response) error
	GetHistory(ctx context.Context, limit int) ([]HistoryEntry, error)
	ClearHistory(ctx context.Context) error
	SaveMetadata(ctx context.Context, key string, value string) error
	GetMetadata(ctx context.Context, key string) (string, error)
	SaveCookie(ctx context.Context, domain string, cookie *http.Cookie) error
	GetCookiesForDomain(ctx context.Context, domain string) ([]*http.Cookie, error)
	DeleteCookie(ctx context.Context, domain string, name string, path string) error
	Close() error
}
