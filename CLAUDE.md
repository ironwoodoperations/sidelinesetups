# Sideline Setups — Claude Code Session Context
# READ THIS ENTIRE FILE BEFORE TOUCHING ANYTHING.

## Project
Project ID: IRONWOOD-SIDELINE-BOOKING-2026
Business Unit: [TBD — fill in business unit]
Objective: Online booking + admin platform for Sideline Setups.
KPI Target: [TBD — measurable outcome]
Framework Version: v3.1 (branch + PR + auto-merge)

## Stack
Frontend: React + Vite (Vite + SWC, shadcn/ui, Tailwind)
Database: Supabase (Postgres + Auth + Edge Functions)
Hosting: [TBD — not yet configured in-repo]
Payments: Square (Supabase Edge Function `create-square-payment`)
Email: [TBD]
SMS: Supabase Edge Functions (`send-sms`, `process-sms-queue`)
Code: GitHub
CI/CD: GitHub Actions (.github/workflows/ci.yml)

## Environment Variables Required (no values in repo — local .env is gitignored)
Client (Vite, exposed to browser via import.meta.env — anon/publishable only):
- VITE_SUPABASE_URL
- VITE_SUPABASE_PROJECT_ID
- VITE_SUPABASE_PUBLISHABLE_KEY

Server-side secrets live in Supabase Edge Function config, NOT in client code or .env:
- SUPABASE_SERVICE_ROLE_KEY
- Square + SMS provider secrets (see `supabase/functions/*`)

See `.env.example` for the client variable names.

## Current Sprint Goal
[One sentence — what ships at the end of this sprint]

## DO NOT TOUCH (requires human approval before changes)
The hook in `.claude/hooks/protect-files.sh` will physically block edits to these paths.
Edit the PROTECTED_PATTERNS array in that script if this list changes.

- src/pages/Book.tsx — payment booking flow (Square)
- supabase/functions/create-square-payment/** — Square payment edge function
- src/components/AdminLayout.tsx — admin authentication gate

## Naming Conventions
- Files: kebab-case
- Components: PascalCase
- DB tables: snake_case
- DB columns: snake_case
- API routes: /api/[resource]/[action]
- Env vars: SCREAMING_SNAKE_CASE
- Git branches: `<type>/<short-name>` — see GIT_RULES.md

## Tenancy
This is a single-business application (Sideline Setups), not multi-tenant SaaS.
The security invariants still hold:
- `service_role` key NEVER appears in client-side code
- Customer/admin data access is gated by Supabase RLS policies
- Edge functions verify auth before privileged operations

## Git Workflow (v3.1)
All code goes through a branch + PR + auto-merge. See GIT_RULES.md for the full rules.

Quick reference:
```
git checkout -b <type>/<name>
git add -A && git commit -m "..."
git push -u origin <type>/<name>
gh pr create --fill
gh pr merge --auto --squash
```

Direct push to `main` is BLOCKED by `.claude/hooks/require-pr.sh`. Don't bypass.

## Session Protocol
1. Read this file completely
2. Read GIT_RULES.md
3. Read SKILL.md (if exists)
4. Read PROJECT_MANIFEST.md — especially the last 3 "Session —" entries
5. Run `git status && git log --oneline -10`
6. Verify `.claude/settings.json` exists and hooks are active
7. State your Current Phase, Wave, and proposed plan
8. Wait for confirmation before touching any file
9. Create or check out the appropriate feature branch
10. Implement smallest viable slice
11. Run tests: `npm test`
12. Fix all failures before committing
13. Commit format: `<type>: [description] [#issue]` — matches the branch type
14. Push branch: `git push -u origin <branch>`
15. Open PR: `gh pr create --fill`
16. Enable auto-merge: `gh pr merge --auto --squash`
17. The Stop hook will append a session entry to PROJECT_MANIFEST.md automatically
18. State next recommended action before ending

## Wave protocol
Every multi-file build runs as Research → Plan → Execute → Verify → Ship.
`/clear` context between waves. Read the previous wave's output file at the start of the next.
State current Wave in every session opener.

Each wave can be its own PR, or related waves can be combined onto one feature branch
(common: Wave 3 Execute + Wave 4 Verify share the feature branch and merge together).

## Hook framework (v3.1)
This repo runs the Ironwood hook framework. The `.claude/` directory contains:
- `settings.json` — wires PreToolUse + Stop hooks
- `hooks/require-pr.sh` — blocks direct push to main; enforces branch+PR
- `hooks/protect-files.sh` — enforces DO NOT TOUCH list
- `hooks/session-end.sh` — auto-updates PROJECT_MANIFEST.md with branch + PR info
- `commands/office-hours.md`, `investigate.md`, `qa.md`, `review.md`, `ship.md`

Do not edit hook scripts mid-session. If a hook blocks an action you believe is correct,
surface the situation to the human and ask. Do not bypass.

## Slash command routing
- Vague / new feature → /office-hours
- Bug / error / regression → /investigate
- After writing code → /review (before /qa)
- After feature complete → /qa
- Ready to merge → /ship (creates PR, enables auto-merge, waits for CI)

## CI / Auto-Merge
- Required CI checks: typecheck, lint, test, build (configured in .github/workflows/ci.yml)
- PRs merge automatically when CI passes (squash-merge)
- Failed CI = branch sits open until fixed. Push new commits to re-run.

## Cross-Verification Rule
All operational logic generated by Claude AI (claude.ai Architect) must be verified by
Claude Code before implementation. If something doesn't add up, issue a DECISION CONFLICT
block — do not silently work around it.
