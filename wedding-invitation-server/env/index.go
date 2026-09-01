package env

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

var AdminPassword string
var AllowOrigins []string
var DbPath string
var ServerPort string

func init() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Info: .env file not loaded; using process environment")
	}

	AdminPassword = os.Getenv("ADMIN_PASSWORD")
	DbPath = getEnv("DB_PATH", "./sql.db")
	ServerPort = normalizePort(getEnv("SERVER_PORT", "8080"))
	AllowOrigins = splitCSV(firstNonEmpty(os.Getenv("ALLOW_ORIGINS"), os.Getenv("ALLOW_ORIGIN")))
	if len(AllowOrigins) == 0 {
		AllowOrigins = []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}
}

func getEnv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			values = append(values, part)
		}
	}
	return values
}

func normalizePort(value string) string {
	trimmed := strings.TrimPrefix(strings.TrimSpace(value), ":")
	if trimmed == "" {
		return "8080"
	}
	if _, err := strconv.Atoi(trimmed); err != nil {
		return "8080"
	}
	return trimmed
}
