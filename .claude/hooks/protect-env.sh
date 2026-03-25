#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.path // ""')

deny_patterns=(".env" ".env.local" ".env.production" ".envrc")

for pattern in "${deny_patterns[@]}"; do
  if [[ "$(basename "$file")" == $pattern ]]; then
    echo "🚫 Access to '$file' is blocked by security policy." >&2
    exit 2
  fi
done

exit 0
