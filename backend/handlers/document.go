package handlers

import (
	"context"
	"rester/backend/pkg/core"
	"rester/backend/pkg/parser"
)

type DocumentHandler struct {
	ctx    context.Context
	parser *parser.Parser
	serial *parser.Serializer
}

func NewDocumentHandler() *DocumentHandler {
	return &DocumentHandler{
		parser: parser.NewParser(),
		serial: parser.NewSerializer(),
	}
}

func (h *DocumentHandler) SetContext(ctx context.Context) {
	h.ctx = ctx
}

func (h *DocumentHandler) ParseContent(content string) (*core.FileNode, error) {
	return h.parser.ParseContent(h.ctx, content)
}

func (h *DocumentHandler) SerializeNode(node *core.FileNode) (string, error) {
	return h.serial.Serialize(node)
}
