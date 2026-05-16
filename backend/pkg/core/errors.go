package core

import "errors"

var (
	ErrNotFound       = errors.New("not found")
	ErrInternal       = errors.New("internal server error")
	ErrUnauthorized   = errors.New("unauthorized")
	ErrInvalidRequest = errors.New("invalid request")
	ErrCancelled      = errors.New("request cancelled")
	ErrTimeout        = errors.New("request timed out")
)
