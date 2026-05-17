package parser

import (
	"strings"
	"unicode"
)

type TokenType string

const (
	TokenMethod      TokenType = "METHOD"
	TokenURL         TokenType = "URL"
	TokenHeaderKey   TokenType = "HEADER_KEY"
	TokenHeaderValue TokenType = "HEADER_VALUE"
	TokenBody        TokenType = "BODY"
	TokenVariableDef TokenType = "VARIABLE_DEF"
	TokenVariableRef TokenType = "VARIABLE_REF"
	TokenComment     TokenType = "COMMENT"
	TokenSeparator   TokenType = "SEPARATOR"
	TokenScriptOpen  TokenType = "SCRIPT_OPEN"
	TokenScriptClose TokenType = "SCRIPT_CLOSE"
	TokenScriptContent TokenType = "SCRIPT_CONTENT"
	TokenEOF         TokenType = "EOF"
)

type Token struct {
	Type   TokenType
	Value  string
	Line   int
	Column int
}

type Lexer struct {
	input  string
	pos    int
	line   int
	column int
	tokens []Token
	state  lexerState
}

type lexerState int

const (
	stateStart lexerState = iota
	stateRequestLine
	stateHeaders
	stateBody
	stateScript
)

func NewLexer(input string) *Lexer {
	return &Lexer{
		input:  input,
		line:   1,
		column: 1,
		state:  stateStart,
	}
}

func (l *Lexer) Lex() []Token {
	for l.pos < len(l.input) {
		l.skipWhitespace()
		if l.pos >= len(l.input) {
			break
		}

		char := l.peek()

		// Separator (Always check)
		if char == '#' && strings.HasPrefix(l.remaining(), "###") {
			l.lexSeparator()
			l.state = stateStart
			continue
		}

		// Script blocks (Always check)
		if char == '<' && l.peekNext() == '%' {
			l.lexScript()
			continue
		}

		// Comments
		if char == '#' || (char == '/' && l.peekNext() == '/') {
			l.lexComment()
			continue
		}

		// Variables
		if char == '@' {
			l.lexVariableDef()
			continue
		}

		switch l.state {
		case stateStart:
			l.lexRequestLine()
		case stateHeaders:
			l.lexHeader()
		case stateBody:
			l.lexBodyLine()
		}
	}
	return l.tokens
}

func (l *Lexer) lexBodyLine() {
	start := l.pos
	line := l.line
	col := l.column
	
	for l.pos < len(l.input) && l.peek() != '\n' {
		// Check for script or separator mid-line (unlikely but possible)
		if l.peek() == '<' && l.peekNext() == '%' {
			break
		}
		if l.peek() == '#' && strings.HasPrefix(l.remaining(), "###") {
			break
		}
		l.advance()
	}
	
	// If we're at a newline, include it in the body line
	if l.pos < len(l.input) && l.peek() == '\n' {
		l.advance()
	}
	
	content := l.input[start:l.pos]
	if len(l.tokens) > 0 && l.tokens[len(l.tokens)-1].Type == TokenBody {
		l.tokens[len(l.tokens)-1].Value += content
	} else {
		l.tokens = append(l.tokens, Token{Type: TokenBody, Value: content, Line: line, Column: col})
	}
}

func (l *Lexer) peek() byte {
	if l.pos >= len(l.input) {
		return 0
	}
	return l.input[l.pos]
}

func (l *Lexer) peekNext() byte {
	if l.pos+1 >= len(l.input) {
		return 0
	}
	return l.input[l.pos+1]
}

func (l *Lexer) advance() byte {
	char := l.input[l.pos]
	l.pos++
	if char == '\n' {
		l.line++
		l.column = 1
	} else {
		l.column++
	}
	return char
}

func (l *Lexer) remaining() string {
	return l.input[l.pos:]
}

func (l *Lexer) skipWhitespace() {
	for l.pos < len(l.input) && unicode.IsSpace(rune(l.peek())) {
		// If we're in headers and see a double newline, transition to body
		remaining := l.remaining()
		if l.state == stateHeaders && (strings.HasPrefix(remaining, "\n\n") || strings.HasPrefix(remaining, "\r\n\r\n") || strings.HasPrefix(remaining, "\n\r\n")) {
			if strings.HasPrefix(remaining, "\r\n\r\n") {
				l.advance() // \r
				l.advance() // \n
				l.advance() // \r
				l.advance() // \n
			} else if strings.HasPrefix(remaining, "\n\r\n") {
				l.advance() // \n
				l.advance() // \r
				l.advance() // \n
			} else {
				l.advance() // \n
				l.advance() // \n
			}
			l.state = stateBody
			return
		}
		// If we're in headers and see a single newline, stay in headers
		l.advance()
	}
}

