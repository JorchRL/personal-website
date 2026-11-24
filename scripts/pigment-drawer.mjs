// node scripts/pigment-drawer.mjs [base-url] [--shots <dir>]: /art's swatch drawer moves nothing
// (scripts/lib/pigment-drawer.mjs) at 1440 and 390 px; --shots writes the drawer open to
// <dir>/drawer-<width>.png. Exits 1 on a problem.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { checkDrawer } from "./lib/pigment-drawer.mjs";

const argv = process.argv.slice(2);
const shotsAt = argv.indexOf("--shots");
const shots = shotsAt >= 0 ? argv[shotsAt + 1] : null;
const args = argv.filter((a, i) => !a.startsWith("--") && (shotsAt < 0 || i !== shotsAt + 1));
const base = (args[0] ?? "http://localhost:3000").replace(/\/$/, "");
if (shots) mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const problems = await checkDrawer(browser, base + "/art", { shots });
await browser.close();
for (const p of problems) console.log("  FAIL " + p);
process.exit(problems.length ? 1 : 0);
