package parser

import (
	"context"
	"os"
	"rester/backend/pkg/core"
	"strings"
)

type Parser struct {
	tokens []Token
	pos    int
}

func NewParser() *Parser {
	return &Parser{}
}

func (p *Parser) ParseFile(ctx context.Context, path string) (*core.FileNode, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return p.ParseContent(ctx, string(content))
}

func (p *Parser) ParseContent(ctx context.Context, content string) (*core.FileNode, error) {
	lexer := NewLexer(content)
	p.tokens = lexer.Lex()
	p.pos = 0

	fileNode := &core.FileNode{
		Variables: []core.VariableDef{},
		Requests:  []core.RequestNode{},
	}

	for p.pos < len(p.tokens) {
		token := p.peek()
		switch token.Type {
		case TokenVariableDef:
			fileNode.Variables = append(fileNode.Variables, p.parseVariableDef())
		case TokenSeparator:
			p.advance()
		case TokenMethod, TokenURL:
			fileNode.Requests = append(fileNode.Requests, p.parseRequest())
		case TokenComment:
			// For now, we skip comments unless they are part of a request
			p.advance()
		default:
			p.advance()
		}
	}

	return fileNode, nil
}

func (p *Parser) ShallowParseContent(ctx context.Context, content string) (*core.FileNode, error) {
	lexer := NewLexer(content)
	p.tokens = lexer.Lex()
	p.pos = 0

	fileNode := &core.FileNode{
		Variables: []core.VariableDef{},
		Requests:  []core.RequestNode{},
	}

	for p.pos < len(p.tokens) {
		token := p.peek()
		if token.Type == TokenMethod || token.Type == TokenURL {
			// Just add a skeleton request node
			req := core.RequestNode{
				Method: "GET", // default
			}
			if token.Type == TokenMethod {
				req.Method = p.advance().Value
			}
			if p.peek().Type == TokenURL {
				req.URL = p.advance().Value
			}
			fileNode.Requests = append(fileNode.Requests, req)
			
			// Skip until next separator or request
			for p.pos < len(p.tokens) && p.peek().Type != TokenSeparator && p.peek().Type != TokenMethod && p.peek().Type != TokenURL {
				p.advance()
			}
		} else {
			p.advance()
		}
	}

	return fileNode, nil
}

func (p *Parser) peek() Token {
	if p.pos >= len(p.tokens) {
		return Token{Type: TokenEOF}
	}
	return p.tokens[p.pos]
}

func (p *Parser) advance() Token {
	token := p.peek()
	p.pos++
	return token
}

func (p *Parser) parseVariableDef() core.VariableDef {
	token := p.advance()
	// @name = value
	val := strings.TrimPrefix(token.Value, "@")
	parts := strings.SplitN(val, "=", 2)
	name := strings.TrimSpace(parts[0])
	value := ""
	if len(parts) == 2 {
		value = strings.TrimSpace(parts[1])
	}
	return core.VariableDef{
		Name:  name,
		Value: value,
		Line:  token.Line,
	}
}

func (p *Parser) parseRequest() core.RequestNode {
	req := core.RequestNode{
		Headers:   []core.HeaderNode{},
		LineRange: [2]int{p.peek().Line, p.peek().Line},
	}

	// 1. Method and URL
	if p.peek().Type == TokenMethod {
		req.Method = p.advance().Value
	}
	if p.peek().Type == TokenURL {
		req.URL = p.advance().Value
	}

	// 2. Headers and Scripts
	seenBody := false
	for p.pos < len(p.tokens) {
		token := p.peek()
		if token.Type == TokenHeaderKey {
			keyToken := p.advance()
			valToken := p.advance()
			req.Headers = append(req.Headers, core.HeaderNode{
				Key:   keyToken.Value,
				Value: valToken.Value,
				Line:  keyToken.Line,
			})
		} else if token.Type == TokenScriptOpen {
			script := p.parseScript()
			if !seenBody {
				req.PreRequestScript = &script
			} else {
				req.TestScript = &script
			}
		} else if token.Type == TokenBody {
			req.Body = p.advance().Value
			seenBody = true
		} else if token.Type == TokenSeparator || token.Type == TokenMethod || token.Type == TokenURL {
			break
		} else {
			p.advance()
		}
	}

	req.LineRange[1] = p.peek().Line
	return req
}

func (p *Parser) parseScript() core.ScriptBlock {
	startToken := p.advance() // <%
	contentToken := p.advance() // content
	endToken := p.advance()   // %>
	
	return core.ScriptBlock{
		Content:   contentToken.Value,
		LineRange: [2]int{startToken.Line, endToken.Line},
	}
}
