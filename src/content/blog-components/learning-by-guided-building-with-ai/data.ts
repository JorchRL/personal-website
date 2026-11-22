// The words of the three diagrams in "Learning by guided building with AI".
// The faces (Faces.tsx), the live parts and the markdown twin (plain.ts) all
// read from here. The examples are simplified from Plain Engine's milestone M1
// (its brief, the code and the learning log for the GAME_UPDATE macro).
// Inline marks: `code`. No React here.

export type Who = "jorge" | "ai" | "both";

export const WHO_NAME: Record<Who, string> = { jorge: "Me", ai: "AI", both: "Me + AI" };

/** A tiny example beside a stage: always labelled "simplified example". */
export type Example = { label: string; lines: string[]; code?: boolean; mark?: string; remark?: string };

/* ---------- Fig. 1: the loop ---------- */

export type StageId = "discuss" | "prototype" | "brief" | "build" | "review";

export const loop = {
  title: "The loop",
  stages: [
    {
      id: "discuss",
      name: "Discuss",
      who: "both",
      text: "We settle what gets built, what I type by hand and what agents may write. Nothing is built before this.",
    },
    {
      id: "prototype",
      name: "Prototype",
      who: "ai",
      optional: true,
      text: "Optional. Agents build the idea fast in a side folder, so it can be tried before anyone types it properly.",
    },
    {
      id: "brief",
      name: "Brief",
      who: "ai",
      text: "The settled design becomes a brief that reads like a tutorial: the problem, the step in words, then the code to type. It is built once in a scratch copy first.",
      example: {
        label: "Simplified example: a brief step",
        lines: [
          "Write the signature of `game_update` once, in `game.h`.",
          "Why: the engine and the game must never disagree about it.",
          "Type: a macro, `GAME_UPDATE(name)`, used for both.",
        ],
      },
    },
    {
      id: "build",
      name: "Build by hand",
      who: "jorge",
      text: "I type every line, run it after each step and ask when I'm stuck.",
      example: {
        label: "Simplified example: the code it leads to",
        code: true,
        lines: [
          "#define GAME_UPDATE(name) void name(game_memory *memory, float dt)",
          "typedef GAME_UPDATE(game_update_fn);",
          "GAME_UPDATE(game_update);",
        ],
        mark: ";",
      },
    },
    {
      id: "review",
      name: "Review",
      who: "ai",
      text: "Only bugs that change behaviour. What arrived right and what needed a hint goes into a dated learning log, which shapes the next brief.",
      example: {
        label: "Simplified example: the review's remark",
        lines: ["All correct; missed the `;` after `GAME_UPDATE(game_update)`."],
        remark: "And the next briefs changed: words alone had left me stuck, so every step now shows its code.",
      },
    },
  ] as { id: StageId; name: string; who: Who; optional?: boolean; text: string; example?: Example }[],
  back: "next brief",
  credit: "Briefs and reviews written by Claude (the AI); code typed by me. Examples simplified from Plain Engine, milestone M1.",
};

/* ---------- Fig. 2: the scaffold comes down ---------- */

export type LevelId = "guided" | "challenge" | "contracts";

/** What a brief can give, top to bottom. */
export const SUPPORTS = ["Goal", "Contract", "Steps in words", "Code to type", "A few hints", "Check"] as const;
export type Support = (typeof SUPPORTS)[number];

export const scaffold = {
  title: "The scaffold comes down",
  step: "The same step at each level: write `game_update`'s signature once.",
  levels: [
    {
      id: "guided",
      name: "Guided",
      gives: ["Goal", "Contract", "Steps in words", "Code to type", "Check"] as Support[],
      who: "I type it from the brief.",
      status: "I am here",
      reached: true,
      text: "The brief gives the goal, the contract, each step in words and the code to type.",
    },
    {
      id: "challenge",
      name: "Challenge",
      gives: ["Goal", "Contract", "A few hints", "Check"] as Support[],
      who: "I work out the steps.",
      status: "Not reached yet",
      reached: false,
      text: "The brief gives the goal, the contract and the check, plus a few hints. The steps are mine to work out.",
    },
    {
      id: "contracts",
      name: "Contracts",
      gives: [] as Support[],
      who: "We design it; the AI implements, I review.",
      status: "Not reached yet",
      reached: false,
      text: "No brief to build from: we design the contract together, the AI implements it and I review.",
    },
  ] as { id: LevelId; name: string; gives: Support[]; who: string; status: string; reached: boolean; text: string }[],
  credit:
    "Levels from Plain Engine's learning log, written by Claude. Plain Engine is at guided; in The Lone Wander, one milestone (the map) was built at challenge.",
};

/* ---------- Fig. 3: the dial ---------- */

export type SettingId = "hand" | "for-me" | "agent";

export const dial = {
  title: "The dial",
  rows: { types: "Types the code", reviews: "Reviews", then: "Then" },
  settings: [
    {
      id: "hand",
      name: "By hand",
      scope: "per brief, the default",
      types: "jorge",
      reviews: "ai",
      text: "I type it from the brief; the AI reviews for bugs that change behaviour.",
    },
    {
      id: "for-me",
      name: "Build this one for me",
      scope: "per brief",
      types: "ai",
      reviews: undefined,
      then: "The agent walks me through the code, brief open.",
      text: "An agent builds that brief in my project, then walks me through the code with the brief open.",
    },
    {
      id: "agent",
      name: "implement: agent",
      scope: "per project",
      types: "ai",
      reviews: "ai",
      then: "I read a walkthrough of each pass and run its check.",
      text: "Agents implement from contract briefs and the AI reviews the diff. I stay in the loop through the discussion and a walkthrough of each pass.",
    },
  ] as { id: SettingId; name: string; scope: string; types: Who; reviews?: Who; then?: string; text: string }[],
  credit: "Settings from the guided-build method's notes. Plain Engine and The Lone Wander are both by hand.",
};
