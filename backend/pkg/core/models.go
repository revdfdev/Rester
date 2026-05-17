package core

import (
	"time"
)

// Request represents a single HTTP request definition
type Request struct {
	ID       string                 `json:"id"`
	Name     string                 `json:"name,omitempty"`
	Method   string                 `json:"method"`
	URL      string                 `json:"url"`
	Headers  map[string]string      `json:"headers"`
	Body             string                 `json:"body,omitempty"`
	PreRequestScript string                 `json:"pre_request_script,omitempty"`
	TestScript       string                 `json:"test_script,omitempty"`
	Metadata         map[string]interface{} `json:"metadata,omitempty"`
}

// FileNode represents the root of a parsed .http file
type FileNode struct {
	Variables []VariableDef `json:"variables"`
	Requests  []RequestNode `json:"requests"`
}

// VariableDef represents a @name = value definition
type VariableDef struct {
	Name  string `json:"name"`
	Value string `json:"value"`
	Line  int    `json:"line"`
}

// RequestNode represents a single HTTP/GraphQL/gRPC request in the file
type RequestNode struct {
	ID                string            `json:"id"`
	Name              string            `json:"name,omitempty"` // From @name comment
	Method            string            `json:"method"`
	URL               string            `json:"url"`
	Headers           []HeaderNode      `json:"headers"`
	Body              string            `json:"body,omitempty"`
	PreRequestScript  *ScriptBlock      `json:"pre_request_script,omitempty"`
	TestScript        *ScriptBlock      `json:"test_script,omitempty"`
	LineRange         [2]int            `json:"line_range"`
	Metadata          map[string]string `json:"metadata,omitempty"`
}

// HeaderNode represents a single HTTP header
type HeaderNode struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Line  int    `json:"line"`
}

// ScriptBlock represents a < % ... % > block
type ScriptBlock struct {
	Content   string `json:"content"`
	LineRange [2]int `json:"line_range"`
}

// Collection represents a group of requests mapped to a filesystem directory
type Collection struct {
	Path     string       `json:"path"`
	Name     string       `json:"name"`
	Requests []Request    `json:"requests,omitempty"`
	Folders  []Collection `json:"folders,omitempty"`
}

// Tab represents an open editor tab state
type Tab struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Path         string `json:"path"`
	Type         string `json:"type"` // http, graphql, grpc
	Method       string `json:"method,omitempty"`
	IsDirty      bool   `json:"isDirty"`
	LastAccessed int64  `json:"lastAccessed"`
	Content      string `json:"content,omitempty"`
}

// WorkspaceMetadata represents UI and app state specific to a workspace
type WorkspaceMetadata struct {
	ExpandedFolders []string `json:"expandedFolders"`
	PinnedRequests  []string `json:"pinnedRequests"`
	OpenTabs        []Tab    `json:"openTabs"`
	ActiveTabID     string   `json:"activeTabId"`
	LastOpenedAt    string   `json:"lastOpenedAt"`
}

// Environment represents a named set of variables
type Environment struct {
	Name      string            `json:"name"`
	Variables map[string]string `json:"variables"`
	IsActive  bool              `json:"is_active"`
}

// Response represents the result of an HTTP execution
type Response struct {
	Status      int               `json:"status"`
	StatusText  string            `json:"status_text"`
	Headers     map[string]string `json:"headers"`
	Body        string            `json:"body"`
	Timing      Timing            `json:"timing"`
	Error       string            `json:"error,omitempty"`
	RequestRef  string            `json:"request_ref,omitempty"`
	TestResults []TestResult      `json:"test_results,omitempty"`
	Logs        []string          `json:"logs,omitempty"` // Execution logs
}

// TestResult represents the outcome of a single test case
type TestResult struct {
	Name    string `json:"name"`
	Passed  bool   `json:"passed"`
	Message string `json:"message,omitempty"`
}

// Timing contains execution timing metrics
type Timing struct {
	Start    time.Time       `json:"start"`
	TTFB     int64           `json:"ttfb"`  // Milliseconds
	Total    int64           `json:"total"` // Milliseconds
	Detailed *DetailedTiming `json:"detailed,omitempty"`
}

// HistoryEntry combines request and response for history tracking
type HistoryEntry struct {
	ID        int64     `json:"id"`
	Request   Request   `json:"request"`
	Response  Response  `json:"response"`
	CreatedAt string    `json:"created_at"`
}

// DetailedTiming contains granular performance metrics
type DetailedTiming struct {
	DNS      int64 `json:"dns"`
	TCP      int64 `json:"tcp"`
	TLS      int64 `json:"tls"`
	TTFB     int64 `json:"ttfb"`
	Download int64 `json:"download"`
}

// RecentWorkspace represents a previously opened workspace
type RecentWorkspace struct {
	Path       string `json:"path"`
	Name       string `json:"name"`
	LastOpened string `json:"last_opened"`
}

// WindowState represents the size and display mode of the app window
type WindowState struct {
	Width     int  `json:"width"`
	Height    int  `json:"height"`
	Maximized bool `json:"maximized"`
}
