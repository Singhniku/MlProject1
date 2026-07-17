// Composes a personalized outreach email to a professor from the owner's profile.
// Returns the full text (first line is "Subject: …") plus a parsed subject/body pair
// so callers can drop it into a textarea or a mailto: link without re-parsing.
export const EmailComposer = {
  compose(school, name, area) {
    const last = name.split(" ").pop();
    const text = `Subject: Prospective MS applicant (Fall 2027) — research assistance in ${area.split("·")[0].trim()}

Dear Prof. ${last},

I am Nikita Singh, a software engineer at American Express with four years of backend and applied-AI experience, and I am applying to the MS program at ${school.n} for Fall 2027. Your group's work in ${area.toLowerCase()} is the reason ${school.n} is high on my list.

[Personalize this line before sending: name one specific recent paper of theirs from Google Scholar and say in one sentence what interested you or what you'd extend.]

Some quick context on my background:
- Built an agentic AI assistant (Llama-based) at Amex that automates case creation and processing for customer-care workflows.
- Re-architected a high-volume demographic-fetching service with parallel processing, and led a JDK 21 migration across five repositories.
- Certified in autonomous agents with LangChain and Hugging Face; comfortable with Java, Python, and production ML plumbing.

If you anticipate taking MS students for research assistance, thesis supervision, or even unfunded project work in the coming year, I would be glad to contribute — I can start remotely before Fall 2027 if useful. My resume is attached, and I am happy to share code or project write-ups.

Thank you for your time.

Best regards,
Nikita Singh
nikitasingh18dec@gmail.com · +91 83187 21284
linkedin.com/in/nikitasingh98`;
    const nl = text.indexOf("\n");
    return { text, subject: text.slice(9, nl).trim(), body: text.slice(nl + 1).trim() };
  },
};
