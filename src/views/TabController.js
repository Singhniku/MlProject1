import { qsa } from "../core/dom.js";

// Wires the tab bar: activates the clicked nav button and shows its matching section.
// Independent of application state (Single Responsibility).
export class TabController {
  constructor() {
    this.buttons = qsa("nav button");
    this.sections = qsa("section");
  }

  init() {
    this.buttons.forEach((b) =>
      b.addEventListener("click", () => {
        this.buttons.forEach((x) => x.classList.toggle("on", x === b));
        this.sections.forEach((x) => x.classList.toggle("on", x.id === b.dataset.tab));
      })
    );
  }
}
