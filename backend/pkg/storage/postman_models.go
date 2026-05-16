package storage

type PostmanCollection struct {
	Info PostmanInfo `json:"info"`
	Item []PostmanItem `json:"item"`
}

type PostmanInfo struct {
	Name   string `json:"name"`
	Schema string `json:"schema"`
}

type PostmanItem struct {
	Name    string        `json:"name"`
	Request *PostmanRequest `json:"request,omitempty"`
	Item    []PostmanItem `json:"item,omitempty"`
}

type PostmanRequest struct {
	Method string          `json:"method"`
	URL    PostmanURL      `json:"url"`
	Header []PostmanHeader `json:"header"`
	Body   *PostmanBody    `json:"body,omitempty"`
	Event  []PostmanEvent  `json:"event,omitempty"`
}

type PostmanEvent struct {
	Listen string        `json:"listen"`
	Script PostmanScript `json:"script"`
}

type PostmanScript struct {
	Exec []string `json:"exec"`
	Type string   `json:"type"`
}

type PostmanURL struct {
	Raw string `json:"raw"`
}

type PostmanHeader struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type PostmanBody struct {
	Mode string `json:"mode"`
	Raw  string `json:"raw,omitempty"`
}

type PostmanEnvironment struct {
	Name   string                  `json:"name"`
	Values []PostmanEnvironmentValue `json:"values"`
}

type PostmanEnvironmentValue struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled bool   `json:"enabled"`
}
