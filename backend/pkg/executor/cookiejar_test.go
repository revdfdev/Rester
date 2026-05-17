package executor

import (
	"net/http"
	"net/url"
	"os"
	"rester/backend/pkg/storage"
	"testing"
	"time"
)

func TestSqliteCookieJar(t *testing.T) {
	dbPath := "test_cookiejar.db"
	defer os.Remove(dbPath)

	store, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		t.Fatalf("Failed to create SQLiteStorage: %v", err)
	}
	defer store.Close()

	jar := NewSqliteCookieJar(store)

	u, _ := url.Parse("https://api.example.com/v1/users")
	cookies := []*http.Cookie{
		{
			Name:     "session",
			Value:    "abc",
			Path:     "/v1",
			Domain:   "example.com",
			Expires:  time.Now().Add(24 * time.Hour),
			Secure:   true,
			HttpOnly: true,
		},
		{
			Name:     "user",
			Value:    "rehan",
			Path:     "/",
			Domain:   "",
			Expires:  time.Now().Add(24 * time.Hour),
			Secure:   false,
			HttpOnly: false,
		},
	}

	// 1. Set Cookies
	jar.SetCookies(u, cookies)

	// 2. Query exact matching URL
	matched := jar.Cookies(u)
	if len(matched) != 2 {
		t.Errorf("Expected 2 cookies to match, got %d", len(matched))
	}

	// 3. Query subdomain and different path
	uSub, _ := url.Parse("https://sub.example.com/other")
	matchedSub := jar.Cookies(uSub)
	for _, c := range matchedSub {
		if c.Name == "session" {
			t.Errorf("session cookie path /v1 should not match path /other")
		}
		if c.Name == "user" {
			t.Errorf("user cookie with domain api.example.com should not match domain sub.example.com")
		}
	}

	// 4. Query exact matching path with HTTP (non-secure)
	uHttp, _ := url.Parse("http://api.example.com/v1/users")
	matchedHttp := jar.Cookies(uHttp)
	for _, c := range matchedHttp {
		if c.Name == "session" {
			t.Errorf("Secure cookie session should not be returned on http URL")
		}
	}
}
