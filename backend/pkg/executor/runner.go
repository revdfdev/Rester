package executor

import (
	"context"
	"fmt"
	"rester/backend/pkg/core"
)

type Runner struct {
	parser   core.ParserService
	executor core.ExecutionService
	env      core.EnvironmentService
}

func NewRunner(p core.ParserService, e core.ExecutionService, env core.EnvironmentService) *Runner {
	return &Runner{
		parser:   p,
		executor: e,
		env:      env,
	}
}

func (r *Runner) RunFile(ctx context.Context, path string, envName string) (*core.Response, error) {
	// 1. Parse the file
	fileNode, err := r.parser.ParseFile(ctx, path)
	if err != nil {
		return nil, fmt.Errorf("failed to parse file: %w", err)
	}

	if len(fileNode.Requests) == 0 {
		return nil, fmt.Errorf("no requests found in file")
	}

	// 2. Load environment
	var environment core.Environment
	if envName != "" {
		envPtr, err := r.env.GetEnvironmentByName(ctx, envName)
		if err != nil {
			return nil, err
		}
		environment = *envPtr
	} else {
		envPtr, _ := r.env.GetActiveEnvironment(ctx)
		if envPtr != nil {
			environment = *envPtr
		}
	}

	// 3. Merge variables (file-local variables take precedence)
	for _, v := range fileNode.Variables {
		if environment.Variables == nil {
			environment.Variables = make(map[string]string)
		}
		environment.Variables[v.Name] = v.Value
	}

	// 4. Execute the first request (standard for CLI runner)
	reqNode := fileNode.Requests[0]
	
	// Map RequestNode to core.Request
	headers := make(map[string]string)
	for _, h := range reqNode.Headers {
		headers[h.Key] = h.Value
	}

	req := core.Request{
		ID:               reqNode.ID,
		Name:             reqNode.Name,
		Method:           reqNode.Method,
		URL:              reqNode.URL,
		Headers:          headers,
		Body:             reqNode.Body,
		PreRequestScript: "", // Map these if needed
		TestScript:       "",
	}
	if reqNode.PreRequestScript != nil {
		req.PreRequestScript = reqNode.PreRequestScript.Content
	}
	if reqNode.TestScript != nil {
		req.TestScript = reqNode.TestScript.Content
	}

	return r.executor.Execute(ctx, req, environment)
}
