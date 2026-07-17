import { StorageProvider } from "./StorageProvider.js";

// Composes a fast local mirror with an optional remote DB (Open/Closed: swap either
// side without changing the store). On load, prefers non-empty remote state and mirrors
// it locally; on save, always writes local immediately and debounces the remote write.
export class CompositeStorageProvider extends StorageProvider {
  constructor(local, remote, debounceMs = 400) {
    super();
    this.local = local;
    this.remote = remote;
    this.debounceMs = debounceMs;
    this.usingRemote = false;
    this._timer = null;
  }

  async load() {
    const localState = (await this.local.load()).state;
    const { state: remoteState, remote } = await this.remote.load();
    this.usingRemote = remote;
    if (remote && remoteState && Object.keys(remoteState).length) {
      this.local.write(remoteState); // mirror so the next offline session still has data
      return { state: remoteState, remote: true };
    }
    return { state: localState, remote };
  }

  async save(state) {
    this.local.write(state); // synchronous, never lost
    if (!this.usingRemote) return;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.remote.save(state).catch(() => {});
    }, this.debounceMs);
  }
}
