---
title: The Lone Wander
role: Solo developer, in progress
period: 2026–now
stack:
  - Godot 4.7
  - GDScript
  - Jolt Physics
  - Blender
description: "A small 3D Zelda-like in a painted-miniature look, in progress in Godot. It is how I am moving into game development, and I build it myself."
order: 3
team: Solo
figure:
  src: /work/the-lone-wander/layers.svg
  alt: "A diagram of The Lone Wander's layers. Regions, the places, depend on Simulation, the running scene with the wanderer, the camera and the UI, which depends on World, the truth: facts in, state out, no nodes. All three may use the Host, which owns the scene slot, the UI stack, pause, saves and named timers; a screen is open, so the game is paused."
  width: 1200
  height: 630
  caption: "Dependencies point one way, toward the world's facts. Everything may use the host."
---

The Lone Wander is a small 3D Zelda-like I am making in Godot. You explore an
overworld, find abilities that open places you could see but not reach, clear its
dungeons, and meet six or seven people whose stories change with what you say and do.
It is planned at four to six hours, with a public demo first: the moor, the first
people, the first dungeon. It is in progress, and it is how I am moving into game
development.

## How I build it

I build the game myself, in the Godot editor and in its scripts. An AI model writes the
design docs and the briefs I build from, each one a pull request told as a story: the
problem, the choice, and what was turned down. I type the parts that carry a decision
and paste long mechanical code after reading it. Every brief is verified on an answer
key, a copy of the game with a tag at the end of each brief, and my code is reviewed
after each one.

I tried the faster way first: agents built each brief for me to merge. I ended up
reviewing code I had not made, and the understanding stayed with the agent. So I build
it, and keep the architecture in my head.

## The architecture

The decisions are written down as 21 short records, each with the alternatives turned
down. The ones that shape every script:

- **Layers with one-way dependencies.** The places depend on the running scene, which
  depends on the world: the game's state, with no nodes, so it could run headless. All
  three may use the host, which owns the loaded scene, the UI stack, pause and saves.
  Pause is derived from the stack: a screen is open, so the game is paused.
- **Entities made of components,** each with one job. A parent calls its children;
  children signal up.
- **Logic apart from the view.** Logic owns timing: a duration is a number, never "when
  the animation ends".
- **Facts, commands and queries.** What matters to the story is recorded as a fact in an
  append-only history, and the world's state is computed from it.
- **The camera as data.** A shot (distance, pitch, what to frame) is a resource. A zone,
  the lock-on or a talk pushes a shot and pops it when done, and the rig blends toward
  the top one.

## What I have built

The host (scene slot, UI stack, pause, saves, named timers), the wanderer's movement
(walking, the slide, and a vault and pivot around a staff), the camera rig with shots
and lock-on, the menus and the map. I also wrote the look's shader from an empty file:
the painted miniature, with no textures and real light and shadow.

## Milestones

| Date | What happened |
| --- | --- |
| 2026-08-23 | Design starts: the theme, the art direction, the scope. |
| 2026-09-23 | The architecture: who owns the game's state, where scenes begin and end. |
| 2026-10-31 | The camera rig, the journal and the map, built over four days. |
| 2026-11-05 | The wanderer's body and the slide. |
| 2026-11-09 | Game one becomes a traditional Zelda-like. The first idea, a mystery in drifting loops, is kept for a second game. |
| 2026-11-14 | Briefs become written pull requests, and the architecture is set down on one page. |
| 2026-11-16 | The vault and pivot round the staff, named timers in the host, and the painted-miniature shader. |
| 2026-11-19 | The briefs rewritten as fifteen for the demo, plus four for tools and feel. |

## Known problems

- My build is not playable from start to end yet. There is no combat, no dungeon and
  no one to talk to: those are the briefs ahead.
- The pivot round the staff is barely felt. I left it as built, to tune, rework or cut
  later.
- The look's data is heavy. The shader needs each corner's distance to the edges of its
  triangle, so no two triangles share a vertex. Across 440 models that is 412,000
  triangles, 1.22 million vertices and 104 MB of model files, with no automatic levels
  of detail. I will look at it again when the next set of models comes in, or when load
  time, memory or frame time complain.
- There are no automated tests. The only check is a headless boot that fails on any
  error in the log.

## What is next

I am starting the first of the fifteen briefs for the demo: a stone room at dusk.

The part I most want to learn is procedural levels. A later brief has me build a
dungeon tool in the editor. I lay out rooms or generate them from a seed, and the tool
derives the graph of rooms and the graph of what unlocks what. Then it checks that the
dungeon can be solved, cannot strand you, has no cheaper bypass, and teaches what a
lock asks for before you reach it.
