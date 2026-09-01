package sqldb

import (
	"fmt"
	"time"

	"github.com/juhonamnam/wedding-invitation-server/env"
	"github.com/juhonamnam/wedding-invitation-server/types"
	"github.com/juhonamnam/wedding-invitation-server/util"
)

func initializeGuestbookTable() error {
	_, err := sqlDb.Exec(`
		CREATE TABLE IF NOT EXISTS guestbook (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(20),
			content VARCHAR(200),
			password VARCHAR(20),
			timestamp INTEGER,
			valid BOOLEAN DEFAULT TRUE
		)
	`)
	if err != nil {
		return err
	}

	_, err = sqlDb.Exec(`
		CREATE INDEX IF NOT EXISTS guestbook_timestamp
		ON guestbook (timestamp)
	`)

	if err != nil {
		return err
	}

	_, err = sqlDb.Exec(`
		CREATE INDEX IF NOT EXISTS guestbook_valid
		ON guestbook (valid)
	`)

	return err
}

func GetGuestbook(offset, limit int) (*types.GuestbookGetResponse, error) {
	guestbookGetResponse := &types.GuestbookGetResponse{
		Posts: []types.GuestbookPostForGet{},
	}

	totalRow := sqlDb.QueryRow(`
		SELECT COUNT(*)
		FROM guestbook
		WHERE valid = TRUE
	`)
	if err := totalRow.Scan(&guestbookGetResponse.Total); err != nil {
		return nil, err
	}

	rows, err := sqlDb.Query(`
		SELECT id, name, content, timestamp
		FROM guestbook
		WHERE valid = TRUE
		ORDER BY timestamp DESC, id DESC
		LIMIT ? OFFSET ?
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		guestbookPost := types.GuestbookPostForGet{}
		err := rows.Scan(&guestbookPost.Id, &guestbookPost.Name, &guestbookPost.Content, &guestbookPost.Timestamp)
		if err != nil {
			return nil, err
		}
		guestbookGetResponse.Posts = append(guestbookGetResponse.Posts, guestbookPost)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return guestbookGetResponse, nil
}

func CreateGuestbookPost(name, content, password string) error {
	phash, err := util.HashPassword(password)
	if err != nil {
		return err
	}

	result, err := sqlDb.Exec(`
		INSERT INTO guestbook (name, content, password, timestamp)
		VALUES (?, ?, ?, ?)
	`, name, content, phash, time.Now().Unix())
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("NO_ROWS_AFFECTED")
	}

	return nil
}

func DeleteGuestbookPost(id int, password string) error {
	passwordMatch := false
	if env.AdminPassword != "" && env.AdminPassword == password {
		passwordMatch = true
	} else {
		guestbook, err := sqlDb.Query(`
		SELECT password
		FROM guestbook
		WHERE id = ? AND valid = TRUE
	`, id)
		if err != nil {
			return err
		}
		defer guestbook.Close()

		phash := ""

		for guestbook.Next() {
			err = guestbook.Scan(&phash)

			if err != nil {
				return err
			}
		}

		if phash == "" {
			return fmt.Errorf("NO_GUESTBOOK_POST_FOUND")
		}

		if util.CheckPasswordHash(password, phash) {
			passwordMatch = true
		}
	}

	if !passwordMatch {
		return fmt.Errorf("INCORRECT_PASSWORD")
	}

	result, err := sqlDb.Exec(`
		UPDATE guestbook
		SET valid = FALSE
		WHERE id = ?
	`, id)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("NO_ROWS_AFFECTED")
	}

	return nil
}
