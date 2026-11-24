// The close-up viewer on a painting's page (src/art/viewer/): the painting
// shows as a picture with its switches off, and the viewer's code (the
// Lamp's and the Layers' shaders and engines) comes only through import(),
// when a visitor turns an effect on.

import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Inspect } from "@/art/viewer/Inspect";
import { getAllArt } from "@/content/art";

const root = process.cwd();
const src = (f: string) => readFileSync(path.join(root, "src/art/viewer", f), "utf8");
/** The modules a file imports for real (type-only imports are erased). */
const staticImports = (code: string) =>
  [...code.matchAll(/^import\s+(?!type\b)[^;]*?from\s+"([^"]+)"/gm)].map((m) => m[1]);

describe("the close-up viewer", () => {
  const art = getAllArt();
  const majora = art.find((p) => p.viewer?.layers);

  it("serves the picture with the mode at None, Lamp and Layers off, and no canvas", () => {
    expect(majora, "a painting with layers").toBeDefined();
    const html = renderToStaticMarkup(createElement(Inspect, { viewer: majora!.viewer! }, createElement("img", { alt: "x" })));
    expect(html).toMatch(/aria-pressed="true"[^>]*>None</);
    expect(html).toMatch(/aria-pressed="false"[^>]*>Lamp</);
    expect(html).toMatch(/aria-pressed="false"[^>]*>Layers</);
    expect(html).not.toContain("<canvas");
    const lampOnly = art.find((p) => p.viewer && !p.viewer.layers);
    if (lampOnly) expect(renderToStaticMarkup(createElement(Inspect, { viewer: lampOnly.viewer! }, null))).not.toContain(">Layers<");
  });

  it("loads the viewer's code only through import(), when an effect is turned on", () => {
    const inspect = src("Inspect.tsx");
    expect(staticImports(inspect).filter((m) => m.startsWith("."))).toEqual([]);
    expect(inspect).toContain('import("./Stage")');
    const stage = src("Stage.tsx");
    expect(staticImports(stage).filter((m) => /lamp|diorama|gl/.test(m))).toEqual([]);
    expect(stage).toContain('import("./lamp/lamp")');
    expect(stage).toContain('import("./diorama/diorama")');
    const page = readFileSync(path.join(root, "src/app/art/[slug]/page.tsx"), "utf8");
    expect(staticImports(page).filter((m) => m.startsWith("@/art/viewer/") && !m.endsWith("/Inspect"))).toEqual([]);
  });
});
