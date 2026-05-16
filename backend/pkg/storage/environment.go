package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"rester/backend/pkg/core"
)

type EnvironmentManager struct {
	workspacePath string
	activeEnv     string
}

func NewEnvironmentManager() *EnvironmentManager {
	return &EnvironmentManager{}
}

func (m *EnvironmentManager) ListEnvironments(ctx context.Context) ([]core.Environment, error) {
	if m.workspacePath == "" {
		return nil, nil
	}

	// 1. Look for http-client.env.json
	envFile := filepath.Join(m.workspacePath, "http-client.env.json")
	data, err := os.ReadFile(envFile)
	if err != nil {
		return nil, nil // No environments found is not an error
	}

	var envData map[string]map[string]string
	if err := json.Unmarshal(data, &envData); err != nil {
		return nil, fmt.Errorf("failed to parse environment file: %w", err)
	}

	var envs []core.Environment
	for name, vars := range envData {
		envs = append(envs, core.Environment{
			Name:      name,
			Variables: vars,
			IsActive:  name == m.activeEnv,
		})
	}

	return envs, nil
}

func (m *EnvironmentManager) GetEnvironmentByName(ctx context.Context, name string) (*core.Environment, error) {
	envs, err := m.ListEnvironments(ctx)
	if err != nil {
		return nil, err
	}

	for _, env := range envs {
		if env.Name == name {
			return &env, nil
		}
	}

	return nil, fmt.Errorf("environment not found: %s", name)
}

func (m *EnvironmentManager) GetActiveEnvironment(ctx context.Context) (*core.Environment, error) {
	if m.activeEnv == "" {
		return &core.Environment{Name: "No Environment"}, nil
	}
	return m.GetEnvironmentByName(ctx, m.activeEnv)
}

func (m *EnvironmentManager) UpdateVariable(ctx context.Context, envName string, key string, value string) error {
	return fmt.Errorf("writing to environment files not implemented yet")
}

func (m *EnvironmentManager) SetWorkspace(path string) {
	m.workspacePath = path
}
