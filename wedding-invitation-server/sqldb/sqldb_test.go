package sqldb

import (
	"database/sql"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func setupTestDb(t *testing.T) {
	t.Helper()

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	db.SetMaxOpenConns(1)
	t.Cleanup(func() {
		db.Close()
	})

	SetDb(db)
}

func TestGetAttendanceFiltersByNameAndSide(t *testing.T) {
	setupTestDb(t)

	if err := CreateAttendance("groom", "Alice", "yes", 2); err != nil {
		t.Fatal(err)
	}
	if err := CreateAttendance("bride", "Bob", "no", 0); err != nil {
		t.Fatal(err)
	}

	response, err := GetAttendance(AttendanceLookupOptions{
		Name:  "Ali",
		Limit: 10,
	})
	if err != nil {
		t.Fatal(err)
	}
	if response.Total != 1 {
		t.Fatalf("expected one matching attendee, got %d", response.Total)
	}
	if response.Attendees[0].Name != "Alice" {
		t.Fatalf("expected Alice, got %q", response.Attendees[0].Name)
	}

	response, err = GetAttendance(AttendanceLookupOptions{
		Side:  "bride",
		Limit: 10,
	})
	if err != nil {
		t.Fatal(err)
	}
	if response.Total != 1 || response.Attendees[0].Name != "Bob" {
		t.Fatalf("expected Bob on bride side, got %+v", response.Attendees)
	}
}

func TestGetGuestbookEmptyResult(t *testing.T) {
	setupTestDb(t)

	response, err := GetGuestbook(0, 10)
	if err != nil {
		t.Fatal(err)
	}
	if response.Total != 0 {
		t.Fatalf("expected zero posts, got %d", response.Total)
	}
	if len(response.Posts) != 0 {
		t.Fatalf("expected empty posts slice, got %+v", response.Posts)
	}
}
