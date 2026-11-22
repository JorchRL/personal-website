import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { edgeCut } from "../scripts/lib/edge-clip.mjs";

// pnpm verify (step 7) loads the site's pages at 1920, 2560 and 3440 px wide
// and fails on anything in <main> cut at the screen's edges. These test the
// rule it applies, and that no stylesheet sizes a block in a way that cuts it
// on a wide screen.

describe("edgeCut", () => {
  const sheet = { left: 304, right: 1744, kind: "clip" as const, name: "div.page" };

  it("passes a box inside the screen", () => {
    expect(edgeCut({ left: 0, right: 2048 }, [], 2048)).toBeNull();
    expect(edgeCut({ left: 340, right: 1700 }, [sheet], 2048)).toBeNull();
  });

  it("finds a box past the screen's edge", () => {
    expect(edgeCut({ left: 0, right: 2063 }, [], 2048)).toEqual({ side: "right", px: 15, by: "the screen" });
  });

  it("finds a block wider than the sheet that clips it", () => {
    // A 100vw block on a 2048 px screen, in a 1440 px sheet with overflow-x: clip.
    expect(edgeCut({ left: 0, right: 2048 }, [sheet], 2048)).toEqual({ side: "left", px: 304, by: "div.page" });
    expect(edgeCut({ left: 40, right: 400 }, [sheet], 2048)?.side).toBe("left");
  });

  it("finds a box cut by a box with overflow hidden", () => {
    const stage = { left: 40, right: 1400, kind: "hidden" as const, name: "div.stage" };
    expect(edgeCut({ left: 1300, right: 1460 }, [stage], 1440)).toEqual({ side: "right", px: 60, by: "div.stage" });
  });

  it("leaves out what can be scrolled to, and what is scrolled away", () => {
    expect(edgeCut({ left: 0, right: 3000 }, [{ left: 0, right: 1440, kind: "scroll" }], 1440)).toBeNull();
    const deck = { left: 40, right: 1400, kind: "hidden" as const };
    expect(edgeCut({ left: 1400, right: 2760 }, [deck], 1440)).toBeNull();
  });
});

describe("the sheet's width", () => {
  const css = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = path.join(dir, f);
      return statSync(p).isDirectory() ? css(p) : p.endsWith(".css") ? [p] : [];
    });

  it("never sizes or places a block with vw (it counts a scrollbar and passes the sheet)", () => {
    const bad = css("src").flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) => ({ line, at: `${file}:${i + 1}` }))
        .filter(({ line }) => /^\s*(width|min-width|margin(-inline|-left|-right)?)\s*:[^;]*\b(100|50)vw\b/.test(line))
        .map(({ at, line }) => `${at}: ${line.trim()}`),
    );
    expect(bad).toEqual([]);
  });

  it("does not let a page's sheet out of its width", () => {
    const bad = css("src").flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/\.page:has\([^)]*\)\s*\{[^}]*(max-width:\s*none|overflow-x:\s*visible)/g)].map(
        (m) => `${file}: ${m[0].replace(/\s+/g, " ")}`,
      ),
    );
    expect(bad).toEqual([]);
  });
});
