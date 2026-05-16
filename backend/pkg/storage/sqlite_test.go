package storage

import (
	"context"
	"os"
	"rester/backend/pkg/core"
	"testing"
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

	// Test Save
	err = s.SaveHistory(context.Background(), req, res)
	if err != nil {
		t.Fatalf("SaveHistory failed: %v", err)
	}

	// Test Get
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
}
