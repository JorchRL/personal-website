---
title: Lumen (working name)
role: Solo, own project
period: 2026–now
stack:
  - Kotlin
  - Ktor
  - Gradle
  - SQLite
  - TypeScript
  - React
  - Vite
  - Tailwind CSS
  - Cytoscape.js
  - Kotest
  - MCP
  - Anthropic and OpenAI-compatible models
description: "A tutor with a map: it models a subject as concepts in a prerequisite order, and the learner as evidence, to choose what to learn next and say why. My own project, a working prototype in progress."
order: 5
team: Solo, with AI coding agents
figure:
  src: /work/lumen/model.svg
  alt: "A diagram of how Lumen decides what to teach. Two explicit models sit at the top: the subject, concepts and what comes before what, drawn as a small graph; and the learner, evidence folded into mastery, which can fade. Both feed the planner, which computes what to learn next and why: the frontier of what the learner can learn now. Below, activities such as a quiz, a drill, a practice test and a Socratic dialogue run as data, and their results come back as evidence about the learner."
  width: 1200
  height: 630
  caption: "A diagram, not a screenshot. Two models feed the planner; activities run as data, and what the learner does comes back as evidence."
---

Lumen is a tutor with a map. You name a topic, or paste a syllabus. Lumen breaks it into
concepts, works out what comes before what, and teaches you one concept at a time. It
always says why this concept is next, and it keeps what you already know. Lumen is its
working name, and the tutor's face: an axolotl.

It is my own project, started in October 2026. It is a working prototype: verified end
to end offline, and once against a live model. No real learner has used it yet.

## Why I am building it

Before software I did research on creativity, within cognitive science. At
[Whiz.Study](/work/whiz-study) I built a learning platform: an
[exam engine](/work/whiz-study#the-exam-engine-one-runtime-exams-as-data), lessons and
an AI tutor. Modelling what each student knows, to tailor what they learn next, was
discussed there but never built. Lumen is that idea, and it is entirely mine. It is a
clean-room project: it uses only general, public patterns.

Most AI tutors are a chat box with a system prompt. They answer from scratch every time,
forget yesterday, and have no model of the subject or of you. Lumen keeps two explicit
models instead.

## How it models knowledge

**The subject.** A topic becomes concepts and a "before" relation between them. That
relation is a preorder, and it has a small algebra: everything you need for a concept,
everything it unlocks, and the frontier of what you can learn right now. An LLM proposes
the concepts and their order; the code treats that as untrusted input, repairs and
verifies it into a valid order, and reports its quality. Each topic is a plan, and your
plans join into one map of what you know, so knowing fractions for cooking counts for
algebra too.

**The learner.** Every attempt, recall, self-report and activity result is evidence, kept
as an append-only history per concept. Mastery is worked out from that history, never
stored as a flag, so it can fade: a mastered concept comes back due for review.

**What next.** The next concepts are the frontier: what is left before your target that
has nothing unlearned before it. Each comes with its reason: which prerequisites you
have, and what it unlocks. When the map turns out wrong (you master a concept without
its prerequisite, or keep failing one), the plan can repair itself: an LLM proposes
splits, merges and new edges, you accept the ones you agree with, and your progress
carries over to the new version.

The rule is that the LLM does the fuzzy work, such as breaking down a topic, writing an
exercise or grading a free answer, and the code owns the guarantees. The definitions
from order theory the planner relies on, and many other rules, are written as
property-based tests over random inputs: 486 such laws, among 2,422 tests.

## Activities as data

Activities run on an engine built on the same idea as the
[exam engine at Whiz.Study](/work/whiz-study#the-exam-engine-one-runtime-exams-as-data):
a generic engine, and activity kinds as data. A kind carries its scene, a small tree of
widgets, and the shape of its answers; the server checks the scene against the shapes
and decides what the learner may do next, and the web app has one interpreter that draws
any kind. No file in the web app names a kind.

Lumen, the tutor, is a plugin beside the scene. It calls the same use cases a person
would, with exactly that person's permissions, and it can act on the screen: the browser
sends its own tools with each turn, and when the model calls one, the browser runs it.

## How I build it

I make the design decisions and approve every brief. AI coding agents write most of the
code from those briefs, each in its own worktree, and every landing must pass the one
gate, `make check`. For its first days I typed the code myself, with an AI mentor; from
8 October 2026 I switched to this delegated way of building. The history holds 1,815
commits, 173 briefs and 19 architecture decisions.

The architecture is a modular monolith in Kotlin. The domain is pure Kotlin with zero
dependencies. Use cases are the only entry points, and the web app, a command line and
MCP (so an agent such as Claude Code can be your tutor) are three thin doors onto them,
generated from one catalogue. Expected failures are values, not exceptions. Any LLM
call can be recorded and replayed, so the whole system runs offline.

## Where it stands

| Part | Status |
| --- | --- |
| A topic broken into concepts in a verified prerequisite order | Built and tested |
| Plans joined into one map per learner, across topics | Built and tested |
| What next, with its reason | Built and tested |
| Mastery derived from evidence, with reviews when it fades | Built and tested |
| Plans that repair themselves, keeping progress | Built and tested |
| The activity engine: kinds and scenes as data | Built and tested |
| Lumen the tutor: tool calls, acting on the screen | Built and tested |
| The web app, the command line and MCP | Built and tested |
| The Socratic talk as the main way to learn | Built, in review |
| Payments and the public site | Built, then set aside |
| A first run with real learners and a real model | Next |
| The first deploy | Next |
| A version for schools | On paper only |

## Known problems

- It has not been measured with real learners, or against a plain chat tutor. That
  measurement is the next milestone.
- There are no mobile apps and no teams yet.
