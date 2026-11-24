// /art's paints as swatch cards: content/materials.ts (names, makers,
// pigment codes) joined with content/pigments.ts (what
// each pigment is, the makers' ratings, sources). Each card numbers its own
// sources, in the order its facts first cite them, so a fact shows [1], [2]…
// and the card's list links them.

import { readFileSync } from "node:fs";
import path from "node:path";
import { paints, type PaintKey } from "@content/materials";
import {
  paintFacts,
  pigments,
  sources,
  type Fact,
  type Look,
  type PigmentCode,
  type Rating,
  type SourceKey,
} from "@content/pigments";
import { headerSize } from "./image-size";

const FAMILIES: Record<string, string> = {
  PB: "Blue",
  PBk: "Black",
  PBr: "Brown",
  PG: "Green",
  PO: "Orange",
  PR: "Red",
  PV: "Violet",
  PW: "White",
  PY: "Yellow",
};

/** A Colour Index code spelt out: "PB29" is "Pigment Blue 29", "PW6:1" "Pigment White 6:1". */
export function ciName(code: string): string {
  const m = /^(P[A-Z][a-z]?)(\d+(?::\d+)?)$/.exec(code);
  const family = m && FAMILIES[m[1]];
  if (!family) throw new Error(`Not a Colour Index pigment code: ${code}`);
  return `Pigment ${family} ${m[2]}`;
}

/** A fact as a card shows it: its text and its sources' numbers on that card. */
export type Cited = { text: string; refs: number[] };
export type CardSource = { n: number; label: string; url: string };

export type SwatchImage = { src: string; width: number; height: number };

/** What the generated swatch needs, or the scan that replaces it. */
export type SwatchSpec = {
  look: Look;
  granulating: boolean;
  /** How much the paint hides the ink stripe under it: 0 (transparent) to 1. */
  cover: number;
  image?: SwatchImage;
};

export type CardPigment = {
  code: string;
  ciName: string;
  name: string;
  ciNumber?: Cited;
  chemical: Cited;
  formula: Cited;
  kind: Cited;
  history: Cited;
};

export type CardRating = { label: string; level: number | null; of: number; words: string; refs: number[] };

export type PaintCard = {
  kind: "paint";
  key: PaintKey;
  no: string;
  name: string;
  /** "Daniel Smith watercolour" */
  maker: string;
  codes: readonly string[];
  swatch: SwatchSpec;
  pigments: CardPigment[];
  ratings: CardRating[];
  behaviour: Cited;
  note?: Cited;
  check?: string;
  /** His own note on the paint (content/pigments.ts `artistNote`). */
  artistNote?: string;
  sources: CardSource[];
};

/** Numbers a card's sources in the order its facts cite them. */
function citer() {
  const order: SourceKey[] = [];
  const refs = (src: readonly SourceKey[]) =>
    src.map((key) => {
      if (!Object.hasOwn(sources, key)) throw new Error(`Unknown source: ${key}`);
      if (!order.includes(key)) order.push(key);
      return order.indexOf(key) + 1;
    });
  return {
    fact: (fact: Fact): Cited => ({ text: fact.text, refs: refs(fact.src) }),
    rating: (label: string, r: Rating): CardRating => ({ label, level: r.level, of: r.of, words: r.words, refs: refs(r.src) }),
    list: (): CardSource[] => order.map((key, i) => ({ n: i + 1, ...sources[key] })),
  };
}

const COVER = { 4: 0, 3: 0.16, 2: 0.45, 1: 0.88 } as Record<number, number>;

/** A scan under public/, with its size read from the file. */
function swatchImage(src: string | undefined, publicDir: string): SwatchImage | undefined {
  if (!src) return undefined;
  if (!src.startsWith("/art/swatches/")) throw new Error(`A swatch scan lives under /art/swatches/: ${src}`);
  const size = headerSize(readFileSync(path.join(publicDir, src)));
  if (!size) throw new Error(`Cannot read the size of ${src} (PNG, JPEG, GIF or WebP)`);
  return { src, ...size };
}

const capital = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Every paint, in content/materials.ts's order. */
export function getSwatchCards(publicDir = path.join(process.cwd(), "public")): PaintCard[] {
  const keys = Object.keys(paints) as PaintKey[];
  const cards: PaintCard[] = keys.map((key, i) => {
    const paint = paints[key];
    const facts = paintFacts[key];
    const c = citer();
    const codes = paint.pigments as readonly string[];
    const listed = facts.pigments as readonly string[];
    if (codes.join() !== listed.join())
      throw new Error(`${key}: content/pigments.ts lists ${listed.join(", ")}, content/materials.ts ${codes.join(", ")}`);
    const pigs = facts.pigments.map((code: PigmentCode) => {
      const p = pigments[code] as (typeof pigments)[PigmentCode] & { ciNumber?: Fact };
      return {
        code,
        ciName: ciName(code),
        name: p.name,
        ciNumber: p.ciNumber && c.fact(p.ciNumber),
        chemical: c.fact(p.chemical),
        formula: c.fact(p.formula),
        kind: c.fact(p.kind),
        history: c.fact(p.history),
      };
    });
    const ratings = [
      c.rating("Transparency", facts.transparency),
      c.rating("Staining", facts.staining),
      c.rating("Granulation", facts.granulation),
      c.rating("Lightfastness", facts.lightfastness),
    ];
    const behaviour = c.fact(facts.behaviour);
    const withNote = facts as typeof facts & { note?: Fact; check?: string; swatchImage?: string; artistNote?: string };
    const note = withNote.note && c.fact(withNote.note);
    return {
      kind: "paint",
      key,
      no: String(i + 1).padStart(2, "0"),
      name: capital(paint.name),
      maker: `${paint.maker} ${paint.medium}`,
      codes,
      swatch: {
        look: facts.look,
        granulating: facts.granulation.level === 1,
        cover: COVER[facts.transparency.level ?? 4] ?? 0,
        image: swatchImage(withNote.swatchImage, publicDir),
      },
      pigments: pigs,
      ratings,
      behaviour,
      note,
      check: withNote.check || undefined,
      artistNote: withNote.artistNote || undefined,
      sources: c.list(),
    };
  });

  return cards;
}
