package httphandler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGuestbookRejectsWhitespaceOnlyPost(t *testing.T) {
	handler := new(GuestbookHandler)
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/guestbook",
		strings.NewReader(`{"name":"   ","content":"hello","password":"1234"}`),
	)
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestParsePaginationDefaultsAndBounds(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/guestbook", nil)
	offset, limit, err := parsePagination(request, 0, 20, 50)
	if err != nil {
		t.Fatal(err)
	}
	if offset != 0 || limit != 20 {
		t.Fatalf("expected default pagination, got offset=%d limit=%d", offset, limit)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/guestbook?offset=-1&limit=20", nil)
	if _, _, err := parsePagination(request, 0, 20, 50); err == nil {
		t.Fatal("expected negative offset to fail")
	}

	request = httptest.NewRequest(http.MethodGet, "/api/guestbook?offset=0&limit=51", nil)
	if _, _, err := parsePagination(request, 0, 20, 50); err == nil {
		t.Fatal("expected excessive limit to fail")
	}
}
