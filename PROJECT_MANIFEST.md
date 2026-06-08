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
| 2026-06-08 | Admin gate = hardened PIN, not Supabase session (PR 2) | Human (PR-2 fork) | Employees are PIN rows with no `auth.users` link, so reusing `supabase.auth` was unsatisfiable. Gate now re-verifies the employee id against the DB (active + admin/owner role) instead of trusting a forgeable sessionStorage flag |

## Security Boundary (PR 2)
Admin UI gated on a hardened PIN/employee-role check as of PR 2 — the admin area
re-verifies the signed-in employee id against the `employees` table (active + admin/owner
role) on every mount, replacing the forgeable `sessionStorage` flag. This is a UI/session
gate only. Server-side RLS enforcement of the admin role across tables is audited and
hardened separately in PR 3 — until then, the UI gate is NOT a substitute for RLS.
(Context: admins/staff authenticate by PIN against `employees`, which is not linked to
Supabase Auth `auth.users`; the customer area uses `supabase.auth` via useAuth.tsx. Moving
admins onto real Supabase Auth sessions remains a possible future change, out of PR-2 scope.
`/staff-login` still uses the original flag pattern and is left for a follow-up.)

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

---
## Session — 2026-06-08 16:11 UTC
- Branch: `fix/admin-auth-session`
- Commit: `880abaa` — Merge pull request #1 from ironwoodoperations/chore/framework-and-hygiene
- Author: csdevore2
- Files changed:

- Next recommended action: [Fill in next session: read this line, write what comes next]
