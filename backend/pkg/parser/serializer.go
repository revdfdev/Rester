package parser

import (
	"fmt"
	"rester/backend/pkg/core"
	"strings"
)

// Serializer converts a FileNode (AST) back into a .http string
type Serializer struct{}

func NewSerializer() *Serializer {
	return &Serializer{}
}

func (s *Serializer) Serialize(node *core.FileNode) (string, error) {
	var builder strings.Builder

	// 1. Serialize Global Variables
	for _, v := range node.Variables {
		builder.WriteString(fmt.Sprintf("@%s = %s\n", v.Name, v.Value))
	}

	if len(node.Variables) > 0 {
		builder.WriteString("\n")
	}

	// 2. Serialize Requests
	for i, req := range node.Requests {
		// Request Name (@name)
		if req.Name != "" {
			builder.WriteString(fmt.Sprintf("### %s\n", req.Name))
		} else if i > 0 {
			builder.WriteString("###\n")
		}

		// Method and URL
		method := req.Method
		if method == "" {
			method = "GET"
		}
		builder.WriteString(fmt.Sprintf("%s %s\n", method, req.URL))

		// Headers
		for _, h := range req.Headers {
			builder.WriteString(fmt.Sprintf("%s: %s\n", h.Key, h.Value))
		}

		// Pre-Request Script
		if req.PreRequestScript != nil {
			builder.WriteString("\n< %\n")
			builder.WriteString(req.PreRequestScript.Content)
			builder.WriteString("\n% >\n")
		}

		// Body
		if req.Body != "" {
			builder.WriteString("\n")
			builder.WriteString(req.Body)
			builder.WriteString("\n")
		}

		// Test Script
		if req.TestScript != nil {
			builder.WriteString("\n< %\n")
			builder.WriteString(req.TestScript.Content)
			builder.WriteString("\n% >\n")
		}

		if i < len(node.Requests)-1 {
			builder.WriteString("\n")
		}
	}

	return builder.String(), nil
}
