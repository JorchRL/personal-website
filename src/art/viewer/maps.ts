// The close-up viewer's files for one painting, as the page hands them over:
// what public/art/<slug>/viewer.json says (src/content/viewer.ts reads and
// checks it at build time), and where each file is. No Node or zod here: the
// browser loads this.

export type Size = { width: number; height: number };

export type Viewer = {
  version: 2;
  /** How the paper's relief is made: estimated from the scan, in the browser (the Lamp). */
  relief: "estimated";
  /** The sheet's size in millimetres, so the lamp's height and the paper's grain are to scale. */
  sheetMM: [number, number];
  /** The scan for the Lamp, by width, smallest first. */
  lamp: Size[];
  /** The Layers, when the painting was cut into them. */
  layers?: {
    /** The cards' sizes, by width, smallest first. */
    sizes: Size[];
    /** The depth map's size. */
    height: Size;
    /** The cards, back to front, each at a depth from 0 (the back of the box) to 1 (the paper's plane). */
    cards: { name: string; depth: number }[];
    /** The card in focus when the Layers start. */
    focus: number;
  };
  /** The folder's URL: /art/<slug>. */
  base: string;
};

/** The Lamp's scan at one width. */
export const lampFile = (v: Viewer, width: number) => `${v.base}/lamp/${width}.webp`;

/** The Layers' files at one width of the cards. */
export function layerFiles(v: Viewer, width: number) {
  const dir = `${v.base}/layers/${width}`;
  return {
    cards: (v.layers?.cards ?? []).map((_, k) => `${dir}/L${k}.webp`),
    paper: `${dir}/paper.webp`,
    colour: `${dir}/colour.webp`,
    height: `${v.base}/layers/height.webp`,
  };
}

/** Every file the viewer may load. */
export function allFiles(v: Viewer): string[] {
  const lamp = v.lamp.map((s) => lampFile(v, s.width));
  const layers = (v.layers?.sizes ?? []).flatMap((s) => {
    const f = layerFiles(v, s.width);
    return [...f.cards, f.paper, f.colour, f.height];
  });
  return [...new Set([...lamp, ...layers])];
}

/** The smallest size whose longer side is at least `want`, else the largest (so a portrait painting is not loaded twice as big). */
export function pick(sizes: Size[], want: number): Size {
  return sizes.find((s) => Math.max(s.width, s.height) >= want) ?? sizes[sizes.length - 1];
}
