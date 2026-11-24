// Site-wide constants and the core facts: who Jorge is, what he wants, where
// he is and how to reach him. Every page, the CV, its PDF, the JSON-LD and the
// machine forms read these from here, so each is written once
// (test/core-facts.test.ts fails on a copy elsewhere). Social links, email and
// location come from the earlier version of this site.

// The engineering role alone: the CV, its PDF, /work-with-me and the end of a
// post or work page, which are read by people hiring.
const role = "Software engineer and tech lead.";
// Both his trades: the role line the rest of the site shows (the home page's
// first screen, /about, link previews, JSON-LD, llms.txt).
const roles = "Software engineer and watercolour artist.";

// The proof line, one sentence per claim. The last is also the link previews' middle sentence.
const proof = [
  "Led the rebuild of Whiz.Study, a test-prep platform with about 100,000 students, and designed its exam engine, content pipeline and AI tutor.",
  "Main engineer on Twinteraction, 3D tours of real places in the browser.",
  "Now building a game in Godot and an engine in C++.",
] as const;

const open = "Open to remote roles and contract work";
// When he can start, and for how much of the week.
const start = "full time, starting now";
const city = "Mexico City";
// Mexico City has kept this offset all year since Mexico stopped changing its clocks in 2022.
const timeZone = "UTC−6";

export const site = {
  name: "Jorge Romero",
  url: "https://jrlgs.dev",

  /** The role line on the CV, its PDF, /work-with-me and a post's or work page's end. */
  role,
  /** The role line everywhere else: both his trades. */
  roles,
  /** The proof line: jobs and current projects. */
  proof: proof.join(" "),
  /** What he is open to, on its own (the link previews' badge). */
  open,
  /** When and how much he can work, on its own (/work-with-me's hours). */
  start,
  /** The availability line. */
  availability: `${open}, ${start} · ${city} · ${timeZone} · full overlap with US hours`,
  lookingFor:
    "A remote software engineering role, ideally in game development: a studio working in Godot, Unity or Unreal, or on a sim.",

  city,
  location: `${city}, MX`,
  timeZone,

  /** The meta description, link previews, RSS, JSON-LD and llms.txt. */
  intro: `${roles} ${proof[2]} ${open}.`,

  email: "jorch.rl@gmail.com",
  social: {
    github: "https://github.com/jorchrl",
    linkedin: "https://linkedin.com/in/jorchrl",
    x: "https://twitter.com/jrlgs",
  },
} as const;

export type Site = typeof site;
