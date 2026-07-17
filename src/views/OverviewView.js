import { View } from "./View.js";
import { qs } from "../core/dom.js";
import { SCHOOLS } from "../data/schools.js";
import { formatDate, daysUntil } from "../core/format.js";
import { probabilityPill } from "../core/presenters.js";

// Overview tab: summary stat tiles + the earliest-deadlines timeline.
export class OverviewView extends View {
  constructor(store) {
    super(qs("#overview"));
    this.store = store;
  }

  onChange(change) {
    if (["status", "checks", "reset"].includes(change.type)) this.render();
  }

  render() {
    const total = SCHOOLS.length;
    const submitted = SCHOOLS.filter((s) => ["sub", "int", "adm"].includes(this.store.record(s.id).status)).length;
    const inProg = SCHOOLS.filter((s) => this.store.record(s.id).status === "prog").length;
    const matDone = SCHOOLS.reduce((a, s) => a + this.store.materialsDone(s.id), 0);
    const next = [...SCHOOLS].sort((a, b) => a.d.localeCompare(b.d))[0];

    qs("#statTiles").innerHTML = `
      <div class="stat"><div class="k">Ranked programs</div><div class="v">${total}</div>
        <div class="d">full top-50 list, none filtered</div></div>
      <div class="stat"><div class="k">Submitted</div><div class="v">${submitted}</div>
        <div class="d">${inProg} in progress</div></div>
      <div class="stat"><div class="k">Materials checked</div><div class="v">${matDone}</div>
        <div class="d">across schools you're working on</div></div>
      <div class="stat"><div class="k">First deadline</div><div class="v mono" style="font-size:19px">${formatDate(next.d)}</div>
        <div class="d">${next.n} · ${daysUntil(next.d)} days out</div></div>`;

    qs("#timeline").innerHTML = [...SCHOOLS]
      .sort((a, b) => a.d.localeCompare(b.d))
      .slice(0, 12)
      .map(
        (s) => `
      <li><span class="date mono">${formatDate(s.d)}</span>
        <span class="who">#${s.r} ${s.n} <small>· ${s.dn}</small></span>${probabilityPill(s.id)}</li>`
      )
      .join("");
  }
}
