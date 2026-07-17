#!/usr/bin/env python3
"""Local server for the grad-school dashboard with SQLite persistence.

Run:  python3 server.py        then open  http://127.0.0.1:8500
Data: all tracking state (statuses, notes, checklists) is stored in
      gradapp.db next to this file, so every session resumes where
      the last one ended — independent of browser storage.
"""
import json
import http.server
import pathlib
import socketserver
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parent
DB = ROOT / "gradapp.db"
PORT = 8500


def db():
    conn = sqlite3.connect(DB)
    conn.execute("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)")
    return conn


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

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

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as srv:
        print(f"Dashboard: http://127.0.0.1:{PORT}   (data persists in {DB.name})")
        srv.serve_forever()