func (l *Lexer) lexComment() {
	start := l.pos
	line := l.line
	col := l.column
	for l.pos < len(l.input) && l.peek() != '\n' {
		l.advance()
	}
	val := strings.TrimRight(l.input[start:l.pos], "\r")
	l.tokens = append(l.tokens, Token{Type: TokenComment, Value: val, Line: line, Column: col})
}

func (l *Lexer) lexSeparator() {
	line := l.line
	col := l.column
	l.advance() // #
	l.advance() // #
	l.advance() // #
	for l.pos < len(l.input) && l.peek() != '\n' {
		l.advance()
	}
	l.tokens = append(l.tokens, Token{Type: TokenSeparator, Value: "###", Line: line, Column: col})
}

func (l *Lexer) lexVariableDef() {
	start := l.pos
	line := l.line
	col := l.column
	l.advance() // @
	for l.pos < len(l.input) && l.peek() != '\n' {
		l.advance()
	}
	val := strings.TrimRight(l.input[start:l.pos], "\r")
	l.tokens = append(l.tokens, Token{Type: TokenVariableDef, Value: val, Line: line, Column: col})
}

func (l *Lexer) lexRequestLine() {
	start := l.pos
	line := l.line
	col := l.column

	// Simple heuristic: read until end of line
	for l.pos < len(l.input) && l.peek() != '\n' {
		l.advance()
	}
	lineContent := strings.TrimRight(l.input[start:l.pos], "\r")
	parts := strings.SplitN(lineContent, " ", 2)
	
	if len(parts) == 2 {
		l.tokens = append(l.tokens, Token{Type: TokenMethod, Value: parts[0], Line: line, Column: col})
		l.tokens = append(l.tokens, Token{Type: TokenURL, Value: parts[1], Line: line, Column: col + len(parts[0]) + 1})
	} else {
		l.tokens = append(l.tokens, Token{Type: TokenMethod, Value: "GET", Line: line, Column: col})
		l.tokens = append(l.tokens, Token{Type: TokenURL, Value: parts[0], Line: line, Column: col})
	}
	l.state = stateHeaders
}

func (l *Lexer) lexHeader() {
	start := l.pos
	line := l.line
	col := l.column

	for l.pos < len(l.input) && l.peek() != ':' && l.peek() != '\n' {
		l.advance()
	}

	if l.peek() == ':' {
		key := l.input[start:l.pos]
		l.tokens = append(l.tokens, Token{Type: TokenHeaderKey, Value: strings.TrimSpace(key), Line: line, Column: col})
		l.advance() // :
		
		valStart := l.pos
		valCol := l.column
		for l.pos < len(l.input) && l.peek() != '\n' {
			l.advance()
		}
		val := strings.TrimRight(l.input[valStart:l.pos], "\r")
		l.tokens = append(l.tokens, Token{Type: TokenHeaderValue, Value: strings.TrimSpace(val), Line: line, Column: valCol})
	} else {
		// Not a header, must be start of body or something else
		l.state = stateBody
	}
}

func (l *Lexer) lexBody() {
	start := l.pos
	line := l.line
	col := l.column
	
	// Body continues until a separator or end of file
	for l.pos < len(l.input) {
		if l.peek() == '#' && strings.HasPrefix(l.remaining(), "###") {
			break
		}
		l.advance()
	}
	l.tokens = append(l.tokens, Token{Type: TokenBody, Value: l.input[start:l.pos], Line: line, Column: col})
}

func (l *Lexer) lexScript() {
	line := l.line
	col := l.column
	
	l.tokens = append(l.tokens, Token{Type: TokenScriptOpen, Value: "<%", Line: line, Column: col})
	l.advance() // <
	l.advance() // %
	
	start := l.pos
	contentLine := l.line
	contentCol := l.column
	
	for l.pos < len(l.input) {
		if l.peek() == '%' && l.peekNext() == '>' {
			break
		}
		l.advance()
	}
	
	l.tokens = append(l.tokens, Token{Type: TokenScriptContent, Value: l.input[start:l.pos], Line: contentLine, Column: contentCol})
	
	if l.pos < len(l.input) {
		l.tokens = append(l.tokens, Token{Type: TokenScriptClose, Value: "%>", Line: l.line, Column: l.column})
		l.advance() // %
		l.advance() // >
	}
}
