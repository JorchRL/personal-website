// /art's paints (content/pigments.ts, src/content/pigments.ts,
// src/art/pigments/): every paint has its pigment facts and ratings, every fact
// names a source that exists, and the chart's HTML holds every swatch's name,
// codes and sheet, so it all reads with JavaScript off.

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { paints } from "@content/materials";
import { paintFacts, pigments, sources } from "@content/pigments";
import { ciName, getSwatchCards } from "@/content/pigments";
import { PaintsAndPaper } from "@/art/pigments/PaintsAndPaper";
import { PaintSwatch } from "@/art/pigments/Swatch";

/** Every object in `value` that states a fact (`text`) or a rating (`words`), with where it was found. */
function factsIn(value: unknown, at: string, out: { at: string; fact: Record<string, unknown> }[] = []) {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === "string" || typeof obj.words === "string") out.push({ at, fact: obj });
    else for (const [k, v] of Object.entries(obj)) factsIn(v, `${at}.${k}`, out);
  }
  return out;
}

const allFacts = [...factsIn(pigments, "pigments"), ...factsIn(paintFacts, "paintFacts")];

describe("content/pigments.ts", () => {
  it("has the facts and ratings of every paint in content/materials.ts, with the same pigments", () => {
    expect(Object.keys(paintFacts).sort()).toEqual(Object.keys(paints).sort());
    for (const [key, paint] of Object.entries(paints)) {
      const facts = paintFacts[key as keyof typeof paintFacts];
      expect([...facts.pigments], key).toEqual([...paint.pigments]);
      for (const field of ["transparency", "staining", "granulation", "lightfastness", "behaviour", "look"] as const)
        expect(facts[field], `${key}.${field}`).toBeTruthy();
      expect(facts.behaviour.text.length, key).toBeGreaterThan(20);
      for (const tone of Object.values(facts.look)) expect(tone, key).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("describes every pigment a paint uses: chemistry, formula, class and history", () => {
    for (const paint of Object.values(paints))
      for (const code of paint.pigments) {
        const p = pigments[code as keyof typeof pigments];
        expect(p, code).toBeDefined();
        for (const field of ["chemical", "formula", "kind", "history"] as const) expect(p[field].text.length, `${code}.${field}`).toBeGreaterThan(1);
        expect(() => ciName(code)).not.toThrow();
      }
  });

  it("names a known source for every fact and rating", () => {
    expect(allFacts.length).toBeGreaterThan(80);
    for (const { at, fact } of allFacts) {
      const src = fact.src as string[];
      expect(Array.isArray(src) && src.length > 0, `${at} has no source`).toBe(true);
      for (const key of src) expect(Object.keys(sources), `${at}: unknown source ${key}`).toContain(key);
    }
  });

  it("links every source over https, and uses each one", () => {
    const used = new Set(allFacts.flatMap(({ fact }) => fact.src as string[]));
    for (const [key, s] of Object.entries(sources)) {
      expect(s.url, key).toMatch(/^https:\/\//);
      expect(used.has(key), `${key} is cited by no fact`).toBe(true);
    }
  });

  it("keeps a missing check as a TODO(jorge), never a guess", () => {
    for (const [key, facts] of Object.entries(paintFacts)) {
      const check = (facts as { check?: string }).check;
      if (check) expect(check, key).toMatch(/^TODO\(jorge\): /);
    }
  });
});

describe("the swatch cards", () => {
  const cards = getSwatchCards();

  it("are the paints, in order", () => {
    expect(cards.map((c) => c.key)).toEqual(Object.keys(paints));
    expect(cards.map((c) => c.no)).toEqual(cards.map((_, i) => String(i + 1).padStart(2, "0")));
  });

  it("number each card's sources from 1, and every fact cites one of them", () => {
    for (const card of cards) {
      expect(card.sources.map((s) => s.n)).toEqual(card.sources.map((_, i) => i + 1));
      for (const { at, fact } of factsIn(card, card.key)) {
        if (!("refs" in fact)) continue;
        const refs = fact.refs as number[];
        expect(refs.length, at).toBeGreaterThan(0);
        for (const n of refs) expect(n >= 1 && n <= card.sources.length, at).toBe(true);
      }
    }
  });

  it("spell out Colour Index codes", () => {
    expect(ciName("PB29")).toBe("Pigment Blue 29");
    expect(ciName("PW6:1")).toBe("Pigment White 6:1");
    expect(ciName("PBk9")).toBe("Pigment Black 9");
    expect(ciName("PBr7")).toBe("Pigment Brown 7");
    expect(() => ciName("XYZ")).toThrow();
  });
});

describe("the chart's HTML", () => {
  const html = renderToStaticMarkup(createElement(PaintsAndPaper));
  const cards = getSwatchCards();

  it("holds every swatch as a <details>, with its name, codes and sheet", () => {
    expect(html.match(/<details class="pig-item"/g)).toHaveLength(cards.length);
    for (const card of cards) {
      expect(html).toContain(`id="pig-${card.key}"`);
      expect(html).toContain(card.name.replaceAll("'", "&#x27;"));
      for (const code of card.codes) expect(html).toContain(code);
      for (const s of card.sources) expect(html).toContain(`href="${s.url.replaceAll("&", "&amp;")}"`);
    }
  });

  it("draws each generated swatch in SVG, ink stripe included", () => {
    expect(html.match(/<svg/g)!.length).toBeGreaterThanOrEqual(cards.length * 2);
    expect(html).toContain('class="pig-stripe"');
  });

  it("shows his own note on a paint's sheet only where he wrote one", () => {
    const noted = cards.filter((c) => c.artistNote);
    expect(noted.map((c) => c.key)).toEqual(["buff-titanium"]);
    expect(html.match(/From my painting:/g)).toHaveLength(noted.length);
    expect(html).toContain("Acts like white gouache without much of the chalkiness.");
  });

  it("shows a scanned swatch instead of the generated one when there is one", () => {
    const spec = { look: { masstone: "#1d2477", mid: "#3a49b0", wash: "#b5bfea" }, granulating: true, cover: 0 };
    const drawn = renderToStaticMarkup(createElement(PaintSwatch, { id: "t", spec }));
    const scanned = renderToStaticMarkup(
      createElement(PaintSwatch, { id: "t", spec: { ...spec, image: { src: "/art/swatches/t.jpg", width: 600, height: 750 } } }),
    );
    expect(drawn).toContain("<svg");
    expect(scanned).not.toContain("<svg");
    expect(scanned).toContain('src="/art/swatches/t.jpg"');
    expect(scanned).toContain('width="600"');
  });

  it("draws a sheet's large swatch as a copy of its chip, written once", () => {
    for (const card of cards.filter((c) => !c.swatch.image)) {
      expect(html).toContain(`<svg id="pig-${card.key}-chip"`);
      expect(html).toContain(`<use href="#pig-${card.key}-chip"`);
    }
    expect(html.match(/<feTurbulence/g)!.length).toBeLessThanOrEqual(cards.length * 4);
  });
});
