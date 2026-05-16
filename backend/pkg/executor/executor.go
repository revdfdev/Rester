package executor

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptrace"
	"rester/backend/pkg/core"
	"strings"
	"time"
)

type HttpExecutor struct {
	client   *http.Client
	registry *CancellationRegistry
}

func NewHttpExecutor() *HttpExecutor {
	return &HttpExecutor{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		registry: NewCancellationRegistry(),
	}
}

func (e *HttpExecutor) Execute(ctx context.Context, req core.Request, env core.Environment, opts core.ExecutionOptions) (*core.Response, error) {
	// Setup request context with cancellation
	execCtx, cancel := context.WithCancel(ctx)
	if opts.TimeoutMs > 0 {
		execCtx, cancel = context.WithTimeout(ctx, time.Duration(opts.TimeoutMs)*time.Millisecond)
	}
	defer cancel()

	if opts.RequestID != "" {
		e.registry.Register(opts.RequestID, cancel)
		defer e.registry.Unregister(opts.RequestID)
	}

	start := time.Now()
	var logs []string

	// Setup tracing
	var dnsStart, tcpStart, tlsStart, ttfbStart time.Time
	var dnsDone, tcpDone, tlsDone, ttfbDone time.Duration

	trace := &httptrace.ClientTrace{
		DNSStart: func(_ httptrace.DNSStartInfo) {
			dnsStart = time.Now()
			logs = append(logs, "DNS Lookup started...")
		},
		DNSDone: func(info httptrace.DNSDoneInfo) {
			dnsDone = time.Since(dnsStart)
			logs = append(logs, fmt.Sprintf("DNS Lookup finished: %v", dnsDone))
		},
		ConnectStart: func(_, _ string) {
			tcpStart = time.Now()
			logs = append(logs, "Connecting to server...")
		},
		ConnectDone: func(_, _ string, err error) {
			tcpDone = time.Since(tcpStart)
			if err != nil {
				logs = append(logs, fmt.Sprintf("Connection failed: %v", err))
			} else {
				logs = append(logs, fmt.Sprintf("Connected: %v", tcpDone))
			}
		},
		TLSHandshakeStart: func() {
			tlsStart = time.Now()
			logs = append(logs, "TLS Handshake started...")
		},
		TLSHandshakeDone: func(_ tls.ConnectionState, err error) {
			tlsDone = time.Since(tlsStart)
			if err != nil {
				logs = append(logs, fmt.Sprintf("TLS Handshake failed: %v", err))
			} else {
				logs = append(logs, fmt.Sprintf("TLS Handshake finished: %v", tlsDone))
			}
		},
		GotFirstResponseByte: func() {
			ttfbDone = time.Since(ttfbStart)
			logs = append(logs, fmt.Sprintf("First byte received (TTFB): %v", ttfbDone))
		},
	}

	// 1. Resolve variables
	resolvedURL := ResolveVariables(req.URL, env.Variables)
	resolvedHeaders := ResolveMap(req.Headers, env.Variables)
	resolvedBody := ResolveVariables(req.Body, env.Variables)

	// 2. Prepare HTTP request
	httpReq, err := http.NewRequestWithContext(execCtx, req.Method, resolvedURL, strings.NewReader(resolvedBody))
	if err != nil {
		return nil, err
	}

	for k, v := range resolvedHeaders {
		httpReq.Header.Set(k, v)
	}

	ttfbStart = time.Now()
	httpReq = httpReq.WithContext(httptrace.WithClientTrace(httpReq.Context(), trace))

	logs = append(logs, fmt.Sprintf("Sending %s %s", req.Method, req.URL))
	
	resp, err := e.client.Do(httpReq)
	if err != nil {
		if errors.Is(execCtx.Err(), context.DeadlineExceeded) {
			return nil, core.ErrTimeout
		}
		if errors.Is(execCtx.Err(), context.Canceled) {
			return nil, core.ErrCancelled
		}
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	total := time.Since(start)
	logs = append(logs, fmt.Sprintf("Request complete. Total duration: %v", total))

	headers := make(map[string]string)
	for k, v := range resp.Header {
		headers[k] = strings.Join(v, ", ")
	}

	return &core.Response{
		Status:     resp.StatusCode,
		StatusText: resp.Status,
		Headers:    headers,
		Body:       string(bodyBytes),
		Timing: core.Timing{
			Start: start,
			Total: total.Milliseconds(),
			Detailed: &core.DetailedTiming{
				DNS:      dnsDone.Milliseconds(),
				TCP:      tcpDone.Milliseconds(),
				TLS:      tlsDone.Milliseconds(),
				TTFB:     ttfbDone.Milliseconds(),
				Download: time.Since(start).Milliseconds() - ttfbDone.Milliseconds(),
			},
		},
		Logs: logs,
	}, nil
}

func (e *HttpExecutor) Cancel(ctx context.Context, requestID string) error {
	if e.registry.Cancel(requestID) {
		return nil
	}
	return core.ErrNotFound
}
