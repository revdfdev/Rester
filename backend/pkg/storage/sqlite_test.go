package storage

import (
	"context"
	"net/http"
	"os"
	"rester/backend/pkg/core"
	"testing"
	"time"
)

func TestSQLiteStorage(t *testing.T) {
	dbPath := "test_history.db"
	defer os.Remove(dbPath)

	s, err := NewSQLiteStorage(dbPath)
	if err != nil {
		t.Fatalf("Failed to create SQLiteStorage: %v", err)
	}
	defer s.Close()

	req := core.Request{
		ID:     "req_123",
		Method: "GET",
		URL:    "https://api.example.com",
	}

	res := core.Response{
		Status:     200,
		StatusText: "OK",
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       `{"id": 1}`,
	}

	// 1. Test Save & Get History
	err = s.SaveHistory(context.Background(), req, res)
	if err != nil {
		t.Fatalf("SaveHistory failed: %v", err)
	}

	history, err := s.GetHistory(context.Background(), 10)
	if err != nil {
		t.Fatalf("GetHistory failed: %v", err)
	}

	if len(history) != 1 {
		t.Errorf("Expected 1 history item, got %d", len(history))
	}

	if history[0].Response.Status != 200 {
		t.Errorf("Expected status 200, got %d", history[0].Response.Status)
	}

	// 2. Test Recent Workspaces CRUD
	err = s.SaveRecentWorkspace(context.Background(), "/path/to/ws", "My Workspace")
	if err != nil {
		t.Fatalf("SaveRecentWorkspace failed: %v", err)
	}

	workspaces, err := s.GetRecentWorkspaces(context.Background())
	if err != nil {
		t.Fatalf("GetRecentWorkspaces failed: %v", err)
	}

	if len(workspaces) != 1 {
		t.Fatalf("Expected 1 recent workspace, got %d", len(workspaces))
	}

	if workspaces[0].Name != "My Workspace" {
		t.Errorf("Expected workspace name 'My Workspace', got '%s'", workspaces[0].Name)
	}

	err = s.RemoveRecentWorkspace(context.Background(), "/path/to/ws")
	if err != nil {
		t.Fatalf("RemoveRecentWorkspace failed: %v", err)
	}

	workspaces, _ = s.GetRecentWorkspaces(context.Background())
	if len(workspaces) != 0 {
		t.Errorf("Expected 0 recent workspaces, got %d", len(workspaces))
	}

	// 3. Test Window State
	state := core.WindowState{
		Width:     1280,
		Height:    800,
		Maximized: true,
	}

	err = s.SaveWindowState(context.Background(), state)
	if err != nil {
		t.Fatalf("SaveWindowState failed: %v", err)
	}

	savedState, err := s.GetWindowState(context.Background())
	if err != nil {
		t.Fatalf("GetWindowState failed: %v", err)
	}

	if savedState == nil {
		t.Fatalf("Expected savedState to not be nil")
	}

	if savedState.Width != 1280 || !savedState.Maximized {
		t.Errorf("Saved window state does not match expected values")
	}

	// 4. Test Workspace Metadata
	meta := core.WorkspaceMetadata{
		ExpandedFolders: []string{"folder_a", "folder_b"},
		ActiveTabID:     "tab_2",
		OpenTabs: []core.Tab{
			{
				ID:           "tab_1",
				Name:         "Get Users",
				Path:         "/workspace/users.http",
				Type:         "http",
				Method:       "GET",
				IsDirty:      false,
				LastAccessed: 1001,
			},
			{
				ID:           "tab_2",
				Name:         "Post User",
				Path:         "/workspace/users.http",
				Type:         "http",
				Method:       "POST",
				IsDirty:      true,
				LastAccessed: 1002,
			},
		},
	}

	err = s.SaveWorkspaceMetadata(context.Background(), "/my/workspace", meta)
	if err != nil {
		t.Fatalf("SaveWorkspaceMetadata failed: %v", err)
	}

	savedMeta, err := s.GetWorkspaceMetadata(context.Background(), "/my/workspace")
	if err != nil {
		t.Fatalf("GetWorkspaceMetadata failed: %v", err)
	}

	if len(savedMeta.ExpandedFolders) != 2 || savedMeta.ActiveTabID != "tab_2" {
		t.Errorf("Workspace metadata session does not match")
	}

	if len(savedMeta.OpenTabs) != 2 {
		t.Fatalf("Expected 2 open tabs, got %d", len(savedMeta.OpenTabs))
	}

	if savedMeta.OpenTabs[1].Method != "POST" || !savedMeta.OpenTabs[1].IsDirty {
		t.Errorf("Saved open tab state does not match")
	}

	// 5. Test Cookie Jar CRUD & Domain matching in SQLite
	cookie := &http.Cookie{
		Name:     "session_id",
		Value:    "xyz123",
		Path:     "/",
		Domain:   "example.com",
		Expires:  time.Now().Add(24 * time.Hour),
		Secure:   true,
		HttpOnly: true,
	}

	ctx := context.Background()
	err = s.SaveCookie(ctx, "example.com", cookie)
	if err != nil {
		t.Fatalf("SaveCookie failed: %v", err)
	}

	// Retrieve matching cookies for exact domain
	cookies, err := s.GetCookiesForDomain(ctx, "example.com")
	if err != nil {
		t.Fatalf("GetCookiesForDomain failed: %v", err)
	}
	if len(cookies) != 1 || cookies[0].Value != "xyz123" {
		t.Errorf("Expected exactly 1 session_id cookie with value xyz123, got %d", len(cookies))
	}

	// Retrieve matching cookies for subdomain (should match domain="example.com")
	cookiesSub, err := s.GetCookiesForDomain(ctx, "api.example.com")
	if err != nil {
		t.Fatalf("GetCookiesForDomain failed: %v", err)
	}
	if len(cookiesSub) != 1 || cookiesSub[0].Value != "xyz123" {
		t.Errorf("Expected 1 inherited cookie for api.example.com, got %d", len(cookiesSub))
	}

	// Delete cookie
	err = s.DeleteCookie(ctx, "example.com", "session_id", "/")
	if err != nil {
		t.Fatalf("DeleteCookie failed: %v", err)
	}

	cookiesDeleted, _ := s.GetCookiesForDomain(ctx, "example.com")
	if len(cookiesDeleted) != 0 {
		t.Errorf("Expected 0 cookies after deletion, got %d", len(cookiesDeleted))
	}
}
