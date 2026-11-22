// The home page's showcase (content/showcase.ts): every item names something
// that exists, each slide takes its words from the item's own content, and a
// name that resolves to nothing fails, naming the item.

import { describe, expect, it } from "vitest";
import { showcase } from "@content/showcase";
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
    ]);
    expect(slides.map((s) => s.tab)).toEqual([
      "Whiz.Study",
      "Twinteraction",
      "The Lone Wander",
      "Plain Engine",
    ]);
    expect(slides.map((s) => s.label)).toEqual(["Work", "Work", "Work", "Work"]);
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

  it("fails on an item that names nothing, naming the item", () => {
    expect(() => resolveShowcase([{ kind: "work", slug: "no-such-work" }])).toThrow(
      /content\/showcase\.ts, item 1: no work page "no-such-work"/,
    );
    expect(() => resolveShowcase([{ kind: "post", slug: "nope" }])).toThrow(/item 1: no post "nope"/);
    expect(() => resolveShowcase([{ kind: "now" }, { kind: "now" }])).toThrow(
      /item 2: now is in the showcase twice/,
    );
  });

  it("keeps a description to its first sentences, as written", () => {
    expect(lead("One. Two! Three? Four.")).toBe("One. Two!");
    expect(lead("No full stop")).toBe("No full stop");
  });
});
