// What Jorge paints with, written once. A painting (content/art/<slug>.md)
// names its paper and, if he wants, its paints by the keys below; a key that
// is not here fails the build, naming the file. /art says once what he
// paints with, from this list.

export const papers = {
  baohong: "Baohong",
  arches: "Arches",
} as const;

/** What every paper above is made of. */
export const paperFibre = "100% cotton";

// Both papers are the same weight and surface (Jorge's paper, 2026-11-23; he
// calls the surface coarse). Which Baohong range it is, he does not know, so
// nothing here depends on it.
/** The weight of every paper above. */
export const paperWeight = "300 gsm (140 lb)";
/** The surface of every paper above. */
export const paperSurface = "cold press";

/** His usual sheet, in centimetres: a painting without its own `size` is this one. */
export const usualSheet = { width: 27, height: 21.5 } as const;

// Names as they read mid-sentence; a list starts each with a capital. Each
// paint's pigments by their Colour Index codes (PB29 is pigment blue 29), as
// a painting page lists them: "Ultramarine blue (PB29)". What each pigment is,
// and the makers' ratings for each paint, are in content/pigments.ts.
// Source for phthalo blue (the green shade, PB15:3), New Gamboge (PY97 + PY110)
// and Payne's grey (PB29 + PBk9): Jorge's tube labels, 2026-11-23.
export const paints = {
  "ultramarine-blue": { name: "ultramarine blue", maker: "Daniel Smith", medium: "watercolour", pigments: ["PB29"] },
  "phthalo-blue": { name: "phthalo blue", maker: "Daniel Smith", medium: "watercolour", pigments: ["PB15:3"] },
  "alizarin-crimson": { name: "alizarin crimson", maker: "Daniel Smith", medium: "watercolour", pigments: ["PR83"] },
  "quinacridone-red": { name: "quinacridone red", maker: "Daniel Smith", medium: "watercolour", pigments: ["PV19"] },
  "hansa-yellow-light": { name: "hansa yellow light", maker: "Daniel Smith", medium: "watercolour", pigments: ["PY3"] },
  "new-gamboge": { name: "new gamboge", maker: "Daniel Smith", medium: "watercolour", pigments: ["PY97", "PY110"] },
  "buff-titanium": { name: "buff titanium", maker: "Daniel Smith", medium: "watercolour", pigments: ["PW6:1"] },
  "paynes-grey": { name: "Payne's grey", maker: "Daniel Smith", medium: "watercolour", pigments: ["PB29", "PBk9"] },
  "burnt-sienna": { name: "burnt sienna", maker: "Daniel Smith", medium: "watercolour", pigments: ["PBr7"] },
  "white-gouache": { name: "titanium white gouache", maker: "Royal Talens Extra Fine", medium: "gouache", pigments: ["PW6"] },
} as const;

/**
 * A TODO(jorge) shown once beside the codes on a painting's page while the codes
 * above are unconfirmed; "" when they match the tube labels (a maker can change
 * a paint's pigments, and the label is what counts). Confirmed: Jorge's tube
 * labels, 2026-11-23.
 */
export const pigmentsCheck: string = "";

export type PaperKey = keyof typeof papers;
export type PaintKey = keyof typeof paints;
