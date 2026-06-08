# GIT WORKFLOW RULES — BRANCH + PR + AUTO-MERGE (v3.1)

**This file is read by Claude Code at session start. Read it before any git operation.**

---

## The Rule

**All code changes go through a branch + Pull Request. PRs auto-merge to `main` once CI passes.**

This is enforced by:
1. `.claude/hooks/require-pr.sh` — physically blocks `git push origin main`
2. GitHub branch protection on `main` (if configured) — rejects direct pushes server-side
3. CI workflow `.github/workflows/ci.yml` — must pass before merge

---

## Required Workflow

For every code change, the workflow is:

```bash
# 1. Create a feature branch
git checkout -b <type>/<short-name>
# Branch naming convention:
#   feat/<name>     - new feature
#   fix/<name>      - bug fix
#   refactor/<name> - code refactor
#   spec/<name>     - doc / IMPLEMENTATION_BRIEF / planning
#   chore/<name>    - tooling, deps, CI
#   investigate/<name> - investigation report

# 2. Make your changes, commit
git add -A
git commit -m "<descriptive message>"

# 3. Push the branch
git push -u origin <type>/<short-name>

# 4. Open the PR
gh pr create --fill
# (Or with explicit title/body)
# gh pr create --title "feat: add X" --body "..."

# 5. Enable auto-merge so it merges itself when CI is green
gh pr merge --auto --squash
```

That's it. Once CI passes (typically 90-120 seconds), GitHub auto-squash-merges the PR to `main`. You don't click anything else.

---

## Why This Workflow

- **CI as a safety gate.** typecheck, lint, tests, and build run on every PR. Broken code cannot reach `main`.
- **Diff review available.** Open the PR in your browser if you want to eyeball the change. Most of the time you won't need to — but the option is there.
- **Auto-merge keeps the speed.** No PR queue, no waiting on yourself to click merge. CI passes → merged.
- **Squash-merge keeps history clean.** `main` has one commit per PR, not the messy chain of "fix typo", "actually fix typo", "fix the fix".
- **Branches let Claude experiment.** Two approaches? Two branches. Pick the better one, merge it, delete the loser. No `main` pollution.

---

## Forbidden Commands

These are physically blocked by `.claude/hooks/require-pr.sh`:

- `git push origin main`
- `git push -u origin main`
- `git push --force origin main`
- `git push origin HEAD:main`
- `git push origin :main` (deletes the branch — also no)
- Any push whose target ref is `main`

Allowed:
- `git checkout -b <branch>` ✅
- `git push -u origin <branch>` ✅
- `gh pr create` ✅
- `gh pr merge --auto --squash` ✅
- Any read operation ✅

---

## Branch Naming Convention

Use `<type>/<short-kebab-name>`:

| Type | When | Example |
|---|---|---|
| `feat/` | new feature | `feat/message-queue` |
| `fix/` | bug fix | `fix/login-redirect` |
| `refactor/` | code restructure, no behavior change | `refactor/customer-service` |
| `spec/` | docs, briefs, planning | `spec/phase-8f-messaging` |
| `chore/` | tooling, deps, CI, configs | `chore/upgrade-supabase` |
| `investigate/` | investigation report (no fix yet) | `investigate/intermittent-500` |

Keep names short and descriptive. Lowercase, kebab-case.

---

## PR Hygiene

Every PR should have:

- **Title:** matches the commit convention — `feat: add X`, `fix: handle Y in Z`
- **Description:** what changed, why, link to brief / investigation if applicable
- **Wave label:** which wave produced this (Research / Plan / Execute / Verify / Ship)
- **CI passing:** required before merge (auto-merge handles this)

The `.github/PULL_REQUEST_TEMPLATE.md` provides the structure. Fill it in.

---

## Wave-by-Wave PR Pattern

The Ironwood wave protocol (Research → Plan → Execute → Verify → Ship) maps to PRs cleanly:

| Wave | Branch | What's in the PR | Auto-merge? |
|---|---|---|---|
| 1. Research | `spec/<task>-research` | `docs/research-<task>.md` | Yes — docs only |
| 2. Plan | `spec/<task>-plan` | `docs/plan-<task>.md` | Yes — docs only (after human approval) |
| 3. Execute | `feat/<task>` (or `fix/`) | The code | Yes — when CI green |
| 4. Verify | `chore/<task>-verify` | `QA_REPORT_<task>.md`, `REVIEW_<task>.md` | Yes — docs only |
| 5. Ship | (already done by Wave 3 merge) | — | — |

For tightly-scoped work, Waves 1-2 can be one PR; Waves 4-5 are usually folded into Wave 3 with the QA/Review docs added to the same feature branch before merge.

---

## Direct-to-Main Escape Hatch (rare)

If you genuinely need to push to `main` directly (recovering from a bad merge, hotfix at 2am, etc.):

1. Ask the human first. Always.
2. Human renames the hook: `mv .claude/hooks/require-pr.sh .claude/hooks/require-pr.sh.disabled`
3. Do the direct push.
4. Re-enable: `mv .claude/hooks/require-pr.sh.disabled .claude/hooks/require-pr.sh`
5. Log the exception in PROJECT_MANIFEST.md.

Don't bypass silently. Don't rename the hook for "convenience." If you need it disabled regularly, the rule is wrong — change the rule, not the practice.

---

## Edge Cases

| Situation | Correct response |
|---|---|
| "PR is open but CI is red." | Read the failure. Fix on the same branch. Push. CI re-runs. |
| "I want to update a PR after review." | New commits on the same branch. Push. Auto-merge waits for fresh CI. |
| "I want to abandon a branch." | `gh pr close` then `git push origin --delete <branch>`. |
| "I need to combine two branches." | Open PRs separately. Or rebase one onto the other locally before pushing. |
| "Auto-merge isn't enabled in this repo." | Configure it once: GitHub repo → Settings → General → Pull Requests → Allow auto-merge. |
| "I'm half-done and want to checkpoint." | Commit + push to the feature branch. Don't open the PR yet. Branch is the backup. |

---

## Verification — Required at End of Every Task

Before declaring a task done, confirm in your output:

- [ ] Code is on a feature branch, not directly on `main`
- [ ] Branch was pushed: `git rev-parse --abbrev-ref HEAD` is NOT `main`
- [ ] PR was opened: `gh pr view --json number,state` shows it
- [ ] Auto-merge enabled OR CI passed and you merged manually
- [ ] PROJECT_MANIFEST.md has been updated (Stop hook will do this on session end)

---

## Quick Reference

```bash
# Standard branch-and-PR flow (the only flow)
git checkout -b feat/my-thing
# ...edit files...
git add -A && git commit -m "feat: do the thing"
git push -u origin feat/my-thing
gh pr create --fill
gh pr merge --auto --squash
```

That's the entire git workflow for this project.

---

## Migrating from v3.0 (direct-to-main) to v3.1

If this repo previously used direct-to-main:

1. Enable branch protection on GitHub: repo → Settings → Branches → Add rule for `main` → Require pull request before merging
2. Enable auto-merge: Settings → General → Pull Requests → Allow auto-merge
3. Set up CI: `.github/workflows/ci.yml` is included in this framework
4. Update CLAUDE.md to reference branch workflow (this framework's CLAUDE.md template already does)
5. Replace the `block-branches.sh` hook with `require-pr.sh` (included in this framework)
