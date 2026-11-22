// The home page's deck: its numbers (deckGeometry.ts), the query its layout and its
// code share, and the home document as the server renders it: every section,
// its text and links in the HTML, the bar as in-page links.

import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { describe, expect, it } from "vitest";
import { DECK_QUERY, activeAt, heightAt } from "@/widgets/deckGeometry";
import { showcase } from "@content/showcase";
import { Grid } from "@/widgets/Grid";
import { resolveShowcase } from "@/widgets/showcase/items";

describe("deck numbers", () => {
  it("marks the section that covers more of the deck", () => {
    expect(activeAt(0, 4)).toBe(0);
    expect(activeAt(0.49, 4)).toBe(0);
    expect(activeAt(0.5, 4)).toBe(1);
    expect(activeAt(2.7, 4)).toBe(3);
    expect(activeAt(-0.2, 4)).toBe(0);
    expect(activeAt(9, 4)).toBe(3);
  });

  it("is as tall as the section showing, blending two in a slide", () => {
    const heights = [1100, 600, 400, 300];
    expect(heightAt(heights, 0)).toBe(1100);
    expect(heightAt(heights, 1)).toBe(600);
    expect(heightAt(heights, 0.5)).toBe(850);
    expect(heightAt(heights, 2.25)).toBe(375);
    expect(heightAt(heights, 3)).toBe(300);
    expect(heightAt(heights, 7)).toBe(300);
    expect(heightAt([], 0)).toBe(0);
  });
});

describe("deck query", () => {
  it("is the one the stylesheet lays the deck out under", () => {
    const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain(`@media ${DECK_QUERY} {`);
    // Without JavaScript or narrow: stacked. Reduced motion keeps the deck (no slide).
    expect(DECK_QUERY).toContain("(scripting: enabled)");
    expect(DECK_QUERY).toContain("(min-width: 768px)");
    expect(DECK_QUERY).not.toContain("reduced-motion");
  });
});

/** The home document as the server renders it (the HTML a visitor without JavaScript reads). */
async function homeHtml(): Promise<string> {
  const { prelude } = await prerender(createElement(Grid));
  return new Response(prelude).text();
}

describe("the home document's HTML", () => {
  it("has the showcase's slides, in order, each inside its panel, then Two doors and Contact", async () => {
    const html = await homeHtml();
    const slides = resolveShowcase(showcase);
    let at = html.indexOf('id="showcase"');
    expect(at).toBeGreaterThan(0);
    for (const slide of slides) {
      const panel = html.indexOf(`id="panel-${slide.id}"`);
      const article = html.indexOf(`id="${slide.id}"`, panel);
      expect(panel, slide.id).toBeGreaterThan(at);
      expect(article, slide.id).toBeGreaterThan(panel);
      expect(html).toContain(`id="h-${slide.id}"`);
      if (slide.href) expect(html, slide.id).toContain(`href="${slide.href}"`);
      at = article;
    }
    expect(html.indexOf('id="doors"')).toBeGreaterThan(at);
    expect(html.indexOf('id="contact"')).toBeGreaterThan(html.indexOf('id="doors"'));
    // The old home sections are gone; their addresses land on a slide (#writing
    // and #now only while the showcase has a post or the Now slide).
    const old = ["work", "experience", ...slides.flatMap((s) => s.aliases.filter((a) => a === "writing")), ...slides.filter((s) => s.id === "now").map(() => "now")];
    for (const id of old) {
      expect(html.match(new RegExp(`id="${id}"`, "g"))?.length, id).toBe(1);
    }
    expect(html).not.toContain("fig-1");
  });

  it("prints the bar as in-page links, one per slide, before the slides", async () => {
    const html = await homeHtml();
    const nav = html.slice(html.indexOf('aria-label="Showcase"'), html.indexOf('class="deck-view"'));
    const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const slides = resolveShowcase(showcase);
    expect(hrefs).toEqual(slides.map((s) => `#${s.id}`));
    // Tabs only once the deck is on, in the browser.
    expect(html).not.toMatch(/role="tab(list|panel)?"/);
    expect(nav).toContain('<span class="nm">Twinteraction</span>');
  });

  it("keeps the marks, the tracked links and the first screen in the HTML", async () => {
    const html = await homeHtml();
    // Every TODO left on the page is marked.
    expect(html.match(/TODO\(jorge\)/g)?.length ?? 0).toBe(html.match(/<mark class="todo">TODO\(jorge\)/g)?.length ?? 0);
    expect(html).toContain('data-track="door_hiring"');
    expect(html).toContain('data-track="door_contract"');
    expect(html.match(/data-first-screen/g)?.length).toBeGreaterThanOrEqual(5);
    expect(html.indexOf('class="hero"')).toBeLessThan(html.indexOf('class="deck"'));
  });
});
