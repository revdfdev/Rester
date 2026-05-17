package core

import "context"

// HistoryRepository defines SQLite data operations for request and execution histories.
type HistoryRepository interface {
	SaveHistory(ctx context.Context, req Request, res Response) error
	GetHistory(ctx context.Context, limit int) ([]HistoryEntry, error)
	ClearHistory(ctx context.Context) error
}

// WorkspaceRepository defines SQLite data operations for recent workspaces.
type WorkspaceRepository interface {
	SaveRecentWorkspace(ctx context.Context, path string, name string) error
	GetRecentWorkspaces(ctx context.Context) ([]RecentWorkspace, error)
	RemoveRecentWorkspace(ctx context.Context, path string) error
}

// SessionRepository defines SQLite data operations for open tabs and UI layout states.
type SessionRepository interface {
	SaveWindowState(ctx context.Context, state WindowState) error
	GetWindowState(ctx context.Context) (*WindowState, error)
	SaveWorkspaceMetadata(ctx context.Context, workspacePath string, meta WorkspaceMetadata) error
	GetWorkspaceMetadata(ctx context.Context, workspacePath string) (*WorkspaceMetadata, error)
}
