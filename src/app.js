// Composition root: constructs the storage stack, the store, and the views, injects
// dependencies, and wires the store's change stream to the views. This is the only
// module that knows the concrete wiring — everything else depends on abstractions.
import { SCHOOLS } from "./data/schools.js";
import { qs } from "./core/dom.js";
import { LocalStorageProvider } from "./storage/LocalStorageProvider.js";
import { ApiStorageProvider } from "./storage/ApiStorageProvider.js";
import { CompositeStorageProvider } from "./storage/CompositeStorageProvider.js";
import { ApplicationStore } from "./core/Store.js";
import { TabController } from "./views/TabController.js";
import { OverviewView } from "./views/OverviewView.js";
import { CollegesView } from "./views/CollegesView.js";
import { ProfessorsView } from "./views/ProfessorsView.js";
import { TrackerView } from "./views/TrackerView.js";
import { ValueView } from "./views/ValueView.js";
import { EmailModalView } from "./views/EmailModalView.js";

const STORAGE_KEY = "gradapp-2027-v2";

const storage = new CompositeStorageProvider(
  new LocalStorageProvider(STORAGE_KEY),
  new ApiStorageProvider("/api/state")
);
const store = new ApplicationStore(storage, SCHOOLS);

const emailModal = new EmailModalView();
const overview = new OverviewView(store);
const colleges = new CollegesView(store);
const professors = new ProfessorsView(emailModal);
const tracker = new TrackerView(store);
const value = new ValueView();
const stateViews = [overview, colleges, tracker, value];

function updateStorageChip() {
  const el = qs("#storageChip");
  if (!el) return;
  el.innerHTML = store.usingRemote
    ? "💾 Saved to <b>local DB</b> (gradapp.db) — survives every session"
    : "Saved in <b>this browser</b> — use Export for a backup, or run server.py for a local DB";
}

function exportData() {
  const blob = new Blob([JSON.stringify(store.toJSON(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gradapp-tracking-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (typeof data !== "object" || !data) throw new Error("bad");
      store.replaceAll(data);
    } catch (e) {
      alert("That file isn't a valid dashboard backup.");
    }
  };
  r.readAsText(file);
}

async function main() {
  new TabController().init();
  emailModal.init();
  professors.init(); // independent of tracking state

  await store.init(); // load persisted state (remote DB wins if present)

  overview.render();
  colleges.init();
  tracker.render();
  value.render();
  updateStorageChip();

  store.subscribe((change) => {
    stateViews.forEach((v) => v.onChange(change));
    updateStorageChip();
  });

  qs("#expBtn").addEventListener("click", exportData);
  qs("#impFile").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = "";
  });
}

main();
