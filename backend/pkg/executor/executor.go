package executor

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"net/http/httptrace"
	"rester/backend/pkg/core"
	"strings"
	"time"
)

type Executor struct {
	client *http.Client
}

func NewExecutor() *Executor {
	return &Executor{
		client: &http.Client{
			// Redirect policy is handled per-request in the Execute method if needed,
			// but for now we use a default client.
		},
	}
}

func (e *Executor) Execute(ctx context.Context, req core.Request, env core.Environment) (*core.Response, error) {
	// 1. Resolve variables in URL, Headers, Body (T014)
	resolvedURL := resolve(req.URL, env.Variables)
	resolvedBody := resolve(req.Body, env.Variables)

	// 2. Prepare HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, req.Method, resolvedURL, strings.NewReader(resolvedBody))
	if err != nil {
		return nil, err
	}

	for k, v := range req.Headers {
		httpReq.Header.Set(k, resolve(v, env.Variables))
	}

	// 3. Setup Timing Trace
	var dnsStart, tcpStart, tlsStart, ttfbStart time.Time
	detailed := &core.DetailedTiming{}

	trace := &httptrace.ClientTrace{
		DNSStart: func(_ httptrace.DNSStartInfo) { dnsStart = time.Now() },
		DNSDone:  func(_ httptrace.DNSDoneInfo) { detailed.DNS = time.Since(dnsStart).Milliseconds() },
		ConnectStart: func(_, _ string) { tcpStart = time.Now() },
		ConnectDone: func(_, _ string, _ error) { detailed.TCP = time.Since(tcpStart).Milliseconds() },
		TLSHandshakeStart: func() { tlsStart = time.Now() },
		TLSHandshakeDone:  func(_ tls.ConnectionState, _ error) { detailed.TLS = time.Since(tlsStart).Milliseconds() },
		GotFirstResponseByte: func() { detailed.TTFB = time.Since(ttfbStart).Milliseconds() },
	}
	httpReq = httpReq.WithContext(httptrace.WithClientTrace(httpReq.Context(), trace))

	// 4. Run Pre-request Script (T009)
	if req.PreRequestScript != "" {
		runtime := NewScriptRuntime()
		_, err := runtime.Run(ctx, req.PreRequestScript, req, nil)
		if err != nil {
			fmt.Printf("Pre-request script error: %v\n", err)
		}
	}

	// 5. Execute
	start := time.Now()
	ttfbStart = start
	resp, err := e.client.Do(httpReq)
	if err != nil {
		return &core.Response{
			Error:      err.Error(),
			RequestRef: req.ID,
		}, nil
	}
	defer resp.Body.Close()

	// 6. Capture Timing
	total := time.Since(start).Milliseconds()
	downloadStart := time.Now()

	// 7. Read Body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	detailed.Download = time.Since(downloadStart).Milliseconds()

	// 8. Map to core.Response
	headers := make(map[string]string)
	for k, v := range resp.Header {
		headers[k] = strings.Join(v, ", ")
	}

	coreRes := &core.Response{
		Status:     resp.StatusCode,
		StatusText: resp.Status,
		Headers:    headers,
		Body:       string(bodyBytes),
		Timing: core.Timing{
			Start:    start,
			Total:    total,
			Detailed: detailed,
		},
		RequestRef: req.ID,
	}

	// 8. Run Test Script (T008, T010)
	if req.TestScript != "" {
		runtime := NewScriptRuntime()
		testResults, err := runtime.Run(ctx, req.TestScript, req, coreRes)
		if err != nil {
			coreRes.Error = fmt.Sprintf("Test script error: %v", err)
		}
		coreRes.TestResults = testResults
	}

	return coreRes, nil
}

func (e *Executor) Cancel(ctx context.Context, requestID string) error {
	// Cancellation is handled by the context passed to Execute.
	return nil
}

func resolve(input string, variables map[string]string) string {
	for k, v := range variables {
		placeholder := "{{" + k + "}}"
		input = strings.ReplaceAll(input, placeholder, v)
	}
	return input
}
