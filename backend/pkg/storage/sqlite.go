package storage

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"rester/backend/pkg/core"
	"time"

	_ "modernc.org/sqlite"
)

type SQLiteStorage struct {
	db *sql.DB
}

func NewSQLiteStorage(path string) (*SQLiteStorage, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	// Limit SQLite connection pool to 1 to serialize database writes and prevent locks
	db.SetMaxOpenConns(1)

	// Optimization: Enable WAL mode for better concurrency
	_, err = db.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		db.Close()
		return nil, err
	}

	// Optimization: Set busy timeout to 5 seconds
	_, err = db.Exec("PRAGMA busy_timeout=5000;")
	if err != nil {
		db.Close()
		return nil, err
	}

	// Create tables - Migration: Drop old history table if it has the old schema
	var count int
	_ = db.QueryRow("SELECT count(*) FROM pragma_table_info('history') WHERE name='request_ref'").Scan(&count)
	if count > 0 {
		_, _ = db.Exec("DROP TABLE history")
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			request TEXT,
			response TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS workspace_meta (
			key TEXT PRIMARY KEY,
			value TEXT,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS recent_workspaces (
			path TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			last_opened DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS workspace_tabs (
			workspace_path TEXT,
			tab_id TEXT,
			name TEXT NOT NULL,
			path TEXT NOT NULL,
			type TEXT NOT NULL,
			method TEXT,
			is_dirty INTEGER NOT NULL,
			last_accessed INTEGER NOT NULL,
			PRIMARY KEY (workspace_path, tab_id)
		);
		CREATE TABLE IF NOT EXISTS workspace_session (
			workspace_path TEXT PRIMARY KEY,
			active_tab_id TEXT,
			expanded_folders TEXT
		);
		CREATE TABLE IF NOT EXISTS window_state (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS cookies (
			domain TEXT NOT NULL,
			path TEXT NOT NULL,
			name TEXT NOT NULL,
			value TEXT NOT NULL,
			expires TEXT,
			secure INTEGER DEFAULT 0,
			http_only INTEGER DEFAULT 0,
			PRIMARY KEY (domain, path, name)
		);
	`)
	if err != nil {
		db.Close()
		return nil, err
	}

	// Create indexes
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at)`)
	if err != nil {
		db.Close()
		return nil, err
	}
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_recent_workspaces_last_opened ON recent_workspaces(last_opened DESC)`)
	if err != nil {
		db.Close()
		return nil, err
	}
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_workspace_tabs_accessed ON workspace_tabs(workspace_path, last_accessed)`)
	if err != nil {
		db.Close()
		return nil, err
	}
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_cookies_domain ON cookies(domain)`)
	if err != nil {
		db.Close()
		return nil, err
	}

	return &SQLiteStorage{db: db}, nil
}

// HistoryRepository Implementation

func (s *SQLiteStorage) SaveHistory(ctx context.Context, req core.Request, res core.Response) error {
	reqJSON, _ := json.Marshal(req)
	resJSON, _ := json.Marshal(res)

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO history (request, response)
		VALUES (?, ?)
	`, string(reqJSON), string(resJSON))
	
	return err
}

func (s *SQLiteStorage) GetHistory(ctx context.Context, limit int) ([]core.HistoryEntry, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, request, response, created_at
		FROM history
		ORDER BY created_at DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []core.HistoryEntry
	for rows.Next() {
		var entry core.HistoryEntry
		var reqJSON, resJSON string
		err := rows.Scan(&entry.ID, &reqJSON, &resJSON, &entry.CreatedAt)
		if err != nil {
			return nil, err
		}

		_ = json.Unmarshal([]byte(reqJSON), &entry.Request)
		_ = json.Unmarshal([]byte(resJSON), &entry.Response)
		history = append(history, entry)
	}
	return history, nil
}

func (s *SQLiteStorage) ClearHistory(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, "DELETE FROM history")
	return err
}

// Legacy Metadata operations

func (s *SQLiteStorage) SaveMetadata(ctx context.Context, key string, value string) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO workspace_meta (key, value)
		VALUES (?, ?)
		ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP
	`, key, value)
	return err
}

func (s *SQLiteStorage) GetMetadata(ctx context.Context, key string) (string, error) {
	var value string
	err := s.db.QueryRowContext(ctx, "SELECT value FROM workspace_meta WHERE key = ?", key).Scan(&value)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return value, err
}

// WorkspaceRepository Implementation

func (s *SQLiteStorage) SaveRecentWorkspace(ctx context.Context, path string, name string) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO recent_workspaces (path, name, last_opened)
		VALUES (?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(path) DO UPDATE SET last_opened=CURRENT_TIMESTAMP, name=excluded.name
	`, path, name)
	return err
}

func (s *SQLiteStorage) GetRecentWorkspaces(ctx context.Context) ([]core.RecentWorkspace, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT path, name, last_opened
		FROM recent_workspaces
		ORDER BY last_opened DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workspaces []core.RecentWorkspace
	for rows.Next() {
		var ws core.RecentWorkspace
		if err := rows.Scan(&ws.Path, &ws.Name, &ws.LastOpened); err != nil {
			return nil, err
		}
		workspaces = append(workspaces, ws)
	}
	return workspaces, nil
}

