// Presentation helpers: turn domain data into the small HTML fragments the views reuse.
// Depend on data + format only (no state, no DOM writes) so any view can call them.
import { ADMISSIONS } from "../data/admissions.js";
import { PROGRAMS } from "../data/programs.js";
import { formatDate, daysUntil } from "./format.js";

// Admit-probability pill for a school id.
export function probabilityPill(id) {
  const p = (ADMISSIONS[id] || {}).prob ?? 0;
  const cls = p < 10 ? "p-amb" : p < 30 ? "p-tgt" : p < 50 ? "p-info" : "p-safe";
  const lbl = p < 5 ? "Very low" : p < 15 ? "Low" : p < 30 ? "Possible" : p < 50 ? "Fair" : "Good";
  return `<span class="pill ${cls}">~${p}% · ${lbl}</span>`;
}

// Deadline cell with an urgency pill (school object with .d date and .dn note).
export function deadlineCell(school) {
  const d = daysUntil(school.d);
  const cls = d < 60 ? "p-amb" : d < 150 ? "p-tgt" : "p-acc";
  return `<div class="deadline"><span class="mono">${formatDate(school.d)}</span><br>
    <span class="pill ${cls} days">${d > 0 ? d + " days left" : "passed"}</span>
    <div class="csub">${school.dn}</div></div>`;
}

// Distinct area codes a school's programs cover.
export const schoolAreas = (id) => [...new Set((PROGRAMS[id] || []).flatMap((p) => p[0]))];
