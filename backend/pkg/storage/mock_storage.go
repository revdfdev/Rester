package storage

import (
	"context"
	"rester/backend/pkg/core"
)

type MockStorage struct {
	History []core.Response
}

func NewMockStorage() *MockStorage {
	return &MockStorage{
		History: []core.Response{},
	}
}

func (m *MockStorage) SaveHistory(ctx context.Context, res core.Response) error {
	m.History = append(m.History, res)
	return nil
}

func (m *MockStorage) GetHistory(ctx context.Context, limit int) ([]core.Response, error) {
	if limit > len(m.History) {
		limit = len(m.History)
	}
	return m.History[:limit], nil
}

func (m *MockStorage) Close() error {
	return nil
}
