package executor

import (
	"context"
	"rester/backend/pkg/core"
)

type Runner struct {
	parser      core.ParserService
	executor    core.ExecutionService
	environment core.EnvironmentService
}

func NewRunner(p core.ParserService, e core.ExecutionService, env core.EnvironmentService) *Runner {
	return &Runner{
		parser:      p,
		executor:    e,
		environment: env,
	}
}

func (r *Runner) RunFile(ctx context.Context, path string, envName string) (*core.Response, error) {
	// 1. Parse the file
	fileNode, err := r.parser.ParseFile(ctx, path)
	if err != nil {
		return nil, err
	}

	if len(fileNode.Requests) == 0 {
		return nil, core.ErrNotFound
	}

	// 2. Load environment if specified
	var env core.Environment
	if envName != "" {
		if e, err := r.environment.GetEnvironmentByName(ctx, envName); err == nil && e != nil {
			env = *e
		}
	}

	// 3. Just run the first request for now in CLI
	reqNode := fileNode.Requests[0]
	req := core.Request{
		Method:  reqNode.Method,
		URL:     reqNode.URL,
		Headers: make(map[string]string),
		Body:    reqNode.Body,
	}
	for _, h := range reqNode.Headers {
		req.Headers[h.Key] = h.Value
	}

	return r.executor.Execute(ctx, req, env, core.ExecutionOptions{})
}
