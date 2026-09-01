package httphandler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAttendanceRejectsInvalidCreate(t *testing.T) {
	handler := new(AttendanceHandler)
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/attendance",
		strings.NewReader(`{"side":"groom","name":"   ","meal":"yes","count":1}`),
	)
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestParseAttendanceLookup(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/attendance?name=Alice&side=groom&offset=2&limit=3", nil)
	options, err := parseAttendanceLookup(request)
	if err != nil {
		t.Fatal(err)
	}
	if options.Name != "Alice" || options.Side != "groom" || options.Offset != 2 || options.Limit != 3 {
		t.Fatalf("unexpected lookup options: %+v", options)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/attendance?side=friend", nil)
	if _, err := parseAttendanceLookup(request); err == nil {
		t.Fatal("expected invalid side to fail")
	}
}
