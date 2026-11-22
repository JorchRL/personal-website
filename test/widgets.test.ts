// The home document's widgets (src/widgets/registry.ts) and the pages the
// sitemap lists.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { sections, widgets } from "@/widgets/registry";

const WIDGETS_DIR = path.join(process.cwd(), "src/widgets");

describe("widget registry", () => {
  it("has unique slugs", () => {
    const slugs = widgets.map((w) => w.manifest.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique orders", () => {
    const orders = widgets.map((w) => w.manifest.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("lists exactly the widget folders, each under its own folder name", () => {
    const folders = readdirSync(WIDGETS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(path.join(WIDGETS_DIR, d.name, "index.tsx")))
      .map((d) => d.name)
      .sort();
    expect(widgets.map((w) => w.manifest.slug).sort()).toEqual(folders);
  });

  it("never reorders cells with CSS, so focus follows what is on screen", () => {
    // The grid shows widgets in DOM order at every width; an `order` property
    // in the stylesheet would move a cell away from its place in the tab order.
    const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).not.toMatch(/(^|[\s;{])order\s*:/m);
  });

  it("puts the home document's widgets in the order a phone shows them", () => {
    expect(widgets.map((w) => w.manifest.slug)).toEqual(["intro", "showcase", "doors", "contact"]);
  });

  it("numbers the home document's sections 01 to 03", () => {
    expect(sections().map((s) => `${s.no} ${s.title}`)).toEqual(["01 Showcase", "02 Two doors", "03 Contact"]);
    const ids = sections().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every widget a title and a description", () => {
    for (const { manifest } of widgets) {
      expect(manifest.title.trim(), manifest.slug).not.toBe("");
      expect(manifest.description.trim(), manifest.slug).not.toBe("");
    }
  });

  it("lists only the site's pages in the sitemap", () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    for (const p of paths) expect(p).toMatch(/^\/(work(\/[a-z0-9-]+)?|blog(\/[a-z0-9-]+)?|about|cv|work-with-me)?$/);
    expect(paths).toEqual(expect.arrayContaining(["/", "/work", "/blog", "/about", "/cv", "/work-with-me"]));
  });
});
