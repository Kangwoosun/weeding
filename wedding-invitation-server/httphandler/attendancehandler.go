package httphandler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/juhonamnam/wedding-invitation-server/sqldb"
	"github.com/juhonamnam/wedding-invitation-server/types"
)

type AttendanceHandler struct {
	http.Handler
}

func (h *AttendanceHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		options, err := parseAttendanceLookup(r)
		if err != nil {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		attendance, err := sqldb.GetAttendance(options)
		if err != nil {
			writeTextError(w, http.StatusInternalServerError, "InternalServerError")
			return
		}

		if options.Id > 0 && attendance.Total == 0 {
			writeTextError(w, http.StatusNotFound, "NotFound")
			return
		}

		writeJSON(w, http.StatusOK, attendance)
	} else if r.Method == http.MethodPost {
		decoder := json.NewDecoder(r.Body)
		var attendance types.AttendanceCreate
		err := decoder.Decode(&attendance)
		if err != nil {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		attendance.Side = strings.TrimSpace(attendance.Side)
		attendance.Name = strings.TrimSpace(attendance.Name)
		attendance.Meal = strings.TrimSpace(attendance.Meal)
		if !validAttendance(attendance) {
			writeTextError(w, http.StatusBadRequest, "BadRequest")
			return
		}

		err = sqldb.CreateAttendance(attendance.Side, attendance.Name, attendance.Meal, attendance.Count)

		if err != nil {
			writeTextError(w, http.StatusInternalServerError, "InternalServerError")
			return
		}

		w.Header().Set("Content-Type", "application/json")
	} else {
		writeTextError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
	}
}

func parseAttendanceLookup(r *http.Request) (sqldb.AttendanceLookupOptions, error) {
	query := r.URL.Query()
	options := sqldb.AttendanceLookupOptions{
		Offset: 0,
		Limit:  50,
	}

	if idQ := strings.TrimSpace(query.Get("id")); idQ != "" {
		id, err := strconv.Atoi(idQ)
		if err != nil || id <= 0 {
			return options, errInvalidRequest
		}
		options.Id = id
	}

	if offsetQ := strings.TrimSpace(query.Get("offset")); offsetQ != "" {
		offset, err := strconv.Atoi(offsetQ)
		if err != nil || offset < 0 {
			return options, errInvalidRequest
		}
		options.Offset = offset
	}

	if limitQ := strings.TrimSpace(query.Get("limit")); limitQ != "" {
		limit, err := strconv.Atoi(limitQ)
		if err != nil || limit <= 0 || limit > 100 {
			return options, errInvalidRequest
		}
		options.Limit = limit
	}

	options.Side = strings.TrimSpace(query.Get("side"))
	if options.Side != "" && !validSide(options.Side) {
		return options, errInvalidRequest
	}

	options.Name = strings.TrimSpace(query.Get("name"))
	if len([]rune(options.Name)) > 20 {
		return options, errInvalidRequest
	}

	return options, nil
}

func validAttendance(attendance types.AttendanceCreate) bool {
	return validSide(attendance.Side) &&
		validMeal(attendance.Meal) &&
		len([]rune(attendance.Name)) > 0 &&
		len([]rune(attendance.Name)) <= 10 &&
		attendance.Count >= 0 &&
		attendance.Count <= 99
}

func validSide(side string) bool {
	return side == "groom" || side == "bride"
}

func validMeal(meal string) bool {
	return meal == "yes" || meal == "undecided" || meal == "no"
}
