# Git Convention — agents MUST obey this

> Agent-facing quick reference. This is the compact convention that gets copied into
> each generated harness's `.claude/` so the agent team inherits our git workflow.
> The full, authoritative rules live in [`GIT_RULES.md`](./GIT_RULES.md) — read that for
> branch-naming details, wave→PR mapping, edge cases, and the escape hatch.

- All changes go through **branch + PR**. NEVER push to `main` directly.
- `require-pr.sh` will physically block bad pushes. Do not attempt to bypass it.
- Branch naming: `feat/` `fix/` `refactor/` `spec/` `chore/` `investigate/`
- **MERGE MODE for THIS repo: `auto-merge`**
  (default for a new/zero-company repo is `auto-merge`)
  > NOTE for Sideline Setups: this repo is currently zero-company (no paying customer in
  > production), so `auto-merge` applies. The moment the business goes live and takes its
  > first real payment, flip this to `manual-merge` per the rule below.
- RULE: `manual-merge` is required ONLY for repos with a paying customer in production.
  All zero-company repos use `auto-merge`. When a repo takes its first real payment,
  flip it to `manual-merge`.

## Standard flow

```bash
git checkout -b <type>/<short-name>
git add -A && git commit -m "<type>: <description>"
git push -u origin <type>/<short-name>
gh pr create --fill
# auto-merge repos only:
gh pr merge --auto --squash
```
