// Client-side ATS-compatibility scorer. Scores against real, documented ATS parsing
// behaviors (keyword matching, standard sections, quantified bullets, strong verbs,
// contact info, length) rather than any single vendor's proprietary algorithm — no
// scanner can guarantee a universal "100/100" against every company's ATS, so this is
// framed as a compatibility estimate, not a guarantee.
const WEAK_PHRASES = [
  "responsible for", "worked on", "helped with", "was involved in",
  "in charge of", "duties included", "tasked with", "assisted with",
];
const SECTION_HEADERS = ["experience", "education", "skills", "summary", "projects", "certifications"];
const STOPWORDS = new Set([
  "the","and","a","an","of","to","in","for","with","on","at","by","is","are","this","that",
  "as","or","be","from","will","you","your","we","our","their","who","what","have","has",
  "must","can","will","into","using","across","per","also","such","other","new",
]);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9+.#-]{1,}/g) || []).filter(
    (w) => !STOPWORDS.has(w) && w.length > 2
  );
}

function topKeywords(jobText, limit = 25) {
  const freq = {};
  tokenize(jobText).forEach((w) => (freq[w] = (freq[w] || 0) + 1));
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

// @returns {score, maxScore, checks[], missingKeywords[], matchedKeywords[], wordCount}
export function analyzeResume(resumeText, jobText = "") {
  const lower = resumeText.toLowerCase();
  const lines = resumeText.split(/\r?\n/).filter((l) => l.trim());
  const wordCount = tokenize(resumeText).length;
  const checks = [];
  let score = 0;

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  const hasPhone = /(\+?\d[\d\-\s()]{7,}\d)/.test(resumeText);
  const contactPts = (hasEmail ? 8 : 0) + (hasPhone ? 7 : 0);
  score += contactPts;
  checks.push({
    label: "Contact info", pass: hasEmail && hasPhone, points: contactPts, max: 15,
    detail: hasEmail && hasPhone ? "Email and phone number found." :
      `Missing: ${[!hasEmail && "email", !hasPhone && "phone"].filter(Boolean).join(", ")}.`,
  });

  const foundSections = SECTION_HEADERS.filter((h) => lower.includes(h));
  const sectionPts = Math.round((foundSections.length / SECTION_HEADERS.length) * 15);
  score += sectionPts;
  checks.push({
    label: "Standard section headers", pass: foundSections.length >= 3, points: sectionPts, max: 15,
    detail: `Found: ${foundSections.join(", ") || "none"}. ATS parsers key off standard headings like Experience, Education, and Skills.`,
  });

  const bulletLines = lines.filter((l) => /^[\s]*[-•*]/.test(l) || l.trim().length > 30);
  const quantified = bulletLines.filter((l) => /\d/.test(l));
  const quantPct = bulletLines.length ? quantified.length / bulletLines.length : 0;
  const quantPts = Math.round(quantPct * 20);
  score += quantPts;
  checks.push({
    label: "Quantified achievements", pass: quantPct >= 0.5, points: quantPts, max: 20,
    detail: `${quantified.length}/${bulletLines.length || 0} bullet-like lines include a number or metric.`,
  });

  const weakHits = WEAK_PHRASES.filter((p) => lower.includes(p));
  const weakPts = Math.max(0, 15 - weakHits.length * 4);
  score += weakPts;
  checks.push({
    label: "Strong action verbs", pass: weakHits.length === 0, points: weakPts, max: 15,
    detail: weakHits.length ? `Weak phrasing found: "${weakHits.join('", "')}" — replace with a specific action verb.` : "No weak filler phrases detected.",
  });

  const lengthOk = wordCount >= 250 && wordCount <= 900;
  const lengthPts = lengthOk ? 10 : Math.max(0, 10 - Math.abs(wordCount < 250 ? 250 - wordCount : wordCount - 900) / 50);
  score += lengthPts;
  checks.push({
    label: "Resume length", pass: lengthOk, points: Math.round(lengthPts), max: 10,
    detail: `${wordCount} words (ATS-friendly range: roughly 250–900 words for a 1–2 page resume).`,
  });

  let keywordPts = 0, missing = [], matched = [];
  if (jobText.trim()) {
    const jdKeywords = topKeywords(jobText);
    const resumeTokens = new Set(tokenize(resumeText));
    matched = jdKeywords.filter((k) => resumeTokens.has(k));
    missing = jdKeywords.filter((k) => !resumeTokens.has(k));
    keywordPts = jdKeywords.length ? Math.round((matched.length / jdKeywords.length) * 25) : 0;
    score += keywordPts;
    checks.push({
      label: "Job-description keyword match", pass: matched.length / Math.max(1, jdKeywords.length) >= 0.6,
      points: keywordPts, max: 25,
      detail: `${matched.length}/${jdKeywords.length} top job-description terms found in your resume. Missing: ${missing.slice(0, 12).join(", ") || "none"}.`,
    });
  } else {
    checks.push({
      label: "Job-description keyword match", pass: null, points: 0, max: 25,
      detail: "Paste the target job description above to score keyword match — worth up to 25 of the 100 points, since real ATS ranking is always relative to a specific posting.",
    });
  }

  return { score: Math.min(100, Math.round(score)), maxScore: 100, checks, missingKeywords: missing, matchedKeywords: matched, wordCount };
}
