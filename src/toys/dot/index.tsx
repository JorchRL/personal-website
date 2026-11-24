// A throwaway toy, to build the toys section with (SITE1 to SITE6): a dot
// that bounces in a box. Removed at the end.

import type { FaceProps, ToyManifest } from "../types";

export const manifest: ToyManifest = {
  slug: "dot",
  title: "Dot",
  description: "A dot that bounces in a box: the throwaway toy the toys section was built with.",
};

/** Where the dot starts, as a share of the box: the face draws it there. */
export const START = { x: 0.3, y: 0.4 };

export function Face({ no = "Fig. 1" }: FaceProps) {
  return (
    <figure className="dot-face" aria-label="A dot in a box">
      <svg viewBox="0 0 160 90" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label="A black dot on pale paper, at rest">
        <rect width="160" height="90" fill="var(--paper)" stroke="var(--ink)" vectorEffect="non-scaling-stroke" />
        <circle cx={START.x * 160} cy={START.y * 90} r="4" fill="var(--ink)" />
      </svg>
      <figcaption className="mono">{no} · the dot, at rest</figcaption>
    </figure>
  );
}
