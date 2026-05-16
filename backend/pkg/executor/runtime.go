package executor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"rester/backend/pkg/core"
	"time"

	"github.com/dop251/goja"
)

type ScriptRuntime struct {
	vm      *goja.Runtime
	results []core.TestResult
}

func NewScriptRuntime() *ScriptRuntime {
	vm := goja.New()
	return &ScriptRuntime{
		vm:      vm,
		results: []core.TestResult{},
	}
}

func (r *ScriptRuntime) Run(ctx context.Context, script string, req core.Request, res *core.Response) ([]core.TestResult, error) {
	// 1. Inject client globals
	r.vm.Set("client", map[string]interface{}{
		"test": func(name string, fn func()) {
			testResult := core.TestResult{Name: name, Passed: true}
			defer func() {
				if err := recover(); err != nil {
					testResult.Passed = false
					testResult.Message = fmt.Sprintf("%v", err)
				}
				r.results = append(r.results, testResult)
			}()
			fn()
		},
		"assert": func(condition bool, message string) {
			if !condition {
				if message == "" {
					message = "Assertion failed"
				}
				panic(message)
			}
		},
		"log": func(val interface{}) {
			fmt.Printf("[JS LOG] %v\n", val)
		},
	})

	// 2. Inject request/response context
	r.vm.Set("request", req)
	if res != nil {
		// Try to parse body as JSON for easier access in scripts
		var jsonBody interface{}
		if err := json.Unmarshal([]byte(res.Body), &jsonBody); err == nil {
			// Success - inject as object
			r.vm.Set("response", map[string]interface{}{
				"status":  res.Status,
				"headers": res.Headers,
				"body":    jsonBody,
			})
		} else {
			// Fail - inject as raw response
			r.vm.Set("response", res)
		}
	}

	// 3. Setup timeout protection
	time.AfterFunc(2*time.Second, func() {
		r.vm.Interrupt("timeout")
	})

	// 4. Execute script
	_, err := r.vm.RunString(script)
	if err != nil {
		var jsErr *goja.Exception
		if errors.As(err, &jsErr) {
			return r.results, fmt.Errorf("js error: %v", jsErr.String())
		}
		if err.Error() == "timeout" {
			return r.results, errors.New("script execution timed out")
		}
		return r.results, err
	}

	return r.results, nil
}
