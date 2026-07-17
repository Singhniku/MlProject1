import { StorageProvider } from "./StorageProvider.js";

// Browser localStorage backend. Always available; used standalone (e.g. the published
// artifact) or as the fast local mirror inside CompositeStorageProvider.
export class LocalStorageProvider extends StorageProvider {
  constructor(key) {
    super();
    this.key = key;
  }

  read() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || {};
    } catch (e) {
      return {};
    }
  }

  write(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      /* quota or private-mode — ignore */
    }
  }

  async load() {
    return { state: this.read(), remote: false };
  }

  async save(state) {
    this.write(state);
  }
}
