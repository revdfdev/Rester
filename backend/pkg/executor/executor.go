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
	workspaceManager core.WorkspaceService
	defaultTransport *http.Transport
	registry         *CancellationRegistry
}

func NewHttpExecutor(workspaceManager core.WorkspaceService) *HttpExecutor {
	return &HttpExecutor{
		workspaceManager: workspaceManager,
		defaultTransport: &http.Transport{
			MaxIdleConns:        100,
			IdleConnTimeout:     90 * time.Second,
			TLSHandshakeTimeout: 10 * time.Second,
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

	// 2. Determine TLS & Insecure configurations
	isInsecure := isHeaderTrue(resolvedHeaders, "@insecure", "X-Insecure", "Insecure")
	
	// Prepare custom isolated Transport if insecure, otherwise default
	var transport http.RoundTripper = e.defaultTransport
	if isInsecure {
		logs = append(logs, "Bypassing SSL certificate validation (insecure skip verify)...")
		transport = &http.Transport{
			MaxIdleConns:        100,
			IdleConnTimeout:     90 * time.Second,
			TLSHandshakeTimeout: 10 * time.Second,
			TLSClientConfig:     &tls.Config{InsecureSkipVerify: true},
		}
	}

	// 3. Cookie Jar Integration (workspace-scoped)
	var jar http.CookieJar
	if e.workspaceManager != nil {
		session := e.workspaceManager.GetSessionStorage()
		if session != nil {
			jar = NewSqliteCookieJar(session)
		}
	}

	// 4. Client redirect configurations
	redirectLimit := 10
	followRedirects := true
	if isHeaderFalse(resolvedHeaders, "@followRedirects", "X-Follow-Redirects", "followRedirects") {
		followRedirects = false
		logs = append(logs, "Redirect following is disabled.")
	}

	timeout := 30 * time.Second
	if opts.TimeoutMs > 0 {
		timeout = time.Duration(opts.TimeoutMs) * time.Millisecond
	}

	// Build the isolated client
	client := &http.Client{
		Timeout:   timeout,
		Transport: transport,
		Jar:       jar,
	}

	if !followRedirects {
		client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		}
	} else {
		client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
			if len(via) >= redirectLimit {
				return fmt.Errorf("stopped after %d redirects", redirectLimit)
			}
			logs = append(logs, fmt.Sprintf("Following redirect to: %s", req.URL))
			return nil
		}
	}

	// Remove custom metadata tags from request headers before transmitting
	cleanHeaders := make(http.Header)
	for k, v := range resolvedHeaders {
		if strings.HasPrefix(k, "@") {
			continue // Skip custom executor metadata headers
		}
		cleanHeaders.Set(k, v)
	}

	// 5. Prepare HTTP request
	httpReq, err := http.NewRequestWithContext(execCtx, req.Method, resolvedURL, strings.NewReader(resolvedBody))
	if err != nil {
		return nil, err
	}

	// Set headers
	httpReq.Header = cleanHeaders

	ttfbStart = time.Now()
	httpReq = httpReq.WithContext(httptrace.WithClientTrace(httpReq.Context(), trace))

	logs = append(logs, fmt.Sprintf("Sending %s %s", req.Method, resolvedURL))
	
	resp, err := client.Do(httpReq)
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
	logs = append(logs, fmt.Sprintf("Request complete. Status: %s. Total duration: %v", resp.Status, total))

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

func isHeaderTrue(headers map[string]string, keys ...string) bool {
	for _, key := range keys {
		for hk, hv := range headers {
			if strings.EqualFold(hk, key) && strings.EqualFold(hv, "true") {
				return true
			}
		}
	}
	return false
}

func isHeaderFalse(headers map[string]string, keys ...string) bool {
	for _, key := range keys {
		for hk, hv := range headers {
			if strings.EqualFold(hk, key) && strings.EqualFold(hv, "false") {
				return true
			}
		}
	}
	return false
}
