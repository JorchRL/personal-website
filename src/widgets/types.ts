// What a widget is: a folder in src/widgets/<slug>/ whose index.tsx exports
// `manifest` and `Face`, one block of the home document. The registry lists
// them.

import type { ReactNode } from "react";

export type WidgetSize = "s" | "m" | "wide" | "full";

export type WidgetManifest = {
  /** The folder name. */
  slug: string;
  title: string;
  /** One sentence on what the widget shows. */
  description: string;
  /**
   * Its width in the home document from 1100 px (12 columns):
   * full = all 12 (a band); wide = 7; m = 5; s = 4. Under 1100 px every
   * widget takes the full width. The document shows widgets in `order` at
   * every width (nothing is reordered with CSS), so keyboard focus follows
   * what is on screen.
   */
  size: WidgetSize;
  /** Its place in the home document, ascending. Unique. It is also the order on a phone and the focus order. */
  order: number;
  /**
   * A numbered section of the home document, under this anchor (the
   * section's id). Sections are numbered 01, 02 … in order, unless they carry
   * their own `mark` (a figure: "Fig. 1").
   */
  section?: { id: string; mark?: string };
};

/** What the home document hands a widget's face: its section number ("03", or its mark). */
export type FaceProps = { no?: string };

export type WidgetModule = {
  manifest: WidgetManifest;
  /**
   * The face, rendered at build time on the server: all a visitor without
   * JavaScript (or an agent) sees, so every text and link the widget has is here.
   */
  Face: (props: FaceProps) => ReactNode;
};
