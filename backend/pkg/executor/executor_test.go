package executor

import (
	"context"
	"net/http"
	"net/http/httptest"
	"rester/backend/pkg/core"
	"testing"
	"time"
)

func TestHttpExecutor_Execute(t *testing.T) {
	// Setup mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Test", "true")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("hello world"))
	}))
	defer server.Close()

	executor := NewHttpExecutor()
	req := core.Request{
		Method: "GET",
		URL:    server.URL,
	}

	resp, err := executor.Execute(context.Background(), req, core.Environment{}, core.ExecutionOptions{RequestID: "test-1"})
	if err != nil {
		t.Fatalf("Execute failed: %v", err)
	}

	if resp.Status != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.Status)
	}

	if resp.Body != "hello world" {
		t.Errorf("Expected body 'hello world', got '%s'", resp.Body)
	}

	if len(resp.Logs) == 0 {
		t.Errorf("Expected logs to be populated")
	}

	if resp.Timing.Total < 0 {
		t.Errorf("Expected timing total to be >= 0, got %d", resp.Timing.Total)
	}
}

func TestHttpExecutor_Cancel(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-r.Context().Done():
			return
		case <-time.After(100 * time.Millisecond):
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer server.Close()

	executor := NewHttpExecutor()
	req := core.Request{
		Method: "GET",
		URL:    server.URL,
	}

	// Run in background
	errChan := make(chan error, 1)
	go func() {
		_, err := executor.Execute(context.Background(), req, core.Environment{}, core.ExecutionOptions{RequestID: "cancel-test"})
		errChan <- err
	}()

	// Wait a bit then cancel
	time.Sleep(20 * time.Millisecond)
	err := executor.Cancel(context.Background(), "cancel-test")
	if err != nil {
		t.Fatalf("Cancel failed: %v", err)
	}

	err = <-errChan
	if err != core.ErrCancelled {
		t.Errorf("Expected ErrCancelled, got %v", err)
	}
}
