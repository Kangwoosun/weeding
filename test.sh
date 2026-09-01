#!/bin/sh
set -eu

: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN before running this script}"
: "${TELEGRAM_CHAT_ID:?Set TELEGRAM_CHAT_ID before running this script}"

curl --fail --silent --show-error \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${TELEGRAM_TEST_MESSAGE:-Hello, this is a test message!}" \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"
