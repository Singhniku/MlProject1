import { View } from "./View.js";
import { qs } from "../core/dom.js";
import { VALUE_SCHOOLS } from "../data/value.js";
import { money, formatDate } from "../core/format.js";

// Best-value tab: budget picks (< $30K total tuition) as cards, cheapest first.
export class ValueView extends View {
  constructor() {
    super(qs("#value"));
  }

  onChange(change) {
    if (change.type === "reset") this.render();
  }

  render() {
    qs("#valueCards").innerHTML = [...VALUE_SCHOOLS]
      .sort((a, b) => a.t - b.t)
      .map(
        (s, i) => `
      <div class="vcard">
        <span class="rank">Value pick #${i + 1}</span>
        <h3>${s.n}</h3>
        <div class="price mono">${money(s.t)} <small>est. total intl tuition</small></div>
        <div class="meta">${s.c} · ${s.why}</div>
        <div>${s.f.map((c) => `<span class="course">${c}</span>`).join("")}</div>
        <div class="meta">Deadline ${formatDate(s.d)} (${s.dn})</div>
        <footer><span class="pill p-safe">Safe</span> <a href="${s.p}" target="_blank" rel="noopener">Admission portal ↗</a></footer>
      </div>`
      )
      .join("");
  }
}
