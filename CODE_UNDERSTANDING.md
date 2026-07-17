# CODE_UNDERSTANDING.md

Module-level map of the repo. Read this INSTEAD of re-scanning source. Update via the
`update-docs` skill after every change. High-level context (owner profile, artifact URL,
conventions) lives in CLAUDE.md — not duplicated here.

## The app: modular source in `src/`, bundled to one file for the artifact

`index.html` (dev entry) loads `styles.css` + `<script type="module" src="src/app.js">`.
`server.py` serves it at http://127.0.0.1:8500. `build.py` inlines everything into the
single-file `grad-dashboard.html` (the Claude Artifact). Never hand-edit grad-dashboard.html —
edit `src/`, then `python3 build.py`.

Architecture follows SOLID: data / core / storage / services / views, wired in one composition
root (`app.js`). Views depend on abstractions (Store, StorageProvider), never on each other.

### src/data/ — pure data, one entity per file (Single Responsibility)
- `schools.js` → `SCHOOLS` (50 ranked; fields r,id,n,c,prog,f[],t,d,dn,p,note,profs[[name,area]x2]). t:null = no external MS (mit,caltech).
- `value.js` → `VALUE_SCHOOLS` (5 sub-$30K picks; id,n,c,t,f[],d,dn,p,why).
- `admissions.js` → `ADMISSIONS[id]` = {prob, ex, v, gd?}. v:1 = GRE verified Jul 2026 (ids: cmu stanford uiuc gatech usc utd stonybrook buffalo harvard psu ufl columbia).
- `programs.js` → `AREAS` (code→label: AI,CV,AML,DS,CS,DE,DML,NLP,ANLP) and `PROGRAMS[id]` = [[areaCodes[],name,req]...] ("✓"=verified).
- `checklist.js` → `CHECK_ITEMS` ([key,label]×10), `STATUSES` ([value,label,cssClass]×6).

### src/core/
- `dom.js` → `qs`, `qsa`, `escapeHtml`.
- `format.js` → `money`, `formatDate`, `daysUntil` (pure; no DOM/state).
- `presenters.js` → `probabilityPill(id)` (<10 red,<30 amber,<50 blue,≥50 green), `deadlineCell(school)` (urgency <60 red,<150 amber), `schoolAreas(id)`. Depends on data+format only.
- `Store.js` → `ApplicationStore(storage, schools)`. Single source of truth for `{id:{status,notes,checks}}`. Methods: init(), fillDefaults(), record(id), materialsDone(id), setStatus/toggleCheck/setNotes/replaceAll, toJSON(), subscribe(fn). Persists via injected storage; `_commit` saves then emits typed change `{type:'status'|'checks'|'notes'|'reset', id?, source?}`. `usingRemote` proxies storage.

### src/storage/ — persistence behind one interface (Dependency Inversion, Liskov)
- `StorageProvider.js` → base contract: `load()→{state,remote}`, `save(state)`.
- `LocalStorageProvider.js` → localStorage backend (key passed in); read()/write() helpers.
- `ApiStorageProvider.js` → GET/PUT `/api/state` (server.py); load() reports remote:false when server absent.
- `CompositeStorageProvider.js` → composes local+remote: load() prefers non-empty remote and mirrors to local; save() writes local immediately + debounced (400ms) remote. Exposes `usingRemote`.

### src/services/
- `ScholarLinkService.js` → `authorSearch(name, uni)` Google Scholar URL.
- `EmailComposer.js` → `compose(school,name,area)` → {text, subject, body}. `[bracketed]` slot for a recent paper.

### src/views/ — one region each, uniform interface (Interface Segregation)
- `View.js` → base: `render()`, `onChange(change)`. All views extend it.
- `TabController.js` → nav button ↔ section toggling (state-independent).
- `OverviewView.js` → #statTiles + #timeline. Re-renders on status/checks/reset.
- `CollegesView.js` → #areaFilters chips + #collegeTbl (expandable detail row per school: programs&reqs, GRE policy, checklist, notes). Holds `activeArea`. onChange: reset→full render, checks→partial `refreshProgress(id)`, notes(from tracker)→mirror textarea. Emits via store.toggleCheck/setNotes(source:"colleges").
- `ProfessorsView.js` → #profList (2 faculty/uni) + #profSearch filter; "Draft email" opens injected EmailModalView.
- `TrackerView.js` → #trackTbl (status select, progress, deadline, notes). onChange: checks/reset→render, notes(from colleges)→mirror. Emits store.setStatus/setNotes(source:"tracker").
- `ValueView.js` → #valueCards (VALUE_SCHOOLS, cheapest first). onChange: reset→render.
- `EmailModalView.js` → #overlay dialog; open(school,name,area) uses EmailComposer; copy + mailto (subject parsed from offset 9 of first line).

### src/app.js — composition root
Builds `CompositeStorageProvider(LocalStorageProvider("gradapp-2027-v2"), ApiStorageProvider("/api/state"))` → `ApplicationStore` → all views. `main()`: init tabs/modal/professors → `await store.init()` → render state views → subscribe views to store changes → wire #expBtn/#impFile (export/import JSON) and #storageChip.

## server.py (stdlib only)
- Serves repo dir on 127.0.0.1:8500; `/` → index.html.
- `GET/PUT /api/state` ↔ sqlite `gradapp.db`, table `kv(key,value)`, single row key='state'. PUT validates JSON (400 on bad). gradapp.db is gitignored.

## build.py
- `MODULES` = ordered manifest (deps first). Strips `import` lines + `export ` keyword, concatenates into one `<script type="module">`, inlines styles.css into `<style>`, takes body markup from index.html (drops the dev module-loader script), writes grad-dashboard.html WITHOUT doctype/html/head/body wrappers (artifact host adds them). All top-level module symbols are uniquely named so single-scope concatenation is safe.

## resume/
- `build_resume.py` — python-docx → ~/Downloads/NikitaSingh_Resume_Updated.docx. Helpers para/run/bottom_border/header/two_col/bullet; RIGHT_TAB for right-aligned dates. Sections: header→EXPERIENCE(Amex 10, Jubilant 6, IndiaMart 3+1)→SKILLS→CERTIFICATIONS→EDUCATION→LEADERSHIP.
- `build_resume_pdf.py` — reportlab → ...pdf. Helvetica + hyphen bullets (ATS-safe extraction). PageBreak before IndiaMart intern.

## Changelog
- 2026-07-17: refactored the single-file dashboard into modular SOLID source (src/data, core, storage, services, views + app.js composition root); added index.html dev entry, styles.css, build.py bundler, .claude/launch.json. server.py now serves index.html. Behavior unchanged; verified in browser (modular + bundled) with DB persistence.
- 2026-07-17: initial version (single-file dashboard; ATS resume generators).
