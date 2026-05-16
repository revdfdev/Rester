package storage

import (
	"context"
	"database/sql"
	"encoding/json"
	"rester/backend/pkg/core"

	_ "modernc.org/sqlite"
)

type SQLiteStorage struct {
	db *sql.DB
}

func NewSQLiteStorage(path string) (*SQLiteStorage, error) {
	// Add busy timeout and other optimizations to the DSN if using different drivers,
	// but here we configure the DB object directly.
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	// Optimization: Enable WAL mode for better concurrency
	_, err = db.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		return nil, err
	}

	// Optimization: Set busy timeout to 5 seconds
	_, err = db.Exec("PRAGMA busy_timeout=5000;")
	if err != nil {
		return nil, err
	}

	// Create tables - Migration: Drop old history table if it has the old schema
	// We check for the 'request_ref' column which was part of the old schema but not the new one.
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
	`)
	if err != nil {
		return nil, err
	}

	// Create indexes
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at)`)
	if err != nil {
		return nil, err
	}

	return &SQLiteStorage{db: db}, nil
}

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

		json.Unmarshal([]byte(reqJSON), &entry.Request)
		json.Unmarshal([]byte(resJSON), &entry.Response)
		history = append(history, entry)
	}
	return history, nil
}

func (s *SQLiteStorage) ClearHistory(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, "DELETE FROM history")
	return err
}

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
		return "", nil // Return empty string if not found, not an error
	}
	return value, err
}

func (s *SQLiteStorage) Close() error {
	return s.db.Close()
}
