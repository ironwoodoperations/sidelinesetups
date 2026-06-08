# PROJECT_MANIFEST — Sideline Setups
Last Updated: 2026-06-08 by Claude Code
Framework Version: v3.1

## Status
Current Phase:          Build
Sprint Goal:            Install Ironwood framework v3.1 + repo hygiene baseline
Sprint Status:          On Track
Blocking Risks:         none
Next Decision Needed:   Review + merge PR #1 (framework + hygiene)
Recommended Next Owner: Human (review), then Claude Code for PR 2 (payments) / PR 3 (admin auth)

## Current Wave
Wave: Execute
Task: framework-and-hygiene
Branch: chore/framework-and-hygiene
Wave output file: n/a (tooling/hygiene PR)
PR: [#N once opened, status: open]

## Decisions Log
| Date | Decision | Made By | Rationale |
|------|----------|---------|-----------|
| 2026-06-08 | MERGE MODE = auto-merge | Human (build plan) | Zero-company repo; flips to manual-merge at first real payment |
| 2026-06-08 | Package manager = npm | Human (build plan) | Removed bun lockfiles; CI uses `npm ci` |

## Open Questions
| # | Question | Assigned To | Due |
|---|----------|-------------|-----|

## Latest Handoff
From: / To: / Task: / Output Delivered:

## Files Changed This Sprint
[list — auto-appended by Stop hook below as sessions run]

## Migrations Required
[list or none]

## Env Vars Added
[list or none]

---

## Session Log
[Sessions are appended below by `.claude/hooks/session-end.sh` Stop hook.
Each session entry includes commit SHA, branch, PR number if open, files changed,
and a placeholder for the next recommended action. Do not edit entries above this line
manually unless updating status — entries below are append-only history.]
