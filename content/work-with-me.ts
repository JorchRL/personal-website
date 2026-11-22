// /work-with-me: the page for contract clients. What he takes on (each offer
// one line on the work and one clause of proof, linked to the work page's
// section that tells it), how an engagement works (content/hire.ts holds the
// shared terms), and how to start.

import { home } from "./home";
import { site } from "./site";

// Rates, in US dollars: a week of work, and the smallest project. Change them
// here; the sentence on the page and its markdown twin are built from them.
const weekFromUsd = 3200;
const projectMinimumUsd = 3000;
const usd = (amount: number) => `US$${amount.toLocaleString("en-US")}`;

export type Offer = {
  title: string;
  text: string;
  proof: { label: string; href: string };
};

export const workWithMe = {
  lead: "I take on contract work: web apps, real-time 3D on the web, LLM content pipelines, and tools for game teams.",

  offers: [
    {
      title: "Real-time 3D in the browser",
      text: "Models, video and audio placed in a 3D scene, a camera that other people follow live, and the UI over it. I did this for three years on Twinteraction.",
      proof: { label: "Twinteraction", href: "/work/twinteraction#guided-excursions" },
    },
    {
      title: "LLM content pipelines with automated checks",
      text: "Content generated in batches and checked automatically: an adversarial LLM judging against rubrics, and embeddings to catch repeats. I built one that generated exams at Whiz.Study.",
      proof: { label: "Whiz.Study's contentinator", href: "/work/whiz-study#the-contentinator-exams-generated-and-checked-by-llms" },
    },
    {
      title: "Engines for content defined as data",
      text: "One runtime that plays content written as data, with a plugin API for new features. I designed one for exams and lessons at Whiz.Study.",
      proof: { label: "Whiz.Study's exam engine", href: "/work/whiz-study#the-exam-engine-one-runtime-exams-as-data" },
    },
    {
      title: "A web app that grew without a plan",
      text: "Moving a large TypeScript and React codebase off global state and onto an architecture that new features plug into, without stopping work.",
      proof: { label: "Twinteraction's tour engine", href: "/work/twinteraction#the-hardest-problem-a-tour-engine-held-together-by-globals" },
    },
    {
      title: "Tools for game teams",
      text: "Editors in the browser for the people who build content: placing and setting up things in a 3D scene, and exporting it. I worked on Twinteraction's tour editor.",
      proof: { label: "Twinteraction", href: "/work/twinteraction#loading-visibility-and-cost" },
    },
    {
      title: "A tech lead for a small team",
      text: "I led five junior engineers through a rebuild at Whiz.Study, with a weekly tech meeting on ideas such as abstraction and ports and adapters.",
      proof: { label: "Whiz.Study", href: "/work/whiz-study#leading-the-team" },
    },
  ] satisfies Offer[],

  weekFromUsd,
  projectMinimumUsd,
  rates: `Contract work is billed by the week or as a fixed price for a written scope. A week is from ${usd(weekFromUsd)}, and projects start at ${usd(projectMinimumUsd)}. Tell me what you're building and I'll reply within ${home.replyWithin} with a quote.`,
  hours: `Available ${site.start}.`,

  // How to start, in order.
  steps: [
    "Email me what you are building, your timeline and a rough budget.",
    `I reply within ${home.replyWithin}, with my questions or a time for a call.`,
    "After the call I send a short written proposal: what I will do, by when, and the price.",
  ],
};
