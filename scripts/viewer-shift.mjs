// node scripts/viewer-shift.mjs [base-url] [route] [--sweep] [--shots <dir>]: the close-up viewer's
// movement check (scripts/lib/viewer-shift.mjs) at 1440 and 390 px, or at many widths with --sweep;
// --shots writes the toolbar in each mode to <dir>/toolbar2-<width>-<mode>.png.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { measureViewerShift, shiftProblems, VIEWER_BROWSER_ARGS } from "./lib/viewer-shift.mjs";

const argv = process.argv.slice(2);
const shotsAt = argv.indexOf("--shots");
const shots = shotsAt >= 0 ? argv[shotsAt + 1] : null;
const args = argv.filter((a, i) => !a.startsWith("--") && (shotsAt < 0 || i !== shotsAt + 1));
const base = (args[0] ?? "http://localhost:3000").replace(/\/$/, "");
const route = args[1] ?? "/art/majoras-mask";
if (shots) mkdirSync(shots, { recursive: true });
const browser = await chromium.launch({ args: VIEWER_BROWSER_ARGS });
let bad = 0;
const widths = argv.includes("--sweep") ? [1920, 1440, 1366, 1280, 1180, 1100, 1024, 1000, 900, 800, 768, 700, 600, 520, 480, 430, 390, 375, 360, 320] : [1440, 390];
for (const width of widths) {
  const shoot = shots
    ? async (page, mode) => {
        // The toolbar and the top of the painting under it (where folded controls open).
        const box = await page.locator(".inspect").boundingBox();
        const y = Math.max(0, box.y - 24);
        await page.screenshot({ path: `${shots}/toolbar2-${width}-${mode}.png`, clip: { x: 0, y, width, height: Math.min(box.height + 300, 900 - y) } });
      }
    : undefined;
  const r = await measureViewerShift(browser, base + route, width, { shoot });
  console.log(`\n${width} px  GPU: ${r.gpu}  layout-shift ${r.score.toFixed(4)}  moved (px): ${Object.entries(r.moved).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(", ")}`);
  for (const s of r.states)
    console.log(`  ${s.name.padEnd(12)} toolbar y ${s.toolbar.y.toFixed(1)} h ${s.toolbar.h.toFixed(1)}  painting y ${s.painting.y.toFixed(1)} w ${s.painting.w.toFixed(1)}  facts y ${s.facts?.y.toFixed(1)}  well ${s.wellColour}  spill ${s.spill.toFixed(1)}`);
  for (const p of shiftProblems(r)) {
    console.log("  FAIL " + p);
    bad++;
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
