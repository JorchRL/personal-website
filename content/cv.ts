// The CV: /cv and public/cv.pdf are both made from this file (with the
// dates from each entry's work page; the title, availability, contact details
// and what he is looking for from site.ts; the hiring terms and his English
// from hire.ts). After changing it, regenerate the PDF: pnpm cv:pdf (LaTeX, via Tectonic).
// Outcome lines read best at 150 to 215 characters (two lines in the PDF);
// pnpm cv:pdf lists the ones outside that window.

export type CvEntry = {
  /** Full job title, as on a contract. */
  title: string;
  /** The real company name: the employer, as on the contract. */
  company: string;
  /** A line under the company, in italics: what the work was on (the app, when it is not the company's name). */
  context?: string;
  /** Where the work was done, on the company's row: "Remote". */
  location?: string;
  /** The work page this entry links to; its `period` gives the dates. */
  work: string;
  /** Two to five outcome lines. `**…**` marks a key fact: bold on /cv and in the PDF. */
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
      company: "West Palm Test Prep",
      context: "Whiz.Study, a test-prep app with about 100,000 students when I left",
      location: "Remote",
      work: "whiz-study",
      outcomes: [
        "Led **three junior engineers** and mentored **two more junior developers** through the redesign and rebuild of an inherited **300,000+ line** codebase in **about 4 to 6 months**, migrating all users, data and infrastructure.",
        "Chose a **hexagonal design** (Next.js, TypeScript, Drizzle, Zod, Supabase): a zero-dependency domain, services behind adapters. Indexes cut database usage from **about 99% to 1%**; Lighthouse went from **about 60–70 to 90+**.",
        "Designed an **exam engine**: one generic runtime, each exam a level defined as data, new exams as DLCs (APs, MCAT and more). Designed its **AI tutor** plugin, built with one other engineer: the **top subscription driver**.",
        "Designed the contentinator, an **LLM pipeline** checked by an **adversarial LLM** against exam-writing rubrics, with vector search to catch repeats. It produced **75,000+ questions in two months**, saving nearly **$296,000**.",
        "Built the payments entirely on my own: **Stripe subscriptions, one-time payments and free-trial entitlements**. Subscription revenue went from **zero to about $5k MRR** by the time I left.",
      ],
    },
    {
      title: "Main engineer",
      company: "Dimensione3",
      location: "Remote",
      work: "twinteraction",
      outcomes: [
        "Main engineer on **Twinteraction**, a platform that turns **3D scans of real places** into tours people walk through in the browser.",
        "Re-architected its **tour engine**, which runs tours defined in JSON, into an **engine core with feature plugins**. Old and new ran side by side while features moved over one at a time.",
        "Built new features on it: a **chatbot** that answers from a knowledge base kept per tour, quizzes, and a bridge to learning platforms over **LTI**. Integrated our tours with **Moodle** courses.",
        "Did most of the **maintenance, optimisation and debugging**, and ran the **Kubernetes** setup. Set up unit tests with **Vitest in CI**, then integration and end-to-end tests.",
      ],
    },
  ] satisfies CvEntry[],

  projects: [
    {
      work: "the-lone-wander",
      outcomes: [
        "A small **3D Zelda-like in Godot**, heading for a **public demo**. So far: the host (scenes, UI stack, pause, saves, timers), movement, a camera rig with lock-on, menus, the map, and a **shader** written from an empty file.",
      ],
    },
    {
      work: "plain-engine",
      outcomes: [
        "A game engine written **by hand in C++** on macOS, following **Handmade Hero**. The game is a shared library that **reloads into the running engine** and keeps its state, in memory the platform owns.",
      ],
    },
    {
      work: "lumen",
      outcomes: [
        "A tutor that models a subject as concepts in a prerequisite order and the learner as evidence, and computes **what to learn next and why**. A working prototype, not yet used by learners.",
        "A Kotlin **modular monolith**: a zero-dependency domain, use cases as the only entry points (web, command line, MCP) and **486 property-based laws**. I design and approve each brief; AI coding agents write most of the code.",
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
