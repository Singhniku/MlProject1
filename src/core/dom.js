// Minimal DOM helpers shared across views.
export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

// Escape user-supplied text before inserting into innerHTML templates.
export const escapeHtml = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
