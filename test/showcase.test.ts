// The home page's showcase (content/showcase.ts): every item names something
// that exists, each slide takes its words from the item's own content, and a
// name that resolves to nothing fails, naming the item.

import { describe, expect, it } from "vitest";
import { gallery } from "@content/gallery";
import { showcase } from "@content/showcase";
import { getAllArt } from "@/content/art";
import { getNowParts } from "@/content/pages";
import { getPost } from "@/content/posts";
import { getWork } from "@/content/work";
import { lead, resolveShowcase } from "@/widgets/showcase/items";

const WEBGL = "webgl-or-how-to-draw-a-single-point-the-hard-way";

describe("the showcase", () => {
  const slides = resolveShowcase(showcase);

  it("resolves every item, in order, each with its own address", () => {
    expect(slides.map((s) => s.id)).toEqual([
      "work-whiz-study",
      "work-twinteraction",
      "work-the-lone-wander",
      "work-plain-engine",
      "art",
    ]);
    expect(slides.map((s) => s.tab)).toEqual([
      "Whiz.Study",
      "Twinteraction",
      "The Lone Wander",
      "Plain Engine",
      "Watercolours",
    ]);
    expect(slides.map((s) => s.label)).toEqual(["Work", "Work", "Work", "Work", "Art"]);
  });

  it("gives the old home sections' addresses to the first slide of their kind", () => {
    const owner = (alias: string) => slides.find((s) => s.aliases.includes(alias))?.id;
    expect(owner("work")).toBe("work-whiz-study");
    expect(owner("experience")).toBe("work-whiz-study");
    expect(owner("writing")).toBeUndefined();
    const [, writing] = resolveShowcase([{ kind: "work", slug: "whiz-study" }, { kind: "post", slug: WEBGL }]);
    expect(writing.aliases).toEqual(["writing"]);
  });

  it("takes every word from the item's own content", () => {
    const wander = getWork("the-lone-wander")!;
    const slide = slides.find((s) => s.id === "work-the-lone-wander")!;
    expect(slide.title).toBe(wander.title);
    expect(slide.facts).toEqual([wander.role, wander.period]);
    expect(wander.description.startsWith(slide.text!)).toBe(true);
    expect(slide.href).toBe("/work/the-lone-wander");
    // Its figure is the work page's own: a picture with its alt text.
    const figure = wander.figure as { src: string; alt: string; width: number; height: number };
    expect(slide.figure).toEqual({ type: "image", src: figure.src, width: figure.width, height: figure.height, alt: figure.alt });

    // The post and Now kinds, which the showcase can show again with one line each.
    const [writing, now] = resolveShowcase([{ kind: "post", slug: WEBGL, tab: "WebGL post" }, { kind: "now" }]);
    const post = getPost(WEBGL)!;
    expect(writing.tab).toBe("WebGL post");
    expect(writing.title).toBe(post.title);
    expect(writing.facts[1]).toBe(`${post.readingMinutes} min`);
    expect(post.description.startsWith(writing.text!)).toBe(true);

    expect(now.title).toBe(getNowParts().dateline.replace(/\.$/, ""));
    expect(now.figure).toEqual({ type: "now", body: getNowParts().body });
  });

  it("shows the newest paintings on the art slide, each linked to its page, and links the slide to /art", () => {
    const art = getAllArt();
    const slide = slides.find((s) => s.id === "art")!;
    expect(slide.title).toBe(gallery.name);
    expect(slide.text).toBe(gallery.lead);
    expect(slide.href).toBe("/art");
    expect(slide.facts[0]).toBe(`${art.length} paintings`);
    // Without `slugs`, the newest three.
    const [newest] = resolveShowcase([{ kind: "art" }]);
    expect(newest.figure).toEqual({
      type: "paintings",
      paintings: art.slice(0, 3).map((p, i) => ({
        src: p.image,
        width: p.pixels.width,
        height: p.pixels.height,
        alt: p.alt,
        no: `4.${i + 1}`,
        href: `/art/${p.slug}`,
      })),
    });

    // Or the three or four it names, in that order, numbered as on /art.
    const named = art.slice(0, 4).reverse();
    const [chosen] = resolveShowcase([{ kind: "art", slugs: named.map((p) => p.slug) }]);
    if (chosen.figure.type !== "paintings") throw new Error("not the art slide");
    expect(chosen.figure.paintings.map((p) => p.href)).toEqual(named.map((p) => `/art/${p.slug}`));
    expect(chosen.figure.paintings[0].no).toBe(`4.${art.indexOf(named[0]) + 1}`);
  });

  it("fails on an item that names nothing, naming the item", () => {
    expect(() => resolveShowcase([{ kind: "work", slug: "no-such-work" }])).toThrow(
      /content\/showcase\.ts, item 1: no work page "no-such-work"/,
    );
    expect(() => resolveShowcase([{ kind: "post", slug: "nope" }])).toThrow(/item 1: no post "nope"/);
    expect(() => resolveShowcase([{ kind: "art", slugs: ["nope", "x", "y"] }])).toThrow(/item 1: no painting "nope"/);
    const two = getAllArt().slice(0, 2).map((p) => p.slug);
    expect(() => resolveShowcase([{ kind: "art", slugs: two }])).toThrow(/item 1: the art slide shows three or four paintings, not 2/);
    expect(() => resolveShowcase([{ kind: "now" }, { kind: "now" }])).toThrow(
      /item 2: now is in the showcase twice/,
    );
  });

  it("keeps a description to its first sentences, as written", () => {
    expect(lead("One. Two! Three? Four.")).toBe("One. Two!");
    expect(lead("No full stop")).toBe("No full stop");
  });
});
