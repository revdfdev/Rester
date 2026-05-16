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

	res := core.Response{
		Status:     200,
		StatusText: "OK",
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       `{"id": 1}`,
		RequestRef: "req_123",
	}

	// Test Save
	err = s.SaveHistory(context.Background(), res)
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

	if history[0].RequestRef != "req_123" {
		t.Errorf("Expected request_ref req_123, got %s", history[0].RequestRef)
	}
}
