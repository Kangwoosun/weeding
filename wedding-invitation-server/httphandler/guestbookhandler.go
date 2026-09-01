package httphandler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/juhonamnam/wedding-invitation-server/sqldb"
	"github.com/juhonamnam/wedding-invitation-server/types"
)

type GuestbookHandler struct {
	http.Handler
}

func (h *GuestbookHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		offset, limit, err := parsePagination(r, 0, 20, 50)
		if err != nil {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		guestbook, err := sqldb.GetGuestbook(offset, limit)

		if err != nil {
			writeTextError(w, http.StatusInternalServerError, "InternalServerError")
			return
		}

		writeJSON(w, http.StatusOK, guestbook)
	} else if r.Method == http.MethodPost {
		decoder := json.NewDecoder(r.Body)
		var post types.GuestbookPostForCreate
		err := decoder.Decode(&post)
		if err != nil {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		post.Name = strings.TrimSpace(post.Name)
		post.Content = strings.TrimSpace(post.Content)
		if !validGuestbookPost(post) {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		err = sqldb.CreateGuestbookPost(post.Name, post.Content, post.Password)

		if err != nil {
			writeTextError(w, http.StatusInternalServerError, "InternalServerError")
			return
		}

		w.Header().Set("Content-Type", "application/json")
	} else if r.Method == http.MethodPut {
		decoder := json.NewDecoder(r.Body)
		var post types.GuestbookPostForDelete
		err := decoder.Decode(&post)
		if err != nil {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		if post.Id <= 0 || len(post.Password) < 4 || len(post.Password) > 20 {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		err = sqldb.DeleteGuestbookPost(post.Id, post.Password)

		if err != nil {
			if err.Error() == "INCORRECT_PASSWORD" {
				writeTextError(w, http.StatusForbidden, "Forbidden")
			} else {
				writeTextError(w, http.StatusInternalServerError, "InternalServerError")
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
	} else {
		writeTextError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
	}
}

var errInvalidRequest = errors.New("invalid request")

func parsePagination(r *http.Request, defaultOffset, defaultLimit, maxLimit int) (int, int, error) {
	query := r.URL.Query()
	offset := defaultOffset
	limit := defaultLimit

	if offsetQ := strings.TrimSpace(query.Get("offset")); offsetQ != "" {
		value, err := strconv.Atoi(offsetQ)
		if err != nil || value < 0 {
			return 0, 0, errInvalidRequest
		}
		offset = value
	}

	if limitQ := strings.TrimSpace(query.Get("limit")); limitQ != "" {
		value, err := strconv.Atoi(limitQ)
		if err != nil || value <= 0 || value > maxLimit {
			return 0, 0, errInvalidRequest
		}
		limit = value
	}

	return offset, limit, nil
}

func validGuestbookPost(post types.GuestbookPostForCreate) bool {
	nameLength := len([]rune(post.Name))
	contentLength := len([]rune(post.Content))
	passwordLength := len(post.Password)

	return nameLength > 0 &&
		nameLength <= 10 &&
		contentLength > 0 &&
		contentLength <= 100 &&
		passwordLength >= 4 &&
		passwordLength <= 20
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(value); err != nil {
		http.Error(w, "InternalServerError", http.StatusInternalServerError)
	}
}

func writeTextError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	w.Write([]byte(message))
}
