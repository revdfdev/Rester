package core

import "errors"

var (
	ErrRequestNotFound    = errors.New("request not found")
	ErrCollectionNotFound = errors.New("collection not found")
	ErrParserFailed       = errors.New("failed to parse .http file")
	ErrExecutionFailed    = errors.New("http execution failed")
	ErrInvalidMethod      = errors.New("invalid http method")
	ErrCancelled          = errors.New("operation cancelled")
)
