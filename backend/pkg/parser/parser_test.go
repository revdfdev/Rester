package parser

import (
	"context"
	"testing"
)

func TestParseContent(t *testing.T) {
	content := `
# This is a comment
@base_url = https://api.example.com

###
# @name GetUsers
GET {{base_url}}/users
Content-Type: application/json
X-Test: {{val}}

<%
console.log("Pre-request");
%>

###
POST https://httpbin.org/post
Authorization: Bearer 123

{
  "name": "John"
}

<%
test("Status is 200", () => {
  assert(response.status === 200);
});
%>
`
	p := NewParser()
	fileNode, err := p.ParseContent(context.Background(), content)
	if err != nil {
		t.Fatalf("ParseContent failed: %v", err)
	}

	// 1. Verify Variables
	if len(fileNode.Variables) != 1 {
		t.Errorf("Expected 1 variable definition, got %d", len(fileNode.Variables))
	} else if fileNode.Variables[0].Name != "base_url" {
		t.Errorf("Expected variable base_url, got %s", fileNode.Variables[0].Name)
	}

	// 2. Verify Requests
	if len(fileNode.Requests) != 2 {
		t.Errorf("Expected 2 requests, got %d", len(fileNode.Requests))
	}

	// First Request
	req1 := fileNode.Requests[0]
	if req1.Method != "GET" {
		t.Errorf("Req 1: Expected GET, got %s", req1.Method)
	}
	if req1.URL != "{{base_url}}/users" {
		t.Errorf("Req 1: Expected URL {{base_url}}/users, got %s", req1.URL)
	}
	if len(req1.Headers) != 2 {
		t.Errorf("Req 1: Expected 2 headers, got %d", len(req1.Headers))
	}
	if req1.PreRequestScript == nil {
		t.Errorf("Req 1: Expected pre-request script, got nil")
	}

	// Second Request
	req2 := fileNode.Requests[1]
	if req2.Method != "POST" {
		t.Errorf("Req 2: Expected POST, got %s", req2.Method)
	}
	if req2.Body == "" {
		t.Errorf("Req 2: Expected body, got empty")
	}
	if req2.TestScript == nil {
		t.Errorf("Req 2: Expected test script, got nil")
	}
}
