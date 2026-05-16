package executor

import (
	"regexp"
	"strings"
)

var varRegex = regexp.MustCompile(`\{\{([^}]+)\}\}`)

// ResolveVariables replaces all instances of {{var}} with values from the env map.
// If a variable is not found in the map, it leaves it untouched.
func ResolveVariables(content string, env map[string]string) string {
	if env == nil {
		return content
	}

	return varRegex.ReplaceAllStringFunc(content, func(match string) string {
		// match is {{var}}, extract var
		varName := strings.TrimSpace(match[2 : len(match)-2])
		if val, ok := env[varName]; ok {
			return val
		}
		return match
	})
}

// ResolveMap replaces variables in all string values of a map.
func ResolveMap(m map[string]string, env map[string]string) map[string]string {
	if env == nil {
		return m
	}
	
	result := make(map[string]string)
	for k, v := range m {
		result[k] = ResolveVariables(v, env)
	}
	return result
}
