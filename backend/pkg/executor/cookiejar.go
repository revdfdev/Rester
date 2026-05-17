package executor

import (
	"context"
	"net/http"
	"net/url"
	"rester/backend/pkg/core"
	"sync"
)

type SqliteCookieJar struct {
	storage core.Storage
	mu      sync.RWMutex
}

func NewSqliteCookieJar(storage core.Storage) *SqliteCookieJar {
	return &SqliteCookieJar{
		storage: storage,
	}
}

// SetCookies handles the receipt of the cookies in a reply for the given URL.
func (j *SqliteCookieJar) SetCookies(u *url.URL, cookies []*http.Cookie) {
	if j.storage == nil {
		return
	}
	j.mu.Lock()
	defer j.mu.Unlock()

	ctx := context.Background()
	for _, cookie := range cookies {
		domain := cookie.Domain
		if domain == "" {
			domain = u.Hostname()
		}
		
		if cookie.Path == "" {
			cookie.Path = "/"
		}

		_ = j.storage.SaveCookie(ctx, domain, cookie)
	}
}

// Cookies returns the cookies to send in a request for the given URL.
func (j *SqliteCookieJar) Cookies(u *url.URL) []*http.Cookie {
	if j.storage == nil {
		return nil
	}
	j.mu.RLock()
	defer j.mu.RUnlock()

	ctx := context.Background()
	domain := u.Hostname()
	stored, err := j.storage.GetCookiesForDomain(ctx, domain)
	if err != nil {
		return nil
	}

	var matched []*http.Cookie
	for _, cookie := range stored {
		if !pathMatches(u.Path, cookie.Path) {
			continue
		}
		if cookie.Secure && u.Scheme != "https" {
			continue
		}
		matched = append(matched, cookie)
	}
	return matched
}

func pathMatches(requestPath, cookiePath string) bool {
	if cookiePath == "" || cookiePath == "/" {
		return true
	}
	if requestPath == cookiePath {
		return true
	}
	if len(requestPath) > len(cookiePath) && requestPath[:len(cookiePath)] == cookiePath && requestPath[len(cookiePath)] == '/' {
		return true
	}
	return false
}
