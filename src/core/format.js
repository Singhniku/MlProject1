// Pure formatting helpers — no DOM, no state.
export const money = (n) => (n == null ? "—" : "$" + n.toLocaleString("en-US"));

export const formatDate = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const daysUntil = (iso) =>
  Math.ceil((new Date(iso + "T12:00:00") - Date.now()) / 86400000);
