---
title: Whiz.Study
role: Software engineer, then tech lead
period: Early 2025 – September 2026
stack:
  - TypeScript
  - Next.js
  - Drizzle
  - Zod
  - Supabase
  - Stripe
  - OpenRouter (mostly Gemini Flash)
  - Embeddings and vector search
description: "A test-prep platform with about 100,000 students when I left. I led its rebuild, and designed its exam engine, its content pipeline and its AI tutor."
order: 1
team: Six, five junior engineers and me
figure:
  src: /work/whiz-study/engine.svg
  alt: "A diagram of the exam engine in three bands. At the top, plugins: the AI tutor, and a slot for the next plugin, which reach the engine through its plugin API. In the middle, the exam engine, one generic runtime. At the bottom, the DLCs, data that meets the DLC contract: SAT, PSAT, APs, MCAT and lessons, each drawn as a small tree."
  width: 1200
  height: 630
  caption: "A diagram, not a screenshot. One runtime in the middle; exams and lessons come in below as data, and features such as the AI tutor plug in above."
---

Whiz.Study is a test-prep platform. It started with the SAT. When I left, it had about
100,000 students.

I joined as a software engineer in early 2025. From late 2025 I led a team of five
junior engineers in rebuilding the app from scratch. I left in September 2026.

## The rebuild

The app we inherited was a Next.js app whose server functions read the database
directly. Its 20 SAT and 20 PSAT exams were made by hand, and held together by sheer
willpower.

I chose a hexagonal design. The front end is separate. On the back end, an application
layer is a set of use-case entry points. Each one orchestrates the domain code, and
what the domain needs from outside, the database and the LLM calls, is injected into it
as an adapter.

I made it very explicit that the domain model, designed the DDD way, had zero
dependencies. Every third-party service sat behind an adapter. The stack was Next.js,
TypeScript, Drizzle, Zod and Supabase, and the LLM calls went through OpenRouter, for
the most part to Google's Gemini Flash.

## The exam engine: one runtime, exams as data

I designed an exam engine modelled roughly on DOOM's architecture. The engine is a
generic runtime. Each exam is a level: data, written against an API the engine knows.
Under the hood an exam is a tree.

A new kind of exam comes in as a "DLC", a definition that meets the engine's DLC
contract. That is how we added many APs, the MCAT and others to the SAT and the PSAT.

The engine also has a plugin system. Its shell exposes a context and an API to each
plugin. The [AI tutor](#the-ai-tutor-a-plugin-that-acts-on-the-exam) is one.

## The contentinator: exams generated and checked by LLMs

With the engine and the DLC contract in place, I designed the contentinator: a content
generation system that takes any one exam definition and generates exams en masse.

It has a pipeline abstraction. Each piece of content to make is a job, and the pipeline
runs the job through generation and then a verification loop.

The verification loop is two LLMs. The generator writes. The gladiator is instructed to
be adversarial and critical, and it judges against rubrics for exams that I gathered
from the literature on writing them. If the distractors on a multiple-choice question
(the wrong answers) are bad, for example, the gladiator blocks its approval.

To catch repeats, we embedded every generated and approved question. Each new question
is searched against them by vector similarity, and when a near match turns up, another
LLM evaluates it and proposes edits.

The contentinator ran almost entirely on its own. It produced batches of 100 exams and
100 sets of question-bank questions, and a lot of lessons. We were aiming at the
largest exam and question bank in the world.

A question's life did not end at approval. We tracked each question's lifetime, so we
could gather feedback after it went live. I built the feedback system: it records which
question a student was on when they sent feedback, so a complaint is tied to that
question.

## The AI tutor: a plugin that acts on the exam

I built the AI tutor on the agent-harness pattern, as a plugin on the exam engine.
Through the plugin API it gets tool calls that act on the exam's UI: cross off answers
that are wrong, highlight things, open the calculator and plot a function.

It was the first version of a planned AI-first guided learning platform.

## Road to 1600

Road to 1600 is a Duolingo-style path of interactive lessons, topic by topic (1600 is a
perfect SAT score). It runs on the same engine: a lesson is another DLC type. At the
start, the student sets a timeline, and Road to 1600 schedules lessons and diagnostic
exams spaced over it.

## Payments

My first task when I joined was Stripe payments for subscriptions. Subscriptions went
from making nothing to about $5k a month by the time I left.

## Performance

Database usage on Supabase sat at about 99%, because there were no indexes. I added
them, and usage dropped to about 1%.

Some pages loaded very slowly. They made a lot of extra database requests, nested ones,
fetching the bulk of the data to read one or two fields. Fixing that took the
platform's Lighthouse scores from about 60–70 to 90+.

## Leading the team

The team was five engineers and me, all juniors except me. I ran a weekly tech meeting.
I introduced topics and ways of thinking, such as abstraction and ports and adapters,
and assigned readings for the week, which we discussed.

Mostly I taught the ideas in The Pragmatic Programmer, and I asked the team to get the
book.
