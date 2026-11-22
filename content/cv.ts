// The CV: /cv and public/cv.pdf are both made from this file (with the
// dates from each entry's work page; the title, availability, contact details
// and what he is looking for from site.ts; the hiring terms and his English
// from hire.ts). After changing it, regenerate the PDF: pnpm build && pnpm cv:pdf.

export type CvEntry = {
  /** Full job title, as on a contract. */
  title: string;
  /** The real company name. */
  company: string;
  /** The work page this entry links to; its `period` gives the dates. */
  work: string;
  /** Two to four outcome lines. */
  outcomes: string[];
};

export type CvProject = {
  /** The work page: its title, role, period and stack head the entry. */
  work: string;
  outcomes: string[];
};

export const cv = {
  summary:
    "Led the rebuild of Whiz.Study, a test-prep platform with about 100,000 students when I left, and designed its exam engine, its LLM content pipeline and its AI tutor. Main engineer on Twinteraction, 3D tours of real places in the browser, for three years. Now building a game in Godot and an engine in C++, to move into game development.",

  experience: [
    {
      title: "Software engineer, then tech lead",
      company: "Whiz.Study",
      work: "whiz-study",
      outcomes: [
        "Led five junior engineers in rebuilding a test-prep platform from scratch in Next.js, TypeScript, Drizzle, Zod and Supabase, on a hexagonal design: a domain model with zero dependencies, every third-party service behind an adapter. It had about 100,000 students when I left.",
        "Designed an exam engine: one generic runtime, each exam a level defined as data, new exam types added as DLCs (APs, MCAT and others), and a plugin API. Built the AI tutor as a plugin whose tool calls act on the exam's UI.",
        "Designed the contentinator, an LLM pipeline (through OpenRouter, mostly Gemini Flash) that generated exams in batches of 100, checked by an adversarial LLM against exam-writing rubrics, with embeddings and vector search to catch repeats.",
        "Built Stripe subscriptions, which went from zero to about $5k a month. Added indexes that took database usage from about 99% to about 1%, and fixed nested requests that took Lighthouse scores from about 60–70 to 90+.",
      ],
    },
    {
      title: "Main engineer",
      company: "Dimensione3",
      work: "twinteraction",
      outcomes: [
        "Main engineer on Twinteraction, a platform that turns 3D scans of real places into tours people walk through in the browser.",
        "Re-architected its tour engine, which runs tours defined in JSON, into an engine core with feature plugins. Old and new ran side by side while features moved over one at a time.",
        "Built new features on it: a chatbot that answers from a knowledge base kept per tour, quizzes, and a bridge to learning platforms over LTI. Integrated our tours with Moodle courses.",
        "Did most of the maintenance, optimisation and debugging, and ran the Kubernetes setup. Set up unit tests with Vitest in CI, then integration and end-to-end tests.",
      ],
    },
  ] satisfies CvEntry[],

  projects: [
    {
      work: "the-lone-wander",
      outcomes: [
        "A small 3D Zelda-like in Godot, heading for a public demo.",
        "Built so far: the host (scene slot, UI stack, pause, saves, named timers), the wanderer's movement, a camera rig with shots and lock-on, menus, the map, and the look's shader, written from an empty file.",
      ],
    },
    {
      work: "plain-engine",
      outcomes: [
        "A game engine written by hand in C++ on macOS, following Handmade Hero.",
        "The game is a shared library that reloads into the running engine and keeps its state, in memory the platform owns.",
      ],
    },
    {
      work: "lumen",
      outcomes: [
        "A tutor that models a subject as concepts in a prerequisite order and the learner as evidence, and computes what to learn next and why. A working prototype, not yet used by learners.",
        "A Kotlin modular monolith: a domain with zero dependencies, use cases as the only entry points (web app, command line and MCP), activities as data on a generic engine, and 486 property-based laws. I design and approve each brief; AI coding agents write most of the code.",
      ],
    },
  ] satisfies CvProject[],

  skills: [
    { group: "Programming languages", items: "TypeScript, JavaScript, C++20, GDScript, Bash" },
    { group: "Architecture", items: "Hexagonal (ports and adapters), domain-driven design, plugin architectures, data-driven runtimes" },
    { group: "LLMs", items: "Generation pipelines with LLM verification, tool calls, embeddings and vector search, OpenRouter" },
    { group: "Web", items: "React, Next.js, MobX, Node.js, PostgreSQL, Supabase, Drizzle, Zod, Stripe, Socket.IO, Vitest" },
    { group: "3D and games", items: "three.js, Matterport Showcase SDK, Godot 4, raylib" },
    { group: "Infrastructure", items: "Kubernetes" },
  ],
};
