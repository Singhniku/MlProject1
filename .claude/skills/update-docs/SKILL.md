---
name: update-docs
description: Refresh CODE_UNDERSTANDING.md after changing code in this repo. Use after editing grad-dashboard.html, server.py, or the resume scripts — whenever functions, data structures, IDs, or files are added, removed, or renamed.
---

# update-docs

Keep `CODE_UNDERSTANDING.md` an accurate function-level map of the repo so future sessions read it
instead of re-scanning source (saves tokens). Run this as the last step after any code change,
before committing.

## Steps

1. Recall exactly what you changed this turn (files, functions, data constants, element IDs).
2. Open `CODE_UNDERSTANDING.md` and update ONLY the affected lines:
   - New/renamed/removed function → fix its bullet under the right file's section.
   - New/changed data constant (`S`, `EXTRA`, `PROGS`, `AREAS`, `VALUE`, `CHECK_ITEMS`, `STATUSES`)
     → update its field list or the set of verified IDs.
   - New element ID, CSS class, localStorage key, or API route → update the relevant subsection.
   - New file → add a top-level `## <file>` section describing its pieces.
   - New tab/section in the dashboard → update the HTML skeleton bullet.
3. Add a one-line dated entry to the `## Changelog` at the bottom (`- YYYY-MM-DD: <what changed>`),
   using today's date.
4. Keep it terse — it is a map, not a tutorial. No code blocks, no prose paragraphs. Do NOT duplicate
   CLAUDE.md's high-level context (owner profile, artifact URL, conventions).
5. Verify claims you write are still true in the source (grep for a function/ID name if unsure) —
   a stale map is worse than none.

## After updating

Hand off to the `sync-repo` skill (or `git add -A && git commit`) so the doc travels with the code.
