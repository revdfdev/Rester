package main

import (
	"context"

	"rester/backend/pkg/bootstrap"
	"rester/backend/pkg/core"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx       context.Context
	container *bootstrap.Container
}

// NewApp creates a new App application struct
func NewApp(c *bootstrap.Container) *App {
	return &App{
		container: c,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Execute performs an HTTP request
func (a *App) Execute(req core.Request, env core.Environment, opts core.ExecutionOptions) (*core.Response, error) {
	res, err := a.container.Executor.Execute(a.ctx, req, env, opts)
	if err == nil && res != nil && res.Error == "" {
		// Save to history automatically on success
		_ = a.container.Storage.SaveHistory(a.ctx, req, *res)
	}
	return res, err
}

// GetHistory returns the request history
func (a *App) GetHistory(limit int) ([]core.HistoryEntry, error) {
	return a.container.Storage.GetHistory(a.ctx, limit)
}

// CancelRequest cancels an in-flight HTTP request by ID
func (a *App) CancelRequest(requestID string) error {
	return a.container.Executor.Cancel(a.ctx, requestID)
}

// ClearHistory deletes all history entries
func (a *App) ClearHistory() error {
	return a.container.Storage.ClearHistory(a.ctx)
}

// GetSettings returns application settings
func (a *App) GetSettings() (string, error) {
	return a.container.Config.Load()
}

// UpdateSettings saves application settings
func (a *App) UpdateSettings(settings string) error {
	return a.container.Config.Save(settings)
}

// SelectDirectory opens a directory dialog and returns the selected path
func (a *App) SelectDirectory() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Workspace Folder",
	})
}

// SaveFileDialog opens a save file dialog and returns the selected path
func (a *App) SaveFileDialog(defaultName string) (string, error) {
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Request File",
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "HTTP Request (*.http)",
				Pattern:     "*.http",
			},
		},
	})
}

// OpenWorkspace sets the current working directory
func (a *App) OpenWorkspace(path string) error {
	return a.container.Workspace.OpenWorkspace(a.ctx, path)
}

// GetCollections scans the current workspace for .http files
func (a *App) GetCollections() ([]core.Collection, error) {
	return a.container.Workspace.GetCollections(a.ctx)
}

// ReadFile returns the content of a file
func (a *App) ReadFile(path string) (string, error) {
	return a.container.Workspace.ReadFile(a.ctx, path)
}

// SaveFile writes content to a file
func (a *App) SaveFile(path string, content string) error {
	return a.container.Workspace.SaveFile(a.ctx, path, content)
}

// GetWorkspaceMetadata returns workspace-specific settings like open tabs
func (a *App) GetWorkspaceMetadata() (*core.WorkspaceMetadata, error) {
	return a.container.Workspace.GetWorkspaceMetadata(a.ctx)
}

// SaveWorkspaceMetadata persists workspace-specific settings
func (a *App) SaveWorkspaceMetadata(meta core.WorkspaceMetadata) error {
	return a.container.Workspace.SaveWorkspaceMetadata(a.ctx, meta)
}

// ShowInFolder opens the system file explorer and selects the given path
func (a *App) ShowInFolder(path string) {
	runtime.BrowserOpenURL(a.ctx, path)
}
