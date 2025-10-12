#!/usr/bin/env bash
# Load environment variables from .env and run migrate with the given argument

set -e

# Default .env path and migration command
ENV_FILE="${ENV_FILE:-.env}"
MIGRATIONS_PATH="${MIGRATIONS_PATH:-db/migrations}"

# Ensure an argument was provided
if [ -z "$1" ]; then
  echo "Usage: $0 [up|down|version|force|...]"
  exit 1
fi

# Check that the .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Run migrate with the passed argument
echo "Running: migrate -database \"$DATABASE_URL\" -path \"$MIGRATIONS_PATH\" $1"
migrate -database "$DATABASE_URL" -path "$MIGRATIONS_PATH" "$1"