func (s *SQLiteStorage) RemoveRecentWorkspace(ctx context.Context, path string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM recent_workspaces WHERE path = ?`, path)
	return err
}

// SessionRepository Implementation

func (s *SQLiteStorage) SaveWindowState(ctx context.Context, state core.WindowState) error {
	bytes, err := json.Marshal(state)
	if err != nil {
		return err
	}
	_, err = s.db.ExecContext(ctx, `
		INSERT INTO window_state (key, value)
		VALUES ('main', ?)
		ON CONFLICT(key) DO UPDATE SET value=excluded.value
	`, string(bytes))
	return err
}

func (s *SQLiteStorage) GetWindowState(ctx context.Context) (*core.WindowState, error) {
	var value string
	err := s.db.QueryRowContext(ctx, `SELECT value FROM window_state WHERE key = 'main'`).Scan(&value)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var state core.WindowState
	if err := json.Unmarshal([]byte(value), &state); err != nil {
		return nil, err
	}
	return &state, nil
}

func (s *SQLiteStorage) SaveWorkspaceMetadata(ctx context.Context, workspacePath string, meta core.WorkspaceMetadata) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	expandedJSON, _ := json.Marshal(meta.ExpandedFolders)
	_, err = tx.ExecContext(ctx, `
		INSERT INTO workspace_session (workspace_path, active_tab_id, expanded_folders)
		VALUES (?, ?, ?)
		ON CONFLICT(workspace_path) DO UPDATE SET active_tab_id=excluded.active_tab_id, expanded_folders=excluded.expanded_folders
	`, workspacePath, meta.ActiveTabID, string(expandedJSON))
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `DELETE FROM workspace_tabs WHERE workspace_path = ?`, workspacePath)
	if err != nil {
		return err
	}

	for _, tab := range meta.OpenTabs {
		var isDirty int
		if tab.IsDirty {
			isDirty = 1
		}
		_, err = tx.ExecContext(ctx, `
			INSERT INTO workspace_tabs (workspace_path, tab_id, name, path, type, method, is_dirty, last_accessed)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`, workspacePath, tab.ID, tab.Name, tab.Path, tab.Type, tab.Method, isDirty, tab.LastAccessed)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *SQLiteStorage) GetWorkspaceMetadata(ctx context.Context, workspacePath string) (*core.WorkspaceMetadata, error) {
	var meta core.WorkspaceMetadata
	meta.ExpandedFolders = []string{}
	meta.OpenTabs = []core.Tab{}

	var activeTabID string
	var expandedJSON sql.NullString
	err := s.db.QueryRowContext(ctx, `
		SELECT active_tab_id, expanded_folders
		FROM workspace_session
		WHERE workspace_path = ?
	`, workspacePath).Scan(&activeTabID, &expandedJSON)
	
	if err == sql.ErrNoRows {
		return &meta, nil
	} else if err != nil {
		return nil, err
	}

	meta.ActiveTabID = activeTabID
	if expandedJSON.Valid && expandedJSON.String != "" {
		_ = json.Unmarshal([]byte(expandedJSON.String), &meta.ExpandedFolders)
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT tab_id, name, path, type, method, is_dirty, last_accessed
		FROM workspace_tabs
		WHERE workspace_path = ?
		ORDER BY last_accessed ASC
	`, workspacePath)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var tab core.Tab
		var isDirty int
		err := rows.Scan(&tab.ID, &tab.Name, &tab.Path, &tab.Type, &tab.Method, &isDirty, &tab.LastAccessed)
		if err != nil {
			return nil, err
		}
		tab.IsDirty = isDirty == 1
		meta.OpenTabs = append(meta.OpenTabs, tab)
	}

	return &meta, nil
}

func (s *SQLiteStorage) Close() error {
	return s.db.Close()
}

func (s *SQLiteStorage) SaveCookie(ctx context.Context, domain string, cookie *http.Cookie) error {
	var expiresStr string
	if !cookie.Expires.IsZero() {
		expiresStr = cookie.Expires.Format(time.RFC3339)
	}

	secureInt := 0
	if cookie.Secure {
		secureInt = 1
	}

	httpOnlyInt := 0
	if cookie.HttpOnly {
		httpOnlyInt = 1
	}

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO cookies (domain, path, name, value, expires, secure, http_only)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(domain, path, name) DO UPDATE SET
			value = excluded.value,
			expires = excluded.expires,
			secure = excluded.secure,
			http_only = excluded.http_only
	`, domain, cookie.Path, cookie.Name, cookie.Value, expiresStr, secureInt, httpOnlyInt)
	return err
}

func (s *SQLiteStorage) GetCookiesForDomain(ctx context.Context, domain string) ([]*http.Cookie, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT name, value, path, expires, secure, http_only
		FROM cookies
		WHERE ? LIKE '%' || domain OR domain = ? OR '.' || ? LIKE '%.' || domain
	`, domain, domain, domain)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cookies []*http.Cookie
	for rows.Next() {
		var name, value, pathStr, expiresStr string
		var secureInt, httpOnlyInt int
		err := rows.Scan(&name, &value, &pathStr, &expiresStr, &secureInt, &httpOnlyInt)
		if err != nil {
			return nil, err
		}

		var expires time.Time
		if expiresStr != "" {
			expires, _ = time.Parse(time.RFC3339, expiresStr)
		}

		cookies = append(cookies, &http.Cookie{
			Name:     name,
			Value:    value,
			Domain:   domain,
			Path:     pathStr,
			Expires:  expires,
			Secure:   secureInt == 1,
			HttpOnly: httpOnlyInt == 1,
		})
	}
	return cookies, nil
}

func (s *SQLiteStorage) DeleteCookie(ctx context.Context, domain string, name string, path string) error {
	_, err := s.db.ExecContext(ctx, `
		DELETE FROM cookies
		WHERE domain = ? AND name = ? AND path = ?
	`, domain, name, path)
	return err
}
