package executor

import (
	"context"
	"net/http"
	"net/http/httptest"
	"rester/backend/pkg/core"
	"testing"
	"time"
)

func TestExecute(t *testing.T) {
	// 1. Setup mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("Expected POST, got %s", r.Method)
		}
		if r.Header.Get("X-Test") != "foo" {
			t.Errorf("Expected X-Test: foo, got %s", r.Header.Get("X-Test"))
		}
		time.Sleep(2 * time.Millisecond) // Ensure timing is captured
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok"}`))
	}))
	defer server.Close()

	// 2. Prepare request
	req := core.Request{
		Method: "POST",
		URL:    server.URL,
		Headers: map[string]string{
			"X-Test": "{{val}}",
		},
		Body: `{"name": "tester"}`,
	}

	env := core.Environment{
		Variables: map[string]string{
			"val": "foo",
		},
	}

	// 3. Run execution
	e := NewExecutor()
	resp, err := e.Execute(context.Background(), req, env)
	if err != nil {
		t.Fatalf("Execute failed: %v", err)
	}

	if resp.Status != 200 {
		t.Errorf("Expected 200, got %d", resp.Status)
	}

	if resp.Body != `{"status": "ok"}` {
		t.Errorf("Expected body {\"status\": \"ok\"}, got %s", resp.Body)
	}

	if resp.Timing.Total <= 0 {
		t.Errorf("Expected timing > 0, got %d", resp.Timing.Total)
	}
}
