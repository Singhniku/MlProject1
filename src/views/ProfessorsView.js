import { View } from "./View.js";
import { qs, qsa, escapeHtml } from "../core/dom.js";
import { SCHOOLS } from "../data/schools.js";
import { probabilityPill } from "../core/presenters.js";
import { ScholarLinkService } from "../services/ScholarLinkService.js";

// Professors tab: two faculty per university with Scholar links and a "Draft email"
// action that hands off to the injected EmailModalView. Filter box narrows by any field.
export class ProfessorsView extends View {
  constructor(emailModal) {
    super(qs("#profs"));
    this.emailModal = emailModal;
  }

  init() {
    qs("#profSearch").addEventListener("input", (e) => this.render(e.target.value));
    this.render("");
  }

  render(filter = "") {
    const q = filter.trim().toLowerCase();
    qs("#profList").innerHTML =
      SCHOOLS.map((s) => {
        const rows = s.profs.filter(
          ([name, area]) =>
            !q || s.n.toLowerCase().includes(q) || name.toLowerCase().includes(q) || area.toLowerCase().includes(q)
        );
        if (!rows.length) return "";
        return `<div class="uniblock">
        <header><span class="rankno">#${s.r}</span><span class="cname">${s.n}</span>
          <span class="csub">${s.c}</span>${probabilityPill(s.id)}</header>
        ${rows
          .map(
            ([name, area]) => `
        <div class="profrow">
          <span class="pname">${name}</span>
          <span class="parea">${area}</span>
          <a href="${ScholarLinkService.authorSearch(name, s.n)}" target="_blank" rel="noopener">Scholar ↗</a>
          <button class="btn primary" data-mail="${s.id}|${escapeHtml(name)}|${escapeHtml(area)}">Draft email</button>
        </div>`
          )
          .join("")}
      </div>`;
      }).join("") || '<p class="note">No matches — try a broader term.</p>';

    qsa("[data-mail]").forEach((b) =>
      b.addEventListener("click", () => {
        const [id, name, area] = b.dataset.mail.split("|");
        this.emailModal.open(SCHOOLS.find((x) => x.id === id), name, area);
      })
    );
  }
}
