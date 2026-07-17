import { View } from "./View.js";
import { qs } from "../core/dom.js";
import { EmailComposer } from "../services/EmailComposer.js";

// Outreach-email dialog: builds a draft with EmailComposer, and offers copy / open-in-mail.
export class EmailModalView extends View {
  constructor() {
    super(qs("#overlay"));
    this.title = qs("#mTitle");
    this.text = qs("#mText");
  }

  init() {
    qs("#mClose").addEventListener("click", () => this.close());
    this.root.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
    qs("#mCopy").addEventListener("click", () => {
      navigator.clipboard.writeText(this.text.value).then(() => {
        const btn = qs("#mCopy");
        btn.textContent = "Copied ✓";
        setTimeout(() => (btn.textContent = "Copy email"), 1600);
      });
    });
    qs("#mMailto").addEventListener("click", (e) => {
      const t = this.text.value;
      const nl = t.indexOf("\n");
      const subject = t.slice(9, nl).trim();
      const body = t.slice(nl + 1).trim();
      e.currentTarget.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  open(school, name, area) {
    this.title.textContent = "Email — " + name + " (" + school.n + ")";
    this.text.value = EmailComposer.compose(school, name, area).text;
    this.root.classList.add("on");
    this.text.focus();
  }

  close() {
    this.root.classList.remove("on");
  }
}
