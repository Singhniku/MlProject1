import { View } from "./View.js";
import { qs, qsa, escapeHtml } from "../core/dom.js";
import { SCHOOLS } from "../data/schools.js";
import { ADMISSIONS } from "../data/admissions.js";
import { PROGRAMS, AREAS } from "../data/programs.js";
import { CHECK_ITEMS } from "../data/checklist.js";
import { money } from "../core/format.js";
import { probabilityPill, deadlineCell, schoolAreas } from "../core/presenters.js";

// Top-50 tab: area filter chips + the college table with an expandable detail row per
// school (programs & requirements, GRE policy, materials checklist, notes).
export class CollegesView extends View {
  constructor(store) {
    super(qs("#colleges"));
    this.store = store;
    this.activeArea = null;
  }

  init() {
    this.renderFilters();
    this.render();
  }

  onChange(change) {
    if (change.type === "reset") {
      this.render();
    } else if (change.type === "checks") {
      this.refreshProgress(change.id);
    } else if (change.type === "notes" && change.source !== "colleges") {
      const t = qs(`[data-note="${change.id}"]`);
      if (t) t.value = this.store.record(change.id).notes;
    }
  }

  renderFilters() {
    qs("#areaFilters").innerHTML =
      `<button class="fchip ${this.activeArea === null ? "on" : ""}" data-area="">All areas</button>` +
      Object.entries(AREAS)
        .map(([k, label]) => `<button class="fchip ${this.activeArea === k ? "on" : ""}" data-area="${k}">${label}</button>`)
        .join("");
    qsa("#areaFilters .fchip").forEach((b) =>
      b.addEventListener("click", () => {
        this.activeArea = b.dataset.area || null;
        this.renderFilters();
        this.render();
      })
    );
  }

  render() {
    const shown = this.activeArea ? SCHOOLS.filter((s) => schoolAreas(s.id).includes(this.activeArea)) : SCHOOLS;
    qs("#collegeTbl tbody").innerHTML = shown.map((s) => this.rowHtml(s)).join("");
    this.wireRow();
  }

  rowHtml(s) {
    const n = this.store.materialsDone(s.id),
      tot = CHECK_ITEMS.length;
    const rec = this.store.record(s.id);
    const progs = PROGRAMS[s.id] || [];
    const ex = ADMISSIONS[s.id] || {};
    return `
    <tr>
      <td class="rankno">${s.r}</td>
      <td style="min-width:210px"><div class="cname">${s.n}</div><div class="csub">${s.c} · ${s.note}</div></td>
      <td>${probabilityPill(s.id)}</td>
      <td class="csub" style="min-width:150px;max-width:190px">${ex.ex || "—"}
        ${ex.v ? '<div><span class="pill p-safe" style="margin-top:3px">✓ verified on univ. site</span></div>' : '<div><span class="pill p-info" style="margin-top:3px">est. — verify</span></div>'}</td>
      <td class="csub" style="white-space:nowrap">${s.prog}</td>
      <td style="max-width:180px">${schoolAreas(s.id).map((a) => `<span class="course" title="${AREAS[a]}">${AREAS[a]}</span>`).join("")}
        <div class="csub" style="margin-top:2px">${progs.length} program${progs.length > 1 ? "s" : ""} — expand for reqs</div></td>
      <td class="mono" style="font-weight:650">${money(s.t)}${s.t ? '<div class="csub" style="font-family:-apple-system,sans-serif">total, intl</div>' : ""}</td>
      <td>${deadlineCell(s)}</td>
      <td><a href="${s.p}" target="_blank" rel="noopener">Apply ↗</a></td>
      <td>
        <div class="bar"><i style="width:${(100 * n) / tot}%"></i></div>
        <div class="prog-lbl">${n}/${tot} ready</div>
        <button class="btn" data-expand="${s.id}" aria-expanded="false">Checklist &amp; notes</button>
      </td>
    </tr>
    <tr class="detail" id="d-${s.id}" hidden><td colspan="10">
      <div class="detail-inner">
        <div style="grid-column:1/-1"><h4>Programs &amp; requirements</h4>
          ${progs
            .map(
              ([areas, name, req]) => `
          <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;padding:4px 0;border-bottom:1px dashed var(--line)">
            <span style="font-weight:650;font-size:13.5px">${name}</span>
            ${areas.map((a) => `<span class="course">${AREAS[a]}</span>`).join("")}
            <span class="csub" style="margin-left:auto">${req || "dept policy — see Exams column"}</span>
          </div>`
            )
            .join("")}
        </div>
        <div style="grid-column:1/-1"><h4>GRE requirement by program ${ex.v ? '<span class="pill p-safe">✓ verified on university site, Jul 2026</span>' : '<span class="pill p-info">estimated — confirm on portal</span>'}</h4>
          <p style="margin:0;font-size:13.5px;max-width:100ch">${ex.gd || ex.ex || "See portal."}</p>
        </div>
        <div><h4>Application materials</h4>
          <div class="checks">${CHECK_ITEMS.map(
            ([k, label]) => `
            <label><input type="checkbox" data-check="${s.id}:${k}" ${rec.checks[k] ? "checked" : ""}> ${label}</label>`
          ).join("")}
          </div>
        </div>
        <div><h4>Notes &amp; comments for this college</h4>
          <textarea data-note="${s.id}" placeholder="Your comments — professor replies, fee waivers, SOP angle, doubts…">${escapeHtml(rec.notes)}</textarea>
        </div>
      </div>
    </td></tr>`;
  }

  wireRow() {
    qsa("[data-expand]").forEach((b) =>
      b.addEventListener("click", () => {
        const row = document.getElementById("d-" + b.dataset.expand);
        row.hidden = !row.hidden;
        b.setAttribute("aria-expanded", String(!row.hidden));
        b.textContent = row.hidden ? "Checklist & notes" : "Close";
      })
    );
    qsa("[data-check]").forEach((c) =>
      c.addEventListener("change", () => {
        const [id, k] = c.dataset.check.split(":");
        this.store.toggleCheck(id, k, c.checked);
      })
    );
    qsa("[data-note]").forEach((t) =>
      t.addEventListener("input", () => this.store.setNotes(t.dataset.note, t.value, "colleges"))
    );
  }

  refreshProgress(id) {
    const btn = qs(`[data-expand="${id}"]`);
    if (!btn) return;
    const cell = btn.parentElement;
    const n = this.store.materialsDone(id),
      tot = CHECK_ITEMS.length;
    cell.querySelector(".bar i").style.width = (100 * n) / tot + "%";
    cell.querySelector(".prog-lbl").textContent = `${n}/${tot} ready`;
  }
}
