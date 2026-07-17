import { CHECK_ITEMS } from "../data/checklist.js";

// Single source of truth for per-school tracking data ({status, notes, checks}).
// Holds state, persists via an injected StorageProvider (Dependency Inversion), and
// notifies subscribers with a typed change descriptor so each view refreshes only when relevant.
export class ApplicationStore {
  constructor(storage, schools) {
    this.storage = storage;
    this.schools = schools;
    this.state = {};
    this.listeners = new Set();
  }

  // Ensure every school has a record so views never hit undefined.
  fillDefaults() {
    this.schools.forEach((s) => {
      this.state[s.id] = this.state[s.id] || { status: "not", notes: "", checks: {} };
    });
  }

  async init() {
    const { state } = await this.storage.load();
    this.state = state || {};
    this.fillDefaults();
    await this.storage.save(this.state); // mirror merged defaults back
  }

  get usingRemote() {
    return !!this.storage.usingRemote;
  }

  // --- reads ---
  record(id) {
    return this.state[id];
  }
  materialsDone(id) {
    return CHECK_ITEMS.filter(([k]) => this.state[id].checks[k]).length;
  }

  // --- mutations (each persists, then emits a typed change) ---
  setStatus(id, value) {
    this.state[id].status = value;
    this._commit({ type: "status", id });
  }
  toggleCheck(id, key, value) {
    this.state[id].checks[key] = value;
    this._commit({ type: "checks", id });
  }
  setNotes(id, value, source) {
    this.state[id].notes = value;
    this._commit({ type: "notes", id, source });
  }
  replaceAll(data) {
    this.state = data;
    this.fillDefaults();
    this._commit({ type: "reset" });
  }

  toJSON() {
    return this.state;
  }

  // --- observer plumbing ---
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  _commit(change) {
    this.storage.save(this.state);
    this.listeners.forEach((fn) => fn(change));
  }
}
