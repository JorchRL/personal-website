// pnpm cv:pdf: public/cv.pdf, typeset with LaTeX from the same object as /cv
// (getCv(), src/content/cv.ts), so the PDF never drifts from the page.
//
//   pnpm cv:pdf            writes public/cv.pdf
//   pnpm cv:pdf --tex      also keeps the generated LaTeX (in a temp folder)
//                          and prints its path
//
// It needs Tectonic, a self-contained LaTeX engine (once: brew install tectonic;
// its first run downloads the packages it uses). It is a local step only: the
// site's build never runs it, so commit public/cv.pdf with every change to the
// CV's content (content/cv.ts, a work page's frontmatter, site.ts, hire.ts).
// The layout is in scripts/lib/cv-tex.mjs. test/pages.test.ts fails while the
// PDF is older than the content: the PDF prints a hash of the CV ("rev. …").

import "./lib/ts-paths.mjs";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { bulletsOutsideWindow, BULLET_WINDOW, cvTex } from "./lib/cv-tex.mjs";

const { getCv } = await import("../src/content/cv.ts");
const { site } = await import("../content/site.ts");
const { pdfPageCount } = await import("../test/pdf-text.ts");

const OUT = "public/cv.pdf";
const LIMIT = 2.5 * 1024 * 1024;
const keepTex = process.argv.includes("--tex");

try {
  execFileSync("tectonic", ["--version"], { stdio: "ignore" });
} catch {
  console.error("pnpm cv:pdf needs Tectonic: brew install tectonic");
  process.exit(1);
}

const cv = getCv();
const dir = mkdtempSync(path.join(tmpdir(), "cv-tex-"));
const tex = path.join(dir, "cv.tex");
writeFileSync(tex, cvTex(cv, site.url));

try {
  execFileSync("tectonic", ["--chatter", "minimal", "--outdir", dir, tex], { stdio: "inherit" });
  copyFileSync(path.join(dir, "cv.pdf"), OUT);
} finally {
  if (keepTex) console.log(`LaTeX kept at ${tex}`);
  else rmSync(dir, { recursive: true, force: true });
}

const pdf = readFileSync(OUT);
const pages = pdfPageCount(pdf);
const { size } = statSync(OUT);
console.log(`${OUT}: ${pages} page${pages === 1 ? "" : "s"}, ${(size / 1024).toFixed(0)} KB, rev. ${cv.rev}`);

for (const b of bulletsOutsideWindow(cv)) {
  const side = b.length > BULLET_WINDOW.max ? "long" : "short";
  console.warn(`  ${side} bullet (${b.length} characters, best ${BULLET_WINDOW.min}–${BULLET_WINDOW.max}), ${b.entry}: ${b.text.replace(/\*\*/g, "").slice(0, 60)}…`);
}
if (pages !== 1) console.warn(`${OUT} has ${pages} pages: the CV is meant to fit on one`);
if (size > LIMIT) {
  console.error(`${OUT} is over 2.5 MB: applicant tracking systems may refuse it`);
  process.exitCode = 1;
}
