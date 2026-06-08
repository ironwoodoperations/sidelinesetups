#!/bin/bash
# IRONWOOD FRAMEWORK v3.1 — PreToolUse hook
# Enforces CLAUDE.md DO NOT TOUCH list.
# Blocks Edit/Write to protected files. Read operations are not affected.
#
# CUSTOMIZE THIS LIST PER PROJECT — edit PROTECTED_PATTERNS below
# to match the "DO NOT TOUCH" section of that project's CLAUDE.md.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# DO NOT TOUCH patterns — match the CLAUDE.md "DO NOT TOUCH" section for THIS repo.
# Sideline Setups: payment flow (Square) and admin auth are change-controlled.
PROTECTED_PATTERNS=(
  "src/pages/Book\.tsx$"
  "supabase/functions/create-square-payment/"
  "src/components/AdminLayout\.tsx$"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    cat <<EOF >&2
BLOCKED by IRONWOOD CLAUDE.md DO NOT TOUCH list
File: $FILE_PATH
Pattern matched: $pattern
This file is protected. Changes require human approval first.
Ask the human before proceeding.
EOF
    echo '{"decision": "block", "reason": "Protected file in DO NOT TOUCH list"}'
    exit 2
  fi
done

exit 0
