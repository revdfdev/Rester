package executor

import (
	"context"
	"sync"
)

// CancellationRegistry tracks active request contexts for cancellation
type CancellationRegistry struct {
	activeRequests map[string]context.CancelFunc
	mu             sync.Mutex
}

func NewCancellationRegistry() *CancellationRegistry {
	return &CancellationRegistry{
		activeRequests: make(map[string]context.CancelFunc),
	}
}

func (r *CancellationRegistry) Register(id string, cancel context.CancelFunc) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.activeRequests[id] = cancel
}

func (r *CancellationRegistry) Unregister(id string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.activeRequests, id)
}

func (r *CancellationRegistry) Cancel(id string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if cancel, ok := r.activeRequests[id]; ok {
		cancel()
		delete(r.activeRequests, id)
		return true
	}
	return false
}
