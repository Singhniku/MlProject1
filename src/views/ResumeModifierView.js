import { View } from "./View.js";
import { qs } from "../core/dom.js";
import { analyzeResume } from "../services/AtsAnalyzer.js";
import { ResumeRewriteService } from "../services/ResumeRewriteService.js";

// Resume Modifier tab: paste resume (+ optional job description), get an instant
// client-side ATS-compatibility score, and optionally send both to the local server
// for an AI rewrite (restructures bullets, targets JD keywords, never invents facts).
export class ResumeModifierView extends View {
  constructor() {
    super(qs("#resume"));
  }

  init() {
    qs("#atsCheckBtn").addEventListener("click", () => this.checkScore());
    qs("#aiRewriteBtn").addEventListener("click", () => this.rewrite());
    qs("#copyRewriteBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(qs("#rewriteOutput").value);
      const b = qs("#copyRewriteBtn");
      b.textContent = "Copied ✓";
      setTimeout(() => (b.textContent = "Copy rewritten text"), 1500);
    });
    qs("#rescoreRewriteBtn").addEventListener("click", () => {
      this.renderScore(analyzeResume(qs("#rewriteOutput").value, qs("#jdInput").value), true);
    });
  }

  checkScore() {
    const resumeText = qs("#resumeInput").value;
    if (!resumeText.trim()) {
      alert("Paste your resume text first.");
      return;
    }
    this.renderScore(analyzeResume(resumeText, qs("#jdInput").value));
  }

  async rewrite() {
    const resumeText = qs("#resumeInput").value;
    if (!resumeText.trim()) {
      alert("Paste your resume text first.");
      return;
    }
    const status = qs("#rewriteStatus");
    const btn = qs("#aiRewriteBtn");
    btn.disabled = true;
    status.textContent = "Rewriting with Claude…";
    try {
      const rewritten = await ResumeRewriteService.rewrite(resumeText, qs("#jdInput").value);
      qs("#rewritePanel").hidden = false;
      qs("#rewriteOutput").value = rewritten;
      status.textContent = "Done — review before using; verify no facts were altered.";
      this.renderScore(analyzeResume(rewritten, qs("#jdInput").value), true);
    } catch (e) {
      status.textContent = e.message;
    } finally {
      btn.disabled = false;
    }
  }

  renderScore(result, isRewrite = false) {
    const cls = result.score >= 85 ? "p-safe" : result.score >= 60 ? "p-tgt" : "p-amb";
    const borderColor = (c) => (c.pass === false ? "var(--bad)" : c.pass === null ? "var(--info)" : "var(--good)");
    qs("#atsScoreArea").innerHTML = `
      <div class="stat" style="max-width:260px;margin:14px 0">
        <div class="k">${isRewrite ? "Rewritten " : ""}ATS compatibility score</div>
        <div class="v"><span class="pill ${cls}" style="font-size:20px;padding:4px 14px">${result.score}/100</span></div>
        <div class="d">estimate against documented ATS parsing rules — not a guarantee for any specific company's system</div>
      </div>
      <div class="panel">
        ${result.checks
          .map(
            (c) => `
          <div class="advice" style="border-left-color:${borderColor(c)}">
            <b>${c.label}</b> — ${c.points}/${c.max} pts<br>${c.detail}
          </div>`
          )
          .join("")}
      </div>`;
  }
}
