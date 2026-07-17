import { View } from "./View.js";
import { qs, qsa, escapeHtml } from "../core/dom.js";
import { SCHOOLS } from "../data/schools.js";
import { CHECK_ITEMS, STATUSES } from "../data/checklist.js";
import { deadlineCell } from "../core/presenters.js";

// Application Tracker tab: status dropdown, materials progress, deadline, and an
// editable notes column that stays in sync with the Top-50 tab via the store.
export class TrackerView extends View {
  constructor(store) {
    super(qs("#tracker"));
    this.store = store;
  }

  onChange(change) {
    if (["checks", "reset"].includes(change.type)) {
      this.render();
    } else if (change.type === "notes" && change.source !== "tracker") {
      const t = qs(`[data-tnote="${change.id}"]`);
      if (t) t.value = this.store.record(change.id).notes;
    }
  }

  render() {
    qs("#trackTbl tbody").innerHTML = SCHOOLS.map((s) => {
      const rec = this.store.record(s.id);
      const n = this.store.materialsDone(s.id),
        tot = CHECK_ITEMS.length;
      const cls = (STATUSES.find((x) => x[0] === rec.status) || STATUSES[0])[2];
      return `<tr>
        <td class="rankno">${s.r}</td>
        <td><div class="cname">${s.n}</div><div class="csub">${s.c}</div></td>
        <td><select class="status ${cls}" data-status="${s.id}" aria-label="Status for ${s.n}">
          ${STATUSES.map(([v, l]) => `<option value="${v}" ${v === rec.status ? "selected" : ""}>${l}</option>`).join("")}
        </select></td>
        <td><div class="bar"><i style="width:${(100 * n) / tot}%"></i></div><div class="prog-lbl">${n}/${tot} ready</div></td>
        <td>${deadlineCell(s)}</td>
        <td style="min-width:220px"><textarea data-tnote="${s.id}" style="min-height:44px" placeholder="Comments…" aria-label="Notes for ${s.n}">${escapeHtml(rec.notes)}</textarea></td>
      </tr>`;
    }).join("");

    qsa("[data-status]").forEach((sel) =>
      sel.addEventListener("change", () => {
        this.store.setStatus(sel.dataset.status, sel.value);
        sel.className = "status " + (STATUSES.find((x) => x[0] === sel.value) || STATUSES[0])[2];
      })
    );
    qsa("[data-tnote]").forEach((t) =>
      t.addEventListener("input", () => this.store.setNotes(t.dataset.tnote, t.value, "tracker"))
    );
  }
}
