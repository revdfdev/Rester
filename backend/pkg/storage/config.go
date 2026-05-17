package storage

import (
	"os"
	"path/filepath"
)

type ConfigManager struct {
	path string
}

func NewConfigManager(filename string) *ConfigManager {
	// For now, save in current dir or user config dir
	configDir, _ := os.UserConfigDir()
	path := filepath.Join(configDir, "rester", filename)

	// Ensure directory exists
	os.MkdirAll(filepath.Dir(path), 0o755)

	return &ConfigManager{path: path}
}

func (m *ConfigManager) Save(settings string) error {
	return os.WriteFile(m.path, []byte(settings), 0o644)
}

func (m *ConfigManager) Load() (string, error) {
	data, err := os.ReadFile(m.path)
	if err != nil {
		if os.IsNotExist(err) {
			return "{}", nil
		}
		return "", err
	}
	return string(data), nil
}
