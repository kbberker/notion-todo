#!/bin/bash
# PreToolUse hook: blocks Claude from reading secrets files (.env* and .dev.vars*)
# directly via Read/Grep, or indirectly via Bash commands like cat/grep/head/less/sed/etc.
# .env.example and .env.sample are allowed through since they hold no secrets.
set -euo pipefail

input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name // empty')

is_blocked_env() {
  local base
  base=$(basename -- "$1")
  case "$base" in
    .env.example|.env.sample) return 1 ;;
  esac
  [[ "$base" =~ ^\.env(\.[A-Za-z0-9_-]+)?$ ]] && return 0
  [[ "$base" =~ ^\.dev\.vars(\.[A-Za-z0-9_-]+)?$ ]]
}

deny() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
  exit 0
}

case "$tool_name" in
  Read|Grep)
    target=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.path // empty')
    if [[ -n "$target" ]] && is_blocked_env "$target"; then
      deny "Reading secrets files (.env*, .dev.vars*) is blocked by project policy (.claude/hooks/deny-env-read.sh). Use .env.example for reference instead."
    fi
    ;;
  Bash)
    command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    # Find .env-/.dev.vars-like path components (bounded by start/whitespace/quote/slash
    # on both sides) so we don't false-positive on names like "backup.env" or "environment.ts".
    while IFS= read -r tok; do
      [[ -z "$tok" ]] && continue
      if is_blocked_env "$tok"; then
        deny "Command appears to read a secrets file (.env*, .dev.vars*), which is blocked by project policy (.claude/hooks/deny-env-read.sh)."
      fi
    done < <(printf '%s' "$command" | perl -ne 'print "$1\n" while /(?:^|[\s"'"'"'\/])(\.env(?:\.[A-Za-z0-9_-]+)?|\.dev\.vars(?:\.[A-Za-z0-9_-]+)?)(?=$|[\s"'"'"'\/:])/g')
    ;;
esac

exit 0
