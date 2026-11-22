// pnpm cv:pdf: print /cv to public/cv.pdf, so the PDF is made from the same
// content as the page and never drifts from it.
//
//   pnpm build && pnpm cv:pdf                 starts `next start` on a spare port
//   pnpm cv:pdf http://localhost:3000         or prints from a server you run
//
// The page's print styles (src/app/cv/cv.css) set it in one column, black on
// white, in Arial, with the contact details in the body and no running header
// or footer. The PDF is real text (Chromium embeds the fonts), Letter size.
// Run it on a Mac: the print asks for Arial, which macOS has.
// test/pages.test.ts fails while the PDF is older than the content: the page
// prints a hash of the CV ("rev. …") and the test reads it back.
// Once: pnpm exec playwright install chromium

import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import { createServer } from "node:net";
import { chromium } from "playwright";

const OUT = "public/cv.pdf";
const LIMIT = 2.5 * 1024 * 1024;

function sparePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitFor(url, ms = 30_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`${url} did not answer in ${ms / 1000} s (is there a build? run pnpm build first)`);
}

let server;
let base = process.argv[2]?.replace(/\/$/, "");
if (!base) {
  const port = await sparePort();
  base = `http://localhost:${port}`;
  server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], { stdio: "ignore" });
}

try {
  await waitFor(`${base}/cv`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${base}/cv`, { waitUntil: "networkidle" });
  // The PDF travels on its own: every link in it points at the live site,
  // whichever server printed it. The site's address is the page's canonical
  // URL (from content/site.ts), so a local or preview origin never gets in.
  const site = await page.evaluate(() => {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (!canonical || !/^https:\/\//.test(canonical)) throw new Error("/cv has no absolute canonical URL");
    const origin = new URL(canonical).origin;
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      if (/^(mailto:|https?:\/\/(?!localhost|127\.0\.0\.1))/.test(href)) continue;
      const url = new URL(href, location.href);
      a.setAttribute("href", `${origin}${url.pathname}${url.search}${url.hash}`);
    }
    return origin;
  });
  console.log(`links made absolute to ${site}`);
  await page.emulateMedia({ media: "print" });
  // The print's own faces load only once print styles apply.
  await page.evaluate(async () => {
    await document.fonts.load('800 24pt "Schibsted Print"');
    await document.fonts.ready;
  });
  await page.pdf({
    path: OUT,
    format: "Letter",
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    tagged: true,
  });
  await browser.close();
  const { size } = statSync(OUT);
  console.log(`${OUT}: ${(size / 1024).toFixed(0)} KB, from ${base}/cv`);
  if (size > LIMIT) {
    console.error(`${OUT} is over 2.5 MB: applicant tracking systems may refuse it`);
    process.exitCode = 1;
  }
} finally {
  server?.kill();
}
