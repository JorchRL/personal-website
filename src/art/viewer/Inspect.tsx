"use client";

// The painting's well on its page, and the close-up viewer's toolbar above it,
// under the page head's rule, where it is seen first. The toolbar is one block
// of one fixed height in every mode: on the left the mode, "None · Lamp ·
// Layers" (None, the plain picture, to start); on the right the chosen mode's
// controls, or for None a line on what the others do. Only when a mode other
// than None is chosen does the viewer's code load (./Stage, through import())
// with its files, so the page loads as a page. One effect at a time: each is a
// port of its own prototype, and drawn together they would be neither. On a
// narrow screen the controls fold behind a "Controls" button and open over the
// painting, so the toolbar keeps its height there too. Without JavaScript the
// toolbar is hidden (a <noscript> style on the page) and the picture is all
// there is.

import { useId, useState, type ComponentType, type ReactNode } from "react";
import type { Viewer } from "./maps";
import type { Effect, StageProps } from "./Stage";

export type { Effect };

/** What each effect does, in a line: None's hint, and the folded toolbar's caption. */
const WHAT: Record<Effect, string> = {
  lamp: "Lamp rakes a light over the paper.",
  layers: "Layers splits the painting into depths.",
};

export function Inspect({ viewer, children }: { viewer: Viewer; children?: ReactNode }) {
  // The well and the bar, as state: the viewer draws into the one and puts its controls in the other.
  const [well, setWell] = useState<HTMLDivElement | null>(null);
  const [bar, setBar] = useState<HTMLDivElement | null>(null);
  const [effect, setEffect] = useState<Effect | null>(null);
  const [Stage, setStage] = useState<ComponentType<StageProps> | null>(null);
  const [note, setNote] = useState("");
  // The folded controls (narrow screens only), open over the painting.
  const [open, setOpen] = useState(false);
  const barId = useId();

  const choose = (next: Effect | null) => {
    setNote("");
    if (!next) setOpen(false);
    if (next === effect) return;
    setEffect(next);
    if (next && !Stage)
      import("./Stage").then(
        (m) => setStage(() => m.default),
        () => fail("The viewer could not load."),
      );
  };
  const fail = (reason: string) => {
    setEffect(null);
    setOpen(false);
    setNote(reason);
  };

  const modes: { id: Effect | null; name: string }[] = [
    { id: null, name: "None" },
    { id: "lamp", name: "Lamp" },
    ...(viewer.layers ? [{ id: "layers" as const, name: "Layers" }] : []),
  ];
  const live = !!(effect && Stage);
  return (
    <div className="inspect-root">
      <div className="inspect">
        <div className="inspect-in">
          <div className="inspect-mode" role="group" aria-label="Close-up">
            <span className="label">Close-up</span>
            <span className="seg">
              {modes.map((m) => (
                <button key={m.name} type="button" aria-pressed={effect === m.id} onClick={() => choose(m.id)}>
                  {m.name}
                </button>
              ))}
            </span>
          </div>
          <div className="inspect-tools">
            {/* Until a mode's controls are here: what the modes do, the loading line, or why it failed. */}
            {!live && (
              <p className="inspect-intro mono" role="status">
                {note ? (
                  <span className="inspect-fail">{note}</span>
                ) : effect ? (
                  <span>Loading the viewer…</span>
                ) : (
                  <>
                    <span>{WHAT.lamp}</span>
                    <span>{viewer.layers ? WHAT.layers : "None shows the picture as it is."}</span>
                  </>
                )}
              </p>
            )}
            {live && (
              <p className="inspect-fold mono">
                <button type="button" className="inspect-more" aria-expanded={open} aria-controls={barId} onClick={() => setOpen(!open)}>
                  Controls
                </button>
                <span>{WHAT[effect!]}</span>
              </p>
            )}
            <div className="inspect-bar" id={barId} ref={setBar} data-open={open || undefined} />
          </div>
        </div>
        {effect && Stage && well && bar && <Stage key={effect} effect={effect} viewer={viewer} well={well} bar={bar} onFail={fail} />}
      </div>
      <div className="well" ref={setWell}>
        {children}
      </div>
    </div>
  );
}
