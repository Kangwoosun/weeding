package sqldb

import (
	"strings"
	"time"

	"github.com/juhonamnam/wedding-invitation-server/types"
)

func initializeAttendanceTable() error {
	_, err := sqlDb.Exec(`
		CREATE TABLE IF NOT EXISTS attendance (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			side VARCHAR(10),
			name VARCHAR(20),
			meal VARCHAR(20),
			count INTEGER,
			timestamp INTEGER
		)
	`)
	if err != nil {
		return err
	}

	_, err = sqlDb.Exec(`
		CREATE INDEX IF NOT EXISTS attendance_timestamp
		ON attendance (timestamp)
	`)
	if err != nil {
		return err
	}

	_, err = sqlDb.Exec(`
		CREATE INDEX IF NOT EXISTS attendance_name
		ON attendance (name)
	`)
	return err
}

func CreateAttendance(side, name, meal string, count int) error {
	_, err := sqlDb.Exec(`
		INSERT INTO attendance (side, name, meal, count, timestamp)
		VALUES (?, ?, ?, ?, ?)
	`, side, name, meal, count, time.Now().Unix())
	if err != nil {
		return err
	}

	return nil
}

type AttendanceLookupOptions struct {
	Id     int
	Side   string
	Name   string
	Offset int
	Limit  int
}

func GetAttendance(options AttendanceLookupOptions) (*types.AttendanceGetResponse, error) {
	where, args := buildAttendanceWhere(options)

	totalQuery := "SELECT COUNT(*) FROM attendance" + where
	totalRow := sqlDb.QueryRow(totalQuery, args...)

	response := &types.AttendanceGetResponse{
		Attendees: []types.AttendanceForGet{},
	}
	if err := totalRow.Scan(&response.Total); err != nil {
		return nil, err
	}

	queryArgs := append([]interface{}{}, args...)
	queryArgs = append(queryArgs, options.Limit, options.Offset)
	rows, err := sqlDb.Query(`
		SELECT id, side, name, meal, count, timestamp
		FROM attendance
	`+where+`
		ORDER BY timestamp DESC, id DESC
		LIMIT ? OFFSET ?
	`, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		attendance := types.AttendanceForGet{}
		err := rows.Scan(
			&attendance.Id,
			&attendance.Side,
			&attendance.Name,
			&attendance.Meal,
			&attendance.Count,
			&attendance.Timestamp,
		)
		if err != nil {
			return nil, err
		}
		response.Attendees = append(response.Attendees, attendance)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return response, nil
}

func buildAttendanceWhere(options AttendanceLookupOptions) (string, []interface{}) {
	clauses := []string{}
	args := []interface{}{}

	if options.Id > 0 {
		clauses = append(clauses, "id = ?")
		args = append(args, options.Id)
	}
	if options.Side != "" {
		clauses = append(clauses, "side = ?")
		args = append(args, options.Side)
	}
	if options.Name != "" {
		clauses = append(clauses, "name LIKE ?")
		args = append(args, "%"+options.Name+"%")
	}

	if len(clauses) == 0 {
		return "", args
	}

	return " WHERE " + strings.Join(clauses, " AND "), args
}
