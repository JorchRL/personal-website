---
title: Twinteraction
role: Main engineer
period: 2023–2026
stack:
  - TypeScript
  - React
  - MobX
  - Matterport Showcase SDK
  - three.js
  - Socket.IO
  - Node.js
  - PostgreSQL
  - Docker
  - Kubernetes
  - Vitest
description: "A platform that turns 3D scans of real places into interactive, guided tours. I was its main engineer at Dimensione3 and moved its tour engine onto an architecture that new features plug into."
order: 2
team: Two, one junior engineer and me
figure:
  src: /work/twinteraction/tour-engine.svg
  alt: "A diagram of Twinteraction's tour engine. Features (the chatbot, quizzes, menus and the LTI bridge) plug into one engine core through its registry. The core runs a tour defined in JSON, and reaches the Matterport SDK, three.js, the host React app and the event system through ports. Outside the app, Moodle courses hold its tours."
  width: 1200
  height: 630
  caption: "Features plug into one engine core, which runs a tour written as JSON and reaches what it drives through ports. Moodle sits outside."
---

Twinteraction, built at Dimensione3, turns 3D scans of real places into tours you walk
through in the browser. On top of a Matterport scan it places 3D models, video, audio,
tags, menus and quizzes. Editors build a tour; visitors play it. In a guided excursion,
a guide moves through the space and every guest's camera follows.

I was its main engineer from 2023 to 2026. Most of my work was maintenance,
optimisation and debugging, and I re-architected the tour engine into an engine core
with feature plugins. One of the things I liked most was integrating our interactive
tours with Moodle courses.

## The hardest problem: a tour engine held together by globals

The engine is our own. It takes a tour defined in JSON, with everything we add on top of
the Matterport scan, and runs it by itself. It reaches the outside through ports: into
the Matterport SDK, three.js, the host React app and our own event system.

The code that runs a tour had grown since 2020, written by several teams. Services were
global singletons reached from anywhere, much of the logic lived inside React
components, and features were coupled to each other with no standard way to talk.

I took it apart in steps. First I moved the services out of the components and out of
global scope, passed them in through constructors, and typed the data that had been
untyped.

Then I wrote the design for a new architecture and built it. Every feature registers
with a feature registry, and features talk only through it: commands for what one
feature asks another to do, events for what has happened, and UI components that the
registry renders into a single React root. Core features load first; plugin features
are optional and switched on by configuration.

I did not rewrite it in one go. Old and new ran side by side, with adapters between
them, and features moved over one at a time. New work went straight onto the new
architecture: a chatbot that answers from a knowledge base kept per tour, quizzes,
menus, a command palette, and a bridge to learning platforms over LTI that reads and
posts scores.

## Guided excursions

A guide's camera moves go to every guest over Socket.IO, and each guest queues them and
replays them in order. Joining an excursion depended on a global reference to the 3D
viewer that was not always ready. I moved the join and the camera listeners into the
viewer's load callback, so they bind to the instance that has just loaded.

## Loading, visibility and cost

Much of the debugging was tracking down costly behaviour that was hard to trace.

A tour is a scanned space split into rooms, and its models load in stages rather than
all at once. I reworked the code that decides what loads next so it handles every layout
of rooms, and put it under unit tests.

Whether a model should be visible depends on where the visitor stands, and on some loads
a model showed where it should have been hidden. I moved that decision into one
function, with tests for each case.

Some editor-only helpers were being created for every placed model, even though they
stayed hidden, and together they cost a lot of CPU time. I took them out.

To check what a scene really holds, I added a button to the editor that exports the
whole scene as glTF, the scan's mesh included at its current level of detail.

## Tests

I set up unit tests with Vitest, ran them in CI, and later added integration and
end-to-end tests.

## Kubernetes

The app ran on a Kubernetes setup that was there before me. I ran it, and learned
Kubernetes doing so.
