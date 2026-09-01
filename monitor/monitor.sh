#!/bin/sh
set -eu

TARGET_URL="${WEB_HEALTHCHECK_TARGET_URL:-http://wedding-invitation:3000/}"
INTERVAL="${HEALTHCHECK_INTERVAL_SECONDS:-30}"
TIMEOUT="${HEALTHCHECK_TIMEOUT_SECONDS:-5}"
RETRY_COUNT="${HEALTHCHECK_RETRY_COUNT:-3}"
COOLDOWN="${HEALTHCHECK_ALERT_COOLDOWN_SECONDS:-300}"
SERVICE_NAME="${MONITOR_SERVICE_NAME:-wedding-invitation}"
STATE_DIR="/tmp/monitor"
STATUS_FILE="${STATE_DIR}/status"
LAST_ALERT_FILE="${STATE_DIR}/last_alert"
ERROR_FILE="${STATE_DIR}/last_error"

mkdir -p "$STATE_DIR"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

now_epoch() {
  date +%s
}

send_message() {
  message="$1"

  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    echo "$(timestamp) dry-run telegram alert: $message"
    return 0
  fi

  curl -fsS \
    --max-time "$TIMEOUT" \
    --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=${message}" \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" >/dev/null ||
    echo "$(timestamp) failed to send telegram alert"
}

check_once() {
  http_code="$(
    curl -sS -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$TARGET_URL" 2>"$ERROR_FILE" || true
  )"

  if [ "$http_code" -ge 200 ] 2>/dev/null && [ "$http_code" -lt 400 ] 2>/dev/null; then
    echo "$http_code"
    return 0
  fi

  if [ "$http_code" = "000" ] || [ -z "$http_code" ]; then
    error_detail="$(cat "$ERROR_FILE" 2>/dev/null || true)"
    echo "curl error: ${error_detail:-connection failed}"
  else
    echo "http status: $http_code"
  fi
  return 1
}

check_with_retries() {
  attempt=1
  last_result=""

  while [ "$attempt" -le "$RETRY_COUNT" ]; do
    if result="$(check_once)"; then
      echo "$result"
      return 0
    fi

    last_result="$result"
    if [ "$attempt" -lt "$RETRY_COUNT" ]; then
      sleep 1
    fi
    attempt=$((attempt + 1))
  done

  echo "$last_result"
  return 1
}

while true; do
  if result="$(check_with_retries)"; then
    previous_status="$(cat "$STATUS_FILE" 2>/dev/null || echo "unknown")"
    echo "up" >"$STATUS_FILE"
    if [ "$previous_status" = "down" ]; then
      message="RECOVERY: ${SERVICE_NAME} reachable
Target URL: ${TARGET_URL}
Timestamp: $(timestamp)
HTTP status: ${result}
Container/service: ${SERVICE_NAME}"
      send_message "$message"
    else
      echo "$(timestamp) ok: ${TARGET_URL} returned ${result}"
    fi
  else
    current_time="$(now_epoch)"
    previous_status="$(cat "$STATUS_FILE" 2>/dev/null || echo "unknown")"
    last_alert="$(cat "$LAST_ALERT_FILE" 2>/dev/null || echo "0")"
    elapsed=$((current_time - last_alert))

    echo "down" >"$STATUS_FILE"
    if [ "$previous_status" != "down" ] || [ "$elapsed" -ge "$COOLDOWN" ]; then
      echo "$current_time" >"$LAST_ALERT_FILE"
      message="FAILURE: ${SERVICE_NAME} unreachable
Target URL: ${TARGET_URL}
Timestamp: $(timestamp)
Failure: ${result}
Container/service: ${SERVICE_NAME}"
      send_message "$message"
    else
      echo "$(timestamp) failure suppressed by cooldown: ${result}"
    fi
  fi

  sleep "$INTERVAL"
done
