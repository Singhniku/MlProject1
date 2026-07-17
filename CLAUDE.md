# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Nikita Singh's personal tooling for MS Fall 2027 applications (US grad schools, AI/ML/CS focus) plus resume generation. A modular vanilla-JS web app (no framework, no npm) plus plain Python scripts.

Owner profile (used throughout): GRE 305 (Q160/V145), B.Tech CSE GPA 8.2/10, 4 yrs SWE — American Express (Oct 2024–present, agentic AI/Llama, JDK 21 migration, SCRA platform), Jubilant Foodworks (Aug 2022–Sep 2024), IndiaMart. Email nikitasingh18dec@gmail.com.

## The application dashboard — modular app + single-file artifact

The app is a **modular vanilla-JS ES-module project** (SOLID) that also ships as a **single self-contained file** for the Claude Artifact. Two ways it runs:

- **Local app (source of truth):** `python3 server.py` → http://127.0.0.1:8500 serves `index.html`, which loads `styles.css` and `src/app.js` (ES modules). This is where you edit and where the SQLite DB persistence works. `.claude/launch.json` runs it as an app in the preview.
- **Artifact (single file):** `python3 build.py` bundles `styles.css` + all `src/*.js` (import/export stripped, dependency order) into **`grad-dashboard.html`**, published at
  **https://claude.ai/code/artifact/ab97543e-3249-4fe5-a565-4d9d4914c5ba**

**Edit `src/`, never `grad-dashboard.html` directly** (it's generated). Workflow: edit modules → `python3 build.py` → verify at localhost:8500 (and optionally /grad-dashboard.html) in the Browser pane → republish the artifact with the Artifact tool **using the exact URL above as `url`** (a session that didn't create it would otherwise mint a new URL — as happens if you publish from the repo path without `url`). Direct `file://` navigation is blocked; always serve over HTTP.

Five tabs: Overview · Top 50 Colleges · Professors & Outreach (email-draft modal) · Application Tracker · Best Under $30K.

### Architecture (see CODE_UNDERSTANDING.md for the full module map)

- `src/data/` — pure data: `SCHOOLS` (schools.js), `VALUE_SCHOOLS` (value.js), `ADMISSIONS` (admissions.js; `v:1`=GRE verified on the univ. site Jul 2026 for 12 ids), `AREAS`+`PROGRAMS` (programs.js), `CHECK_ITEMS`+`STATUSES` (checklist.js).
- `src/core/` — `dom.js`, `format.js`, `presenters.js` (pills/cells), `Store.js` (`ApplicationStore`: single source of truth, observer, emits typed changes).
- `src/storage/` — `StorageProvider` base + `LocalStorageProvider` + `ApiStorageProvider` + `CompositeStorageProvider` (Dependency Inversion; add a backend without touching the store).
- `src/services/` — `ScholarLinkService`, `EmailComposer`.
- `src/views/` — `View` base + `TabController`, `OverviewView`, `CollegesView`, `ProfessorsView`, `TrackerView`, `ValueView`, `EmailModalView`. Each owns one DOM region and reacts to store changes via `onChange`.
- `src/app.js` — composition root (builds storage → store → views, injects deps, subscribes).

### Persistence

User state `{schoolId:{status,notes,checks}}` via `CompositeStorageProvider`:
1. **Local SQLite DB (preferred)** — `server.py` exposes `GET/PUT /api/state` backed by `gradapp.db` (kv table, one JSON row; gitignored). Detected on load ("Saved to local DB" chip), debounce-saved (400 ms); survives browser-storage clears.
2. **localStorage** key **`gradapp-2027-v2`** — automatic fallback when no server (the artifact). Header Export/Import JSON moves data between them.
Notes sync between the Top-50 textarea (`data-note`) and Tracker textarea (`data-tnote`) through the store's `notes` change (with `source` to avoid clobbering the focused field).

### Conventions / gotchas

- `build.py` writes `grad-dashboard.html` WITHOUT doctype/html/head/body wrappers (the artifact host adds them) and starts with `<meta charset="utf-8">` — the UI uses · — ✓ and mojibakes otherwise. `index.html` is a full HTML doc for local serving.
- All top-level symbols across `src/` must be uniquely named — the bundler concatenates modules into one scope.
- Theme tokens on `:root`, redefined under `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`/`[data-theme="light"]` (artifact viewer stamps `data-theme`). Never style components inside the media query.
- All figures (tuition, deadlines, admit %) are estimates for Fall-2027 planning; the UI labels verified vs estimated — keep that honesty.
- Professor emails come from `EmailComposer.compose()` with a `[bracketed]` slot for a real recent paper; Scholar links from `ScholarLinkService.authorSearch()`.

## resume/ — resume generators

- `build_resume.py` — python-docx → `~/Downloads/NikitaSingh_Resume_Updated.docx`.
- `build_resume_pdf.py` — reportlab → `~/Downloads/NikitaSingh_Resume_Updated.pdf`. PDF is built directly (NOT converted from docx): Pages/LibreOffice exports mangle text extraction ("agentic" → "agenBc"), which breaks ATS parsing. Uses Helvetica + hyphen bullets because the • glyph extracts as `(cid:127)`. After edits, verify with pdfplumber that extracted text contains no `(cid:` artifacts.
- Both scripts hold the resume content inline; edit bullets there and re-run. Amex section: 10 ATS-optimized bullets (verb → tech keywords → quantified scope → business outcome). Only real metrics — never invent percentages.
- Run with system `python3` (anaconda). `node`/`soffice`/`pdftoppm` are NOT installed on this machine; `python-docx`, `reportlab`, `pdfplumber` are.

## Docs & workflow

- **CODE_UNDERSTANDING.md** — function-level map of the repo (IDs, data constants, renderers, files). Read it INSTEAD of re-scanning source to save tokens; it complements this file's high-level context.
- **`update-docs` skill** (`.claude/skills/update-docs`) — run after any code change to refresh CODE_UNDERSTANDING.md and add a dated changelog line.
- **`sync-repo` skill** (`.claude/skills/sync-repo`) — commit and push to GitHub (`origin` = https://github.com/Singhniku/MlProject1.git).

After every change: update the affected code → run `update-docs` → run `sync-repo` (commit + push). Never commit `gradapp.db` (gitignored user data). Pushing needs `gh auth login` if not already authenticated.
