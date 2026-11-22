// The about page's sections after its opening text (content/about.md): the
// roles he fits at a game studio, the skills table, why games, and how to
// hire him (content/hire.ts). Every proof points at a work page, and the
// account itself lives there: a role's proof is one clause and a link to the
// section that tells it. The home page's employers' door lists these roles.

export type StudioRole = {
  role: string;
  /** What he has done that fits it, in one clause. */
  proof: string;
  /** The work page's section that tells it: /work/<slug>#<heading id>. */
  href: string;
};

export const studioRoles: StudioRole[] = [
  {
    role: "Data-driven systems and plugin APIs",
    proof:
      "Whiz.Study's exam engine: one runtime, each exam a level defined as data, features added as plugins.",
    href: "/work/whiz-study#the-exam-engine-one-runtime-exams-as-data",
  },
  {
    role: "Content pipelines and tools",
    proof:
      "Whiz.Study's contentinator, which generated exams in batches and had an adversarial LLM check each one.",
    href: "/work/whiz-study#the-contentinator-exams-generated-and-checked-by-llms",
  },
  {
    role: "Game UI in HTML, CSS and JavaScript",
    proof:
      "Three years of TypeScript and React UI drawn over a live 3D scene on Twinteraction.",
    href: "/work/twinteraction#the-hardest-problem-a-tour-engine-held-together-by-globals",
  },
  {
    role: "Backend and online services",
    proof:
      "Twinteraction's guided excursions, where a guide's camera moves reach every guest over Socket.IO.",
    href: "/work/twinteraction#guided-excursions",
  },
  {
    role: "Internal tools",
    proof:
      "Work on Twinteraction's tour editor, where a team places 3D models, video, audio and tags in a scanned space.",
    href: "/work/twinteraction#loading-visibility-and-cost",
  },
  {
    role: "Telemetry",
    proof:
      "Light so far. On Twinteraction I moved the analytics service out of global scope and into the tour engine.",
    href: "/work/twinteraction#the-hardest-problem-a-tour-engine-held-together-by-globals",
  },
  {
    role: "Web and engine tooling",
    proof:
      "Plain Engine's hand-written build with a watcher, and game code that reloads into the running engine without losing its state.",
    href: "/work/plain-engine#the-hardest-part-so-far-reloading-code-without-losing-the-game",
  },
];

/** Under the roles: where he stands on gameplay and engine work. */
export const studioRolesNote =
  "Gameplay and engine programming are what I am learning now, in The Lone Wander and Plain Engine. I show them as learning projects, not as experience.";

export type SkillRow = {
  /** The skill, or { stackOf: slug }: that work page's stack (the row shows once the stack is given there). */
  skill: string | { stackOf: string };
  usedFor: string;
  /** A work page that shows it, if one does. */
  href?: string;
  /** A year, or { endOf: slug }: the last year of that work page's period (a dash until it is given there). */
  lastUsed: string | { endOf: string };
  depth: string;
};

