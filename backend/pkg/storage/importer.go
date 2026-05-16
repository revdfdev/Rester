package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type PostmanImporter struct{}

func NewPostmanImporter() *PostmanImporter {
	return &PostmanImporter{}
}

func (i *PostmanImporter) Import(jsonPath string, destDir string) error {
	data, err := os.ReadFile(jsonPath)
	if err != nil {
		return err
	}

	var collection PostmanCollection
	if err := json.Unmarshal(data, &collection); err != nil {
		return fmt.Errorf("failed to parse Postman collection: %w", err)
	}

	// Create root directory for collection
	root := filepath.Join(destDir, collection.Info.Name)
	if err := os.MkdirAll(root, 0755); err != nil {
		return err
	}

	return i.importItems(collection.Item, root)
}

func (i *PostmanImporter) ImportEnvironment(jsonPath string, destDir string) error {
	data, err := os.ReadFile(jsonPath)
	if err != nil {
		return err
	}

	var postmanEnv PostmanEnvironment
	if err := json.Unmarshal(data, &postmanEnv); err != nil {
		return fmt.Errorf("failed to parse Postman environment: %w", err)
	}

	// Load existing http-client.env.json if it exists
	envFile := filepath.Join(destDir, "http-client.env.json")
	existingData := make(map[string]map[string]string)
	
	if fileData, err := os.ReadFile(envFile); err == nil {
		json.Unmarshal(fileData, &existingData)
	}

	// Add new environment
	newEnv := make(map[string]string)
	for _, val := range postmanEnv.Values {
		if val.Enabled {
			newEnv[val.Key] = val.Value
		}
	}
	existingData[postmanEnv.Name] = newEnv

	// Save back
	finalData, err := json.MarshalIndent(existingData, "", "    ")
	if err != nil {
		return err
	}

	return os.WriteFile(envFile, finalData, 0644)
}

func (i *PostmanImporter) importItems(items []PostmanItem, parentDir string) error {
	for _, item := range items {
		if item.Request != nil {
			// It's a request
			if err := i.writeRequest(item, parentDir); err != nil {
				return err
			}
		} else if item.Item != nil {
			// It's a folder
			folderPath := filepath.Join(parentDir, item.Name)
			if err := os.MkdirAll(folderPath, 0755); err != nil {
				return err
			}
			if err := i.importItems(item.Item, folderPath); err != nil {
				return err
			}
		}
	}
	return nil
}

func (i *PostmanImporter) writeRequest(item PostmanItem, dir string) error {
	req := item.Request
	var sb strings.Builder

	// Method and URL
	sb.WriteString(fmt.Sprintf("%s %s\n", req.Method, req.URL.Raw))

	// Headers
	for _, h := range req.Header {
		sb.WriteString(fmt.Sprintf("%s: %s\n", h.Key, h.Value))
	}

	sb.WriteString("\n")

	// Body
	if req.Body != nil && req.Body.Mode == "raw" {
		sb.WriteString(req.Body.Raw)
		sb.WriteString("\n")
	}

	// Scripts
	for _, event := range req.Event {
		script := strings.Join(event.Script.Exec, "\n")
		// Best-effort mapping
		script = strings.ReplaceAll(script, "pm.test", "client.test")
		script = strings.ReplaceAll(script, "pm.expect", "client.assert")
		script = strings.ReplaceAll(script, "pm.response.to.have.status", "client.assert(response.status === ")
		
		sb.WriteString("\n<%\n")
		sb.WriteString(script)
		sb.WriteString("\n%>\n")
	}

	// Filename: sanitize and add .http
	safeName := strings.ReplaceAll(item.Name, "/", "_")
	fileName := filepath.Join(dir, safeName+".http")

	return os.WriteFile(fileName, []byte(sb.String()), 0644)
}
