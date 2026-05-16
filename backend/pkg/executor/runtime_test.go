package executor

import (
	"context"
	"rester/backend/pkg/core"
	"strings"
	"testing"
)

func TestScriptRuntime_Run(t *testing.T) {
	ctx := context.Background()
	req := core.Request{URL: "http://example.com", Method: "GET"}
	res := &core.Response{
		Status: 200,
		Body:   `{"id": 1, "name": "test"}`,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}

	t.Run("basic assertion", func(t *testing.T) {
		runtime := NewScriptRuntime()
		script := `
			client.test("Status is 200", () => {
				client.assert(response.status === 200);
			});
			client.test("Name is test", () => {
				client.assert(response.body.name === "test");
			});
		`
		results, err := runtime.Run(ctx, script, req, res)
		if err != nil {
			t.Fatalf("runtime error: %v", err)
		}

		if len(results) != 2 {
			t.Errorf("expected 2 results, got %d", len(results))
		}
		if !results[0].Passed || !results[1].Passed {
			t.Errorf("expected all tests to pass, got %v", results)
		}
	})

	t.Run("failed assertion", func(t *testing.T) {
		runtime := NewScriptRuntime()
		script := `
			client.test("Status is 404", () => {
				client.assert(response.status === 404, "Wrong status");
			});
		`
		results, err := runtime.Run(ctx, script, req, res)
		if err != nil {
			t.Fatalf("runtime error: %v", err)
		}

		if len(results) != 1 {
			t.Errorf("expected 1 result, got %d", len(results))
		}
		if results[0].Passed {
			t.Error("expected test to fail")
		}
		if results[0].Message != "Wrong status" {
			t.Errorf("expected error message 'Wrong status', got '%s'", results[0].Message)
		}
	})

	t.Run("timeout protection", func(t *testing.T) {
		runtime := NewScriptRuntime()
		script := `while(true) {}`
		_, err := runtime.Run(ctx, script, req, res)
		if err == nil || !strings.Contains(err.Error(), "timeout") {
			t.Errorf("expected timeout error, got %v", err)
		}
	})
}
