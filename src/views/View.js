// Base class for every view. Views own one region of the DOM and expose render();
// state-aware views also implement onChange(change) to react to store events.
// Keeping the surface this small is deliberate (Interface Segregation) — callers only
// ever need render()/onChange, and views stay substitutable (Liskov).
export class View {
  constructor(root) {
    this.root = root;
  }
  render() {}
  onChange(_change) {}
}
