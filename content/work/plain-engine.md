---
title: Plain Engine
role: Solo, learning project
period: 2025–now
stack:
  - C++20
  - Clang
  - raylib
  - POSIX
  - Bash
description: "A game engine written by hand on macOS, following Handmade Hero, to learn how an engine works from the platform layer up. In progress."
order: 4
links:
  - label: Source on GitHub
    href: https://github.com/JorchRL/plain-engine
team: Solo
figure:
  src: /work/plain-engine/boundary.svg
  alt: "A diagram of Plain Engine's boundary. At the top, the game: a shared library loaded at run time, rebuilt on save and reloaded while running with its state kept. It talks to the engine through a C ABI. In the middle, the platform layer, an executable that owns main, the loop and the reload by file identity. At the bottom, what the platform owns: the memory (one mmap block holding the game's state), the backbuffer the game writes pixels into, and raylib for the window, input and GL context."
  width: 1200
  height: 630
  caption: "A diagram, not a screenshot. The game is a library the platform layer loads and reloads; the platform owns the memory, the pixels and the window."
---

Plain Engine is a game engine and a game I am writing by hand, to learn, not to ship.
It follows Casey Muratori's Handmade Hero, with two changes: macOS and POSIX instead of
Win32, and raylib only for the window, input polling and the GL context. The loop,
timing, memory, assets and gameplay are written by hand. It is in progress.

I write every line that compiles. An AI model writes a short brief for each milestone
and leaves scaffold comments in the source; I type the code, build and run after every
step, and it reviews my diff for bugs that change behaviour. The build is a hand-written
script with strict warnings on, and a compiler warning counts as a bug.

## What works today

| Part | Status | Since |
| --- | --- | --- |
| A hand-written build script, every warning on, a watcher that rebuilds on save | Works | 2026-10-31 |
| Memory: one block from `mmap`, owned by the platform | Works | 2026-10-31 |
| The game as a shared library, reloaded while it runs, keeping its state | Works | 2026-10-31 |
| A broken build keeps the old code running; a missing library is waited for | Works | 2026-10-31 |
| A backbuffer the engine owns, written by the game, drawn through raylib | Works | 2026-10-31 |
| Input: keyboard and gamepad, this frame beside the last | Next: brief written | |
| Looped editing: record input and replay it while the code reloads | Planned | |
| Time: a real clock and a held frame rate | Planned | |
| Sound | Planned | |
| Platform services: file I/O for the game, asserts, debug builds | Planned | |

**Hardware target.** One machine, the one I write it on: a Mac with Apple silicon
(arm64), macOS 15.6, Apple Clang 17. Nothing else is built or tested. There is no frame
budget yet. The loop uses a fixed step of 1/60 s and sleeps 16 ms a frame, so the
game's clock runs slower than a real one; a real clock is milestone 4.

## The hardest part so far: reloading code without losing the game

The engine is an executable. The game is a shared library the engine loads at runtime
through a C ABI. When I save a change, the game reloads while it runs and keeps its
state. Three things make that work.

1. **The platform owns the memory.** The engine reserves one block with `mmap` and
   hands the game a pointer to it. The game keeps its state there, because a global in
   the library does not survive a reload.
2. **One signature, defined once.** An early version cast the loaded symbol to a
   function type by hand. With every warning on, the compiler said nothing, and the
   program crashed: the cast lied about the function's signature. Now one macro defines
   the signature, and both sides use it.
3. **Reload by file identity.** Handmade Hero copies the DLL before loading it, because
   Windows locks a loaded DLL. macOS does not, and here the copy does harm: `cp`
   rewrites the same file in place, so the loader hands back the image it already has,
   with the old code. Apple's linker writes a new file and renames it into place, so
   loading the same path again gets the new code. The rule I took from it: port the
   reason, not the workaround.

The checks pass. State survives a reload, a broken build keeps the old code running,
and the engine waits when the library is missing. A watcher in the build script
rebuilds on save. When I added a field before an existing one, that field reset across
the reload, which shows that the memory layout is the contract between the two sides.

## Pixels

The engine owns a backbuffer. The game writes pixels into it, and the engine draws it
through raylib each frame. The game draws a gradient, and a colour change shows up live
across a reload. The game never includes raylib: that is the boundary.

## Next

Input: keyboard and gamepad, with the previous frame kept beside the current one. Then
Handmade Hero's looped editing: snapshot the game's memory, record input, and loop it
while the code reloads. After that come time, sound and platform services.
