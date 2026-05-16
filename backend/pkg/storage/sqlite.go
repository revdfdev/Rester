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
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	// Create tables
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			request_ref TEXT,
			status INTEGER,
			status_text TEXT,
			headers TEXT,
			body TEXT,
			timing TEXT,
			error TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
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

func (s *SQLiteStorage) SaveHistory(ctx context.Context, res core.Response) error {
	headersJSON, _ := json.Marshal(res.Headers)
	timingJSON, _ := json.Marshal(res.Timing)

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO history (request_ref, status, status_text, headers, body, timing, error)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, res.RequestRef, res.Status, res.StatusText, string(headersJSON), res.Body, string(timingJSON), res.Error)
	
	return err
}

func (s *SQLiteStorage) GetHistory(ctx context.Context, limit int) ([]core.Response, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT request_ref, status, status_text, headers, body, timing, error
		FROM history
		ORDER BY created_at DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []core.Response
	for rows.Next() {
		var res core.Response
		var headersJSON, timingJSON string
		err := rows.Scan(&res.RequestRef, &res.Status, &res.StatusText, &headersJSON, &res.Body, &timingJSON, &res.Error)
		if err != nil {
			return nil, err
		}

		json.Unmarshal([]byte(headersJSON), &res.Headers)
		json.Unmarshal([]byte(timingJSON), &res.Timing)
		history = append(history, res)
	}
	return history, nil
}

func (s *SQLiteStorage) Close() error {
	return s.db.Close()
}
