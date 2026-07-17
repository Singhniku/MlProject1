#!/usr/bin/env python3
"""Bundle the modular app (index.html + styles.css + src/*.js) into the single-file
grad-dashboard.html used for the Claude Artifact.

The Artifact must be one self-contained file with no external requests, so this inlines
the stylesheet and concatenates the ES modules (in dependency order, with import/export
lines stripped) into one <script type="module"> block.

Run:  python3 build.py     then republish grad-dashboard.html as the artifact.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent

# ES modules in dependency order (a module must appear after everything it imports).
MODULES = [
    "src/data/schools.js",
    "src/data/value.js",
    "src/data/admissions.js",
    "src/data/programs.js",
    "src/data/checklist.js",
    "src/core/dom.js",
    "src/core/format.js",
    "src/core/presenters.js",
    "src/storage/StorageProvider.js",
    "src/storage/LocalStorageProvider.js",
    "src/storage/ApiStorageProvider.js",
    "src/storage/CompositeStorageProvider.js",
    "src/core/Store.js",
    "src/services/ScholarLinkService.js",
    "src/services/EmailComposer.js",
    "src/services/AtsAnalyzer.js",
    "src/services/ResumeRewriteService.js",
    "src/views/View.js",
    "src/views/TabController.js",
    "src/views/OverviewView.js",
    "src/views/CollegesView.js",
    "src/views/ProfessorsView.js",
    "src/views/EmailModalView.js",
    "src/views/ResumeModifierView.js",
    "src/views/TrackerView.js",
    "src/views/ValueView.js",
    "src/app.js",
]

IMPORT_RE = re.compile(r"^\s*import\s.*?;\s*$")
EXPORT_RE = re.compile(r"^(\s*)export\s+")


def strip_module(src: str) -> str:
    out = []
    for line in src.splitlines():
        if IMPORT_RE.match(line):
            continue  # symbols are already in scope once concatenated
        out.append(EXPORT_RE.sub(r"\1", line))
    return "\n".join(out).strip()


def build() -> None:
    css = (ROOT / "styles.css").read_text(encoding="utf-8").rstrip()

    bundle = "\n\n".join(
        f"/* ===== {m} ===== */\n{strip_module((ROOT / m).read_text(encoding='utf-8'))}"
        for m in MODULES
    )

    # Body markup lives once in index.html; take everything between <body> and </body>
    # and drop the dev module-loader script (we inline the bundle instead).
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    body = index.split("<body>", 1)[1].split("</body>", 1)[0]
    body = re.sub(r'\s*<script type="module" src="[^"]*"></script>\s*', "\n", body).strip()

    # No <!doctype>/<html>/<head>/<body> wrappers — the Artifact host adds those, and
    # this matches the single-file layout the artifact has always used.
    html = (
        '<meta charset="utf-8">\n'
        "<title>MS Fall 2027 — Application Dashboard</title>\n"
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f"<style>\n{css}\n</style>\n\n"
        f"{body}\n\n"
        f'<script type="module">\n{bundle}\n</script>\n'
    )

    out = ROOT / "grad-dashboard.html"
    out.write_text(html, encoding="utf-8")
    print(f"Built {out.name} — {len(MODULES)} modules, {len(html):,} bytes")


if __name__ == "__main__":
    build()
