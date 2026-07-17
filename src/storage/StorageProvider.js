// Abstract persistence contract. The store depends on THIS, not on any concrete
// backend (Dependency Inversion), so new backends can be added without touching callers.
export class StorageProvider {
  /** @returns {Promise<{state: object, remote: boolean}>} loaded state + whether a remote DB backs it */
  async load() {
    return { state: {}, remote: false };
  }

  /** Persist the whole state object. @param {object} _state */
  async save(_state) {}
}
