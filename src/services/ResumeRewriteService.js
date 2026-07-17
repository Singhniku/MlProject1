// Calls the local server's AI-rewrite endpoint (server.py -> Anthropic API using a key
// from .env). Only works when the app is served locally with a configured API key —
// the published Artifact has no server to call, so this fails with a clear message there.
export const ResumeRewriteService = {
  async rewrite(resumeText, jobText) {
    let res;
    try {
      res = await fetch("/api/resume/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobText }),
      });
    } catch (e) {
      throw new Error("Couldn't reach the local server. Run ./setup (or python3 server.py) and open http://127.0.0.1:8500.");
    }
    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      /* non-JSON error body — data stays {} */
    }
    if (!res.ok) throw new Error(data.error || `AI rewrite failed (HTTP ${res.status}).`);
    return data.rewritten;
  },
};
