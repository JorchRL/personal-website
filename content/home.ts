// The home page's own words: the two doors and the contact notes (its
// showcase is content/showcase.ts). The role, proof and availability lines,
// and what he is looking for, come from content/site.ts; the roles he fits
// from content/about.ts; the contract route from content/hire.ts. Facts about
// Jorge come from content/site.ts, content/about.md and content/work/*.md;
// nothing here may go beyond them.

// How soon he answers an email, written once: the contact notes, the steps
// on /work-with-me and its rates all say it.
const replyWithin = "one business day";

export const home = {
  // 02 Two doors. The employers' door shows site.lookingFor and the roles in
  // content/about.ts; the clients' door adds hire.route after its line.
  hiring: { title: "Hiring?" },
  contract: {
    title: "Need a contractor?",
    text: "Web apps, real-time 3D on the web, LLM content pipelines, and tools for game teams.",
  },

  // 03 Contact: what to put in the email, and when he answers.
  include: "Send the role, the team and your time zone.",
  replyWithin,
  reply: `I reply within ${replyWithin}.`,
} as const;