// Depth, in the same words throughout: "Work, 3 years" (daily, on the job),
// "Work, occasional", "Own project", "Learning" (an own project I am learning
// it in), "Tried, long ago".
export const skills: SkillRow[] = [
  {
    skill: "Plugin architectures",
    usedFor: "Whiz.Study's exam engine and its AI tutor plugin; Twinteraction's engine core with feature plugins",
    href: "/work/whiz-study",
    lastUsed: "2026",
    depth: "Work",
  },
  {
    skill: "Hexagonal architecture and domain-driven design",
    usedFor: "Whiz.Study's rebuild: a domain model with zero dependencies, use-case entry points, every third-party service behind an adapter",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "LLM pipelines and evaluation",
    usedFor: "Whiz.Study's contentinator: generation jobs through OpenRouter (mostly Gemini Flash), checked by an adversarial LLM against exam-writing rubrics",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "LLM tool calls",
    usedFor: "Whiz.Study's AI tutor, which acts on the exam's UI",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "Embeddings and vector search",
    usedFor: "Finding near-duplicate questions in Whiz.Study's generated exams",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "Stripe",
    usedFor: "Whiz.Study's subscription payments",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "Next.js, Drizzle and Zod",
    usedFor: "Whiz.Study's rebuilt app, its database access and its schemas",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "Supabase and Postgres indexing",
    usedFor: "Whiz.Study's database and its indexes",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "Leading and teaching a team",
    usedFor: "Five junior engineers at Whiz.Study: a weekly tech meeting, readings, The Pragmatic Programmer",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "TypeScript",
    usedFor: "Twinteraction's tour engine, its feature registry and its UI; Whiz.Study's rebuild",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work, 3 years",
  },
  {
    skill: "React",
    usedFor: "Twinteraction's editor and visitor UI, rendered into one React root",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work, 3 years",
  },
  {
    skill: "MobX",
    usedFor: "Twinteraction's state stores",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work",
  },
  {
    skill: "three.js and the Matterport Showcase SDK",
    usedFor: "3D models, video and audio placed in scanned spaces; loading them room by room; the tour engine's port into three.js",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work, 3 years",
  },
  {
    skill: "Socket.IO",
    usedFor: "Guided excursions: a guide's camera sent to every guest",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work",
  },
  {
    skill: "Node.js and PostgreSQL",
    usedFor: "API endpoints and data models for Twinteraction's backend",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work, occasional",
  },
  {
    skill: "Vitest",
    usedFor: "Unit tests in CI, then integration and end-to-end tests",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work",
  },
  {
    skill: "Kubernetes",
    usedFor: "Running Twinteraction's Kubernetes setup, which I inherited",
    href: "/work/twinteraction",
    lastUsed: "2026",
    depth: "Work",
  },
  {
    skill: "Web performance (Lighthouse)",
    usedFor: "Whiz.Study's slowest pages, and the nested database requests behind them",
    href: "/work/whiz-study",
    lastUsed: { endOf: "whiz-study" },
    depth: "Work",
  },
  {
    skill: "C++20",
    usedFor: "Plain Engine's platform layer: memory from mmap, game code reloaded through dlopen",
    href: "/work/plain-engine",
    lastUsed: "2026",
    depth: "Learning",
  },
  {
    skill: "Clang, POSIX and the macOS loader",
    usedFor: "Plain Engine's build with every warning on, and reloading a library by file identity",
    href: "/work/plain-engine",
    lastUsed: "2026",
    depth: "Learning",
  },
  {
    skill: "raylib",
    usedFor: "Plain Engine's window, input polling and GL context, and nothing else",
    href: "/work/plain-engine",
    lastUsed: "2026",
    depth: "Learning",
  },
  {
    skill: "Bash",
    usedFor: "Plain Engine's build script and its watcher",
    href: "/work/plain-engine",
    lastUsed: "2026",
    depth: "Own project",
  },
  {
    skill: "Godot 4 and GDScript",
    usedFor: "The Lone Wander: the host, movement, the camera rig, menus and the map",
    href: "/work/the-lone-wander",
    lastUsed: "2026",
    depth: "Learning",
  },
  {
    skill: "Godot shading language",
    usedFor: "The Lone Wander's painted-miniature shader, written from an empty file",
    href: "/work/the-lone-wander",
    lastUsed: "2026",
    depth: "Learning",
  },
  {
    skill: "WebGL",
    usedFor: "A post on drawing a single point, the hard way",
    href: "/blog/webgl-or-how-to-draw-a-single-point-the-hard-way",
    lastUsed: "2023",
    depth: "Learning",
  },
  {
    skill: "Unity and C#",
    usedFor: "My first try at learning to code",
    lastUsed: "2012",
    depth: "Tried, long ago",
  },
];

export const whyGames =
  "I learned to program because I wanted to make games, games like Zelda. I am not a computer scientist by training. Games are why I started, and making them is the work I want most.";
