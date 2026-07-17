# CODE_UNDERSTANDING.md

Function-level map of this repo. Read this INSTEAD of re-reading source files when you need
to know where something lives. Update via the `update-docs` skill after every change.
High-level context (owner profile, artifact URL, conventions) lives in CLAUDE.md — don't duplicate it here.

## grad-dashboard.html (single file: inline CSS + HTML + one `<script>`)

### CSS (top of file)
- Theme tokens on `:root`, re-declared under `@media (prefers-color-scheme: dark)`, then
  `:root[data-theme="dark"]` and `:root[data-theme="light"]` (artifact viewer override). ~15 tokens
  (`--bg --card --ink --muted --line --accent --gold --good --warn --bad --info` + soft variants).
- Notable classes: `.pill` (+ `.p-amb .p-tgt .p-safe .p-info .p-acc` colorways), `.course` (area chip),
  `.fchip` (area filter button, `.on` = active), `.stat` (overview tiles), `.tblwrap > table` (min-width 1040,
  scrolls inside wrapper), `.detail` (expandable row), `.uniblock/.profrow` (professors list),
  `.overlay/.modal` (email dialog), `select.status` (+ `.s-not .s-prog .s-sub .s-int .s-adm .s-rej`).

### HTML skeleton
`header` (name, profile chips, storage chip `#storageChip`, `#expBtn`, `#impFile`) →
`nav` (5 tab buttons, `data-tab`) → five `section`s: `#overview` (`#statTiles`, `#timeline`),
`#colleges` (`#areaFilters`, `#collegeTbl`), `#profs` (`#profSearch`, `#profList`),
`#tracker` (`#trackTbl`), `#value` (`#valueCards`) → `.foot` disclaimer → `#overlay` email modal
(`#mTitle #mText #mCopy #mMailto #mClose`).

### Data constants (in script order)
- `S` — 50 ranked schools. Entry: `{r,id,n,c,prog,f[],t,d,dn,p,note,profs[[name,area]×2]}`.
  `t:null` = no external MS route (mit, caltech). Deadlines `d` are ISO strings (Fall-2027 estimates).
- `VALUE` — 5 sub-$30K schools outside the top-50: `{id,n,c,t,f[],d,dn,p,why}`.
- `AREAS` — code→label map: AI, CV, AML, DS, CS, DE, DML, NLP, ANLP.
- `PROGS` — per school id: `[[areaCodes[], programName, requirementString]...]`. "✓" in the
  requirement means portal-verified (Jul 2026).
- `EXTRA` — per school id: `{prob, ex, v, gd?}` = admit-% estimate, exams string, verified flag,
  per-program GRE detail. 12 verified ids: cmu stanford uiuc gatech usc utd stonybrook buffalo
  harvard psu ufl columbia.
- `CHECK_ITEMS` (10 `[key,label]` materials), `STATUSES` (`[value,label,cssClass]` ×6).

### State & persistence
- `state = {schoolId: {status, notes, checks:{itemKey:bool}}}`; `fillDefaults()` seeds missing ids.
- `KEY = "gradapp-2027-v2"` (localStorage). `dbMode` flag = local server detected.
- `save()` → always localStorage; when `dbMode`, debounced (400 ms) `PUT /api/state`.
- `init()` (async IIFE, bottom of script): loads localStorage → tries `GET /api/state` (server wins
  if non-empty, sets `dbMode`) → `fillDefaults()` → `renderAll()` → wires export/import buttons.
- `exportData()/importData(file)` — JSON blob download / FileReader import then `renderAll()`.
- `updateStorageChip()` — sets `#storageChip` text per mode.

### Rendering functions
- `renderAll()` — calls the six renderers + `updateStorageChip`.
- `renderOverview()` — 4 stat tiles + first-12-deadlines timeline (`probPill` per row).
- `renderAreaFilters()` / `activeArea` / `schoolAreas(id)` — filter chips; filters `S` by PROGS areas.
- `renderColleges()` — main table; per school two `<tr>`s: data row + hidden `.detail` row
  (`#d-<id>`) containing: Programs & requirements list (from PROGS), GRE-by-program block
  (EXTRA.gd or .ex, verified pill), materials checklist (`data-check="id:key"`), notes textarea
  (`data-note="id"`). Wires expand buttons (`data-expand`), checkboxes, note inputs (syncs to
  `data-tnote` twin). `refreshProgress(id)` updates one row's progress bar without rerender.
- `renderProfs(filter)` — 50 `.uniblock`s × 2 `.profrow`s; Scholar link via `scholarUrl(name,uni)`
  (Google Scholar author-search URL); "Draft email" buttons (`data-mail="id|name|area"`).
- `emailText(s,name,area)` / `openMail()` — builds outreach email (subject line 9 chars offset
  parsed by `#mMailto` handler); `[bracketed]` slot for citing a recent paper. Modal close: button,
  backdrop click, Escape.
- `renderTracker()` — status `<select data-status>` (class swap on change), progress bar,
  deadline cell, editable notes `<textarea data-tnote>` (syncs to `data-note` twin).
- `renderValue()` — VALUE cards sorted by tuition.
- Helpers: `esc()` (HTML-escape for user notes), `fmt$`, `fmtDate`, `daysTo`, `deadlineCell(s)`
  (date + urgency pill: <60d red, <150d amber), `probPill(id)` (<10% red, <30% amber, <50% blue,
  ≥50% green), `doneCount(id)`.

## server.py (stdlib only)
- `Handler(SimpleHTTPRequestHandler)` serving repo dir on 127.0.0.1:8500; `/` → grad-dashboard.html.
- `GET /api/state` → JSON from sqlite `gradapp.db`, table `kv(key,value)`, single row key='state'.
- `PUT /api/state` → validates JSON, upserts, 204. Bad JSON → 400. Logging silenced.
- `db()` creates table on demand. `allow_reuse_address` set.

## resume/
- `build_resume.py` — python-docx. Helpers: `para/run/bottom_border/header/two_col/bullet`;
  `RIGHT_TAB` tab stop for right-aligned dates. Sections: header → EXPERIENCE (Amex 10 bullets,
  Jubilant 6, IndiaMart 3+1) → SKILLS (4 category lines) → CERTIFICATIONS → EDUCATION → LEADERSHIP.
  Output: ~/Downloads/NikitaSingh_Resume_Updated.docx.
- `build_resume_pdf.py` — reportlab platypus, same content. `two_col()` uses a 2-col Table;
  `header()` = Paragraph + HRFlowable. Helvetica + hyphen bullets (ATS-safe extraction, see CLAUDE.md).
  `story.append(PageBreak())` before IndiaMart intern entry keeps it on page 2.
  Output: ~/Downloads/NikitaSingh_Resume_Updated.pdf (A4, 2 pages).

## Changelog
- 2026-07-17: initial version of this document (dashboard with per-program requirements,
  area filters, SQLite persistence; ATS resume generators).
