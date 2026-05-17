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

	executor := NewHttpExecutor(nil)
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

	executor := NewHttpExecutor(nil)
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

func TestHttpExecutor_InsecureAndRedirects(t *testing.T) {
	var redirectServer *httptest.Server
	redirectServer = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/redirect" {
			http.Redirect(w, r, "/target", http.StatusFound)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("target reached"))
	}))
	defer redirectServer.Close()

	executor := NewHttpExecutor(nil)

	// Test 1: followRedirects = false
	reqNoRedirect := core.Request{
		Method: "GET",
		URL:    redirectServer.URL + "/redirect",
		Headers: map[string]string{
			"@followRedirects": "false",
		},
	}
	respNoRedirect, err := executor.Execute(context.Background(), reqNoRedirect, core.Environment{}, core.ExecutionOptions{})
	if err != nil {
		t.Fatalf("Execute failed: %v", err)
	}
	if respNoRedirect.Status != http.StatusFound {
		t.Errorf("Expected status 302 (Found) since redirects were disabled, got %d", respNoRedirect.Status)
	}

	// Test 2: followRedirects = true (default)
	reqRedirect := core.Request{
		Method: "GET",
		URL:    redirectServer.URL + "/redirect",
	}
	respRedirect, err := executor.Execute(context.Background(), reqRedirect, core.Environment{}, core.ExecutionOptions{})
	if err != nil {
		t.Fatalf("Execute failed: %v", err)
	}
	if respRedirect.Status != http.StatusOK {
		t.Errorf("Expected status 200 (OK) since redirects were followed, got %d", respRedirect.Status)
	}
	if respRedirect.Body != "target reached" {
		t.Errorf("Expected body 'target reached', got '%s'", respRedirect.Body)
	}

	// Test 3: @insecure = true
	reqInsecure := core.Request{
		Method: "GET",
		URL:    redirectServer.URL,
		Headers: map[string]string{
			"@insecure": "true",
		},
	}
	respInsecure, err := executor.Execute(context.Background(), reqInsecure, core.Environment{}, core.ExecutionOptions{})
	if err != nil {
		t.Fatalf("Execute with insecure failed: %v", err)
	}
	if respInsecure.Status != http.StatusOK {
		t.Errorf("Expected status 200, got %d", respInsecure.Status)
	}
}
