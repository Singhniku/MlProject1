import { StorageProvider } from "./StorageProvider.js";

// SQLite-backed backend exposed by server.py at /api/state (GET/PUT).
// Absent when the page is opened without the local server (e.g. the artifact),
// in which case load() reports remote:false and CompositeStorageProvider falls back.
export class ApiStorageProvider extends StorageProvider {
  constructor(base = "/api/state") {
    super();
    this.base = base;
  }

  async load() {
    try {
      const r = await fetch(this.base, { cache: "no-store" });
      if (!r.ok) return { state: {}, remote: false };
      const state = await r.json();
      return { state: state || {}, remote: true };
    } catch (e) {
      return { state: {}, remote: false };
    }
  }

  async save(state) {
    return fetch(this.base, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  }
}
