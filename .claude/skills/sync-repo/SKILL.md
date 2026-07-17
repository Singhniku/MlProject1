---
name: sync-repo
description: Commit and push this repo to GitHub. Use after finishing a change (once CODE_UNDERSTANDING.md is updated via update-docs) to keep origin/main in sync so future sessions read context from history.
---

# sync-repo

Commit all changes and push to GitHub (`origin`, remote is https://github.com/Singhniku/MlProject1.git).

## Before committing

- Make sure `CODE_UNDERSTANDING.md` reflects any code change (run the `update-docs` skill first).
- Never commit `gradapp.db` — it's the user's tracking data and is gitignored. Confirm with
  `git status` that it isn't staged.

## Steps

1. `git status` and `git diff --stat` — review what will be committed.
2. `git add -A`
3. Commit with a concise message (imperative subject, short body listing what changed):
   ```
   git commit -m "<subject>

   - <change 1>
   - <change 2>

   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
   ```
4. Push: `git push` (first push of a new branch: `git push -u origin main`).

## Auth notes

- Pushing needs GitHub auth. If `git push` fails with an auth error, tell the user to run
  `gh auth login` (the `gh` CLI is installed) or configure a credential helper / PAT — do not
  attempt to enter credentials yourself.
- If `user.name`/`user.email` are unset, git warns and uses the hostname. Suggest the user run
  `git config --global user.name "Nikita Singh"` and
  `git config --global user.email nikitasingh18dec@gmail.com` once.
- Only push branches that exist on the user's request; default is `main`.
