#!/usr/bin/env python3
"""Local server for the grad-school dashboard with SQLite persistence and the
Resume Modifier's AI-rewrite endpoint.

Run:  python3 server.py        then open  http://127.0.0.1:8500
Data: all tracking state (statuses, notes, checklists) is stored in
      gradapp.db next to this file, so every session resumes where
      the last one ended — independent of browser storage.

AI rewrite: POST /api/resume/rewrite calls the Anthropic API using ANTHROPIC_API_KEY,
read from the environment or from a local .env file (gitignored — see ./setup).
The key never touches the browser or the bundled grad-dashboard.html artifact.
"""
import json
import http.server
import os
import pathlib
import socketserver
import sqlite3
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
DB = ROOT / "gradapp.db"
PORT = 8500

ANTHROPIC_MODEL = "claude-sonnet-5"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

REWRITE_SYSTEM_PROMPT = (
    "You are an expert resume writer optimizing resumes to pass Applicant Tracking "
    "System (ATS) parsing and ranking. Rewrite the resume content below to maximize ATS "
    "compatibility: use standard section headers (Experience, Education, Skills), start "
    "every bullet with a strong action verb, follow a verb -> technology/method -> "
    "quantified scope -> business outcome pattern, and naturally weave in relevant "
    "keywords and terminology from the target job description where truthful. Never "
    "invent metrics, employers, dates, titles, or skills not present in the original — "
    "preserve every fact exactly. Return ONLY the rewritten resume as plain text, no "
    "markdown formatting, no commentary before or after."
)


def load_env_file():
    """Load KEY=VALUE lines from a local .env (gitignored) without overriding real env vars."""
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env_file()


def db():
    conn = sqlite3.connect(DB)
    conn.execute("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)")
    return conn


def call_anthropic(resume_text, job_text):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("NO_API_KEY")

    user_prompt = (
        f"JOB DESCRIPTION (optional, use for keyword targeting):\n{job_text or '(none provided)'}\n\n"
        f"RESUME TO REWRITE:\n{resume_text}"
    )
    payload = json.dumps(
        {
            "model": ANTHROPIC_MODEL,
            "max_tokens": 4096,
            "system": REWRITE_SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": user_prompt}],
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        ANTHROPIC_URL,
        data=payload,
        method="POST",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return "".join(block.get("text", "") for block in data.get("content", []))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _json_response(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"  # modular app entry (src/*.js loaded as ES modules)
        if self.path == "/api/state":
            conn = db()
            row = conn.execute("SELECT value FROM kv WHERE key='state'").fetchone()
            conn.close()
            body = (row[0] if row else "{}").encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_PUT(self):
        if self.path == "/api/state":
            n = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(n)
            try:
                json.loads(raw)
            except ValueError:
                self.send_response(400)
                self.end_headers()
                return
            conn = db()
            conn.execute(
                "INSERT INTO kv(key,value) VALUES('state',?) "
                "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                (raw.decode("utf-8"),),
            )
            conn.commit()
            conn.close()
            self.send_response(204)
            self.end_headers()
            return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/resume/rewrite":
            n = int(self.headers.get("Content-Length", 0))
            try:
                body = json.loads(self.rfile.read(n))
            except ValueError:
                self._json_response(400, {"error": "Malformed JSON body."})
                return
            resume_text = (body.get("resumeText") or "").strip()
            job_text = body.get("jobText") or ""
            if not resume_text:
                self._json_response(400, {"error": "resumeText is required."})
                return
            try:
                rewritten = call_anthropic(resume_text, job_text)
                self._json_response(200, {"rewritten": rewritten})
            except RuntimeError:
                self._json_response(
                    400,
                    {"error": "No ANTHROPIC_API_KEY configured. Run ./setup to add one, or set it in .env."},
                )
            except urllib.error.HTTPError as e:
                detail = e.read().decode("utf-8", "ignore")[:300]
                self._json_response(e.code, {"error": f"Anthropic API error ({e.code}): {detail}"})
            except urllib.error.URLError as e:
                self._json_response(504, {"error": f"Couldn't reach the Anthropic API: {e.reason}"})
            except Exception as e:
                self._json_response(500, {"error": str(e)})
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as srv:
        key_status = "configured" if os.environ.get("ANTHROPIC_API_KEY") else "NOT set — AI rewrite disabled, run ./setup"
        print(f"Dashboard: http://127.0.0.1:{PORT}   (data persists in {DB.name}; ANTHROPIC_API_KEY: {key_status})")
        srv.serve_forever()
