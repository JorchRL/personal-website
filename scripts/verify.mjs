// pnpm verify: the release checks on the built site.
//
//   pnpm build && pnpm start          (in another terminal)
//   pnpm exec playwright install chromium   (once)
//   pnpm verify [http://localhost:3000]
//
// 1. Without JavaScript, every route in the sitemap answers 200 and shows its
//    main heading and body text, and the same text and links as with JavaScript.
// 2. At 360 px no page scrolls sideways, and nothing in <main> sticks out past
//    the screen (main clips overflow, so a page can hide it instead of scrolling).
// 3. Lighthouse, mobile, on the home page, one long post with code and
//    images, /art and one painting's page, 3 runs each. The bar is 95 for performance, accessibility and SEO.
//    What fails the check is the median of the 3 runs, per score, below 95
//    (a single run is noisy). Every run's scores are printed, and a run under
//    95 is flagged "below 95", so a low run is visible even when the median
//    passes.
// 4. The first screen: at 390 × 844 the home page shows, without scrolling,
//    everything marked data-first-screen (the name, the role line, the
//    availability line and the two buttons).
// 5. Screenshots at 390 px and 1440 px into docs/screenshots/ (JPEG, the
//    first 10,000 px of a longer page: a browser cannot capture much more).
//    The home page at 1440 px is its first screen, then one per section
//    (home-<section>-1440.jpg).
// 6. The home page's showcase (src/widgets/showcase, in the deck of
//    src/widgets/Deck.tsx), at 1440 × 900 and 1280 × 720: the bar is a
//    tablist, one tab per slide of content/showcase.ts; a long vertical wheel
//    scroll from the top of the page to the title block never changes the
//    marked slide and never moves the deck sideways; each tab selects its slide
//    (whole, marked, named in the hash) and the deck is as tall as that slide,
//    its top where it was; a sideways scroll on the deck marks the next slide;
//    the arrow keys and the next button move between slides. A slide's address
//    opens on it; the old home sections' (#work, #experience, and #writing and
//    #now while the showcase has a post or the Now slide) open on the first
//    slide of their kind; #contact opens on Contact. At 768, 1024, 1280, 1440,
//    1920 and 2560 px wide, 720 and 900 high, no slide's
//    scrollWidth exceeds its clientWidth, nothing in it passes its right edge,
//    and the page does not scroll sideways. With reduced motion a tab switches
//    at once; without JavaScript the slides stack as a list; at 390 px they
//    are a row to swipe through, and the page does not scroll sideways.
// 7. Wide screens: the home page, /work, a work page, /art, a painting's page,
//    /blog, a long post, an MDX post (where drafts are built), /about, /cv and
//    /work-with-me, at 1920,
//    2560 and 3440 px wide (900 high): nothing visible in <main> is cut at the
//    screen's edges or by a box that clips it (scripts/lib/edge-clip.mjs), and
//    the page does not scroll sideways.
// 8. The art section: every painting's page offers the enquiry exactly when
//    its twin says it is available, and fan art never shows an enquiry or a
//    print link. On the newest painting's page the close-up viewer's code is
//    not in the first load; choosing the Lamp, then the Layers, loads it
//    and draws (the time to the first frame is printed). Then, on the newest
//    painting with both effects, at 1440 and 390 px, in a headless Chromium on
//    the GPU (Metal; its name is printed),
//    every change of mode (None, Lamp, Layers) moves nothing: the toolbar, the
//    painting and the facts stay put to 1 px, the well keeps its colour, the
//    controls stay inside the toolbar, and the layout-shift score is 0
//    (scripts/lib/viewer-shift.mjs).
//
// Exits 1 if any check fails. SKIP_LIGHTHOUSE=1 skips step 3.

import { mkdirSync } from "node:fs";
import lighthouse from "lighthouse";
import { chromium } from "playwright";
import { clippedAt } from "./lib/edge-clip.mjs";
import { measureViewerShift, shiftProblems, VIEWER_BROWSER_ARGS } from "./lib/viewer-shift.mjs";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://jrlgs.dev";
// Long, with code, images and the longest code line of any post (239 characters).
const POST = "/blog/how-to-and-why-go-serverless";
const SHOT_DIR = "docs/screenshots";
const SHOT_MAX_HEIGHT = 10_000;

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.log(`  FAIL ${msg}`);
};

async function sitemapRoutes() {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`/sitemap.xml answered ${res.status}; is the server running at ${base}?`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
}

/** The page's text and links (header, main, footer). */
function readPage() {
  const root = document.body.cloneNode(true);
  root.querySelectorAll("script, style, noscript, template").forEach((el) => el.remove());
  const text = (root.textContent ?? "").replace(/\s+/g, " ").trim();
  const links = [...root.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
  const h1 = document.querySelector("main h1");
  const main = document.querySelector("main");
  return {
    text,
    links,
    h1: h1 && h1.checkVisibility() ? (h1.textContent ?? "").trim() : "",
    mainText: main ? main.innerText.replace(/\s+/g, " ").trim() : "",
  };
}

/** Elements in <main> whose right edge passes the screen, outside any scrolling box. */
function overflowing() {
  const width = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll("main *")) {
    if (el.closest("[aria-hidden='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.right <= width + 1) continue;
    let scroller = false;
    for (let p = el.parentElement; p && p.tagName !== "MAIN"; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") scroller = true;
    }
    if (!scroller) out.push(`${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} → ${Math.round(r.right)} px`);
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    width,
    out: out.slice(0, 5),
  };
}

/** The deck's state: the marked tab, the hash, the section showing, and the deck's box. */
function deckState() {
  const deck = document.querySelector(".deck")?.getBoundingClientRect();
  const view = document.querySelector(".deck-view");
  const box = view?.getBoundingClientRect();
  const panels = [...document.querySelectorAll(".deck-panel")];
  const panel = box && panels.find((p) => Math.abs(p.getBoundingClientRect().left - box.left) < 2);
  const after = [...document.querySelectorAll(".doc > .cell")].find((c) => deck && c.getBoundingClientRect().top >= deck.bottom - 1);
  return {
    tabs: document.querySelectorAll("[role=tab]").length,
    tab: document.querySelector("[role=tab][aria-selected=true]")?.getAttribute("aria-controls") ?? null,
    hash: location.hash,
    panel: panel?.id ?? null,
    scrollLeft: view ? Math.round(view.scrollLeft) : null,
    deckTop: deck ? Math.round(deck.top) : null,
    // The view is as tall as the tallest section, cut (clip-path) to the one showing.
    height: box ? Math.round(box.height - (parseFloat(getComputedStyle(document.querySelector(".deck")).getPropertyValue("--deck-cut")) || 0)) : null,
    sheet: panel ? Math.round(panel.querySelector(".deck-sheet").getBoundingClientRect().height) : null,
    // What follows the deck sits right under the section showing.
    gap: after && deck ? Math.round(after.getBoundingClientRect().top - deck.bottom) : null,
  };
}

const routes = await sitemapRoutes();
// The newest painting: the first on /art, as the sitemap lists them.
const PAINTING = routes.find((r) => r.startsWith("/art/")) ?? "/art";
const LIGHTHOUSE_PAGES = ["/", POST, "/art", PAINTING];
const LIGHTHOUSE_MIN = 95;
const LIGHTHOUSE_RUNS = 3;
const SCREENSHOTS = [
  ["home", "/"],
  ["blog", "/blog"],
  ["post", POST],
  ["work", "/work"],
  ["work-page", "/work/twinteraction"],
  ["art", "/art"],
  ["painting", PAINTING],
  ["about", "/about"],
];
// Step 7: the wide screens.
const WIDE = [1920, 2560, 3440];
const WIDE_PAGES = ["/", "/work", "/work/twinteraction", "/art", PAINTING, "/blog", POST, "/blog/learning-by-guided-building-with-ai", "/about", "/cv", "/work-with-me"];
// The debugging port is how Lighthouse drives the same browser.
const browser = await chromium.launch({ args: ["--remote-debugging-port=9223"] });

console.log(`\n— 1. JavaScript off: ${routes.length} routes from the sitemap`);
{
  const off = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const on = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const [pOff, pOn] = [await off.newPage(), await on.newPage()];
  for (const route of routes) {
    const res = await pOff.goto(base + route, { waitUntil: "load" });
    if (res?.status() !== 200) {
      fail(`${route}: answered ${res?.status()} without JavaScript`);
      continue;
    }
    const a = await pOff.evaluate(readPage);
    if (!a.h1) fail(`${route}: no visible <h1> in <main> without JavaScript`);
    if (a.mainText.length - a.h1.length < 150) fail(`${route}: <main> holds only ${a.mainText.length} characters without JavaScript`);
    await pOn.goto(base + route, { waitUntil: "networkidle" });
    const b = await pOn.evaluate(readPage);
    if (a.text !== b.text) {
      let i = 0;
      while (a.text[i] === b.text[i]) i++;
      fail(`${route}: text differs with JavaScript off at "…${a.text.slice(i, i + 50)}" vs "…${b.text.slice(i, i + 50)}"`);
    }
    const missing = b.links.filter((href) => !a.links.includes(href));
    if (missing.length) fail(`${route}: links missing without JavaScript: ${missing.join(", ")}`);
  }
  await off.close();
  await on.close();
  console.log(`  checked ${routes.length} routes`);
}

console.log("\n— 2. 360 px: no sideways scroll");
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    const r = await page.evaluate(overflowing);
    if (r.scrollWidth > r.width) fail(`${route}: scrolls sideways (${r.scrollWidth} px wide at ${r.width} px)`);
    if (r.out.length) fail(`${route}: sticks out at 360 px: ${r.out.join("; ")}`);
  }
  await ctx.close();
  console.log(`  checked ${routes.length} routes, ${POST} among them`);
}

console.log("\n— 3. Lighthouse, mobile");
if (process.env.SKIP_LIGHTHOUSE) {
  console.log("  skipped (SKIP_LIGHTHOUSE)");
} else {
  const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  for (const route of LIGHTHOUSE_PAGES) {
    const runs = [];
    for (let i = 0; i < LIGHTHOUSE_RUNS; i++) {
      const result = await lighthouse(base + route, { port: 9223, logLevel: "error", output: "json" });
      const c = result.lhr.categories;
      const a = result.lhr.audits;
      runs.push({
        performance: c.performance.score * 100,
        accessibility: c.accessibility.score * 100,
        "best-practices": c["best-practices"].score * 100,
        seo: c.seo.score * 100,
        lcp: a["largest-contentful-paint"].displayValue,
        cls: a["cumulative-layout-shift"].displayValue,
        tbt: a["total-blocking-time"].displayValue,
      });
    }
    const m = Object.fromEntries(
      ["performance", "accessibility", "best-practices", "seo"].map((k) => [k, median(runs.map((r) => r[k]))]),
    );
    console.log(`  ${route}: perf ${m.performance}, a11y ${m.accessibility}, best practices ${m["best-practices"]}, SEO ${m.seo} (median of ${LIGHTHOUSE_RUNS})`);
    runs.forEach((r, i) => {
      const low = ["performance", "accessibility", "seo"].filter((k) => r[k] < LIGHTHOUSE_MIN);
      const flag = low.length ? `  below ${LIGHTHOUSE_MIN}: ${low.join(", ")}` : "";
      console.log(
        `    run ${i + 1}: perf ${r.performance}, a11y ${r.accessibility}, best practices ${r["best-practices"]}, SEO ${r.seo}  LCP ${r.lcp}  TBT ${r.tbt}  CLS ${r.cls}${flag}`,
      );
    });
    for (const k of ["performance", "accessibility", "seo"]) {
      if (m[k] < LIGHTHOUSE_MIN) fail(`${route}: Lighthouse ${k} ${m[k]} < ${LIGHTHOUSE_MIN}`);
    }
  }
}

console.log("\n— 4. First screen at 390 × 844");
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  const items = await page.evaluate(() =>
    [...document.querySelectorAll("[data-first-screen]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { text: (el.textContent ?? "").trim().slice(0, 40), bottom: Math.round(r.bottom), visible: r.height > 0 };
    }),
  );
  if (items.length < 5) fail(`/: only ${items.length} elements marked data-first-screen (expected name, role, availability, two buttons)`);
  for (const item of items) {
    if (!item.visible || item.bottom > 844) fail(`/: "${item.text}" ends at ${item.bottom} px, below the first screen (844 px)`);
  }
  console.log(`  ${items.length} elements, lowest ends at ${Math.max(...items.map((i) => i.bottom))} px`);
  await ctx.close();
}

console.log(`\n— 5. Screenshots into ${SHOT_DIR}/`);
{
  mkdirSync(SHOT_DIR, { recursive: true });
  for (const width of [390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const [name, route] of SCREENSHOTS) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      // Scroll through, so lazy images load and a post's figures mount.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
      // The home page's deck shows one section at a time: its first screen,
      // then each section through its tab.
      if (await page.locator("[role=tab]").count()) {
        await page.screenshot({ path: `${SHOT_DIR}/${name}-${width}.jpg`, quality: 80 });
        for (const tab of await page.locator("[role=tab]").all()) {
          await tab.click();
          await page.waitForTimeout(1200);
          const id = (await tab.getAttribute("aria-controls")).replace("panel-", "");
          await page.screenshot({ path: `${SHOT_DIR}/${name}-${id}-${width}.jpg`, quality: 80 });
        }
        // The stacked sections after the deck.
        for (const id of await page.$$eval(".doc > .cell .sec[id]", (els) => els.filter((e) => !e.closest(".deck")).map((e) => e.id))) {
          await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: "start", behavior: "instant" }), id);
          await page.waitForTimeout(600);
          await page.screenshot({ path: `${SHOT_DIR}/${name}-${id}-${width}.jpg`, quality: 80 });
        }
        continue;
      }
      const height = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), SHOT_MAX_HEIGHT);
      await page.screenshot({
        path: `${SHOT_DIR}/${name}-${width}.jpg`,
        quality: 80,
        fullPage: true,
        clip: { x: 0, y: 0, width, height },
      });
    }
    await ctx.close();
  }
  console.log(`  ${SCREENSHOTS.length * 2} screenshots`);
}

console.log("\n— 6. The home page's deck");
{
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
  ]) {
    const size = `${width} × ${height}`;
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    const first = await page.evaluate(deckState);
    if (first.tabs < 2) {
      fail(`/ at ${size}: the bar is not a tablist (${first.tabs} tabs)`);
      await ctx.close();
      continue;
    }
    // A long vertical wheel scroll, the pointer over the deck most of the way:
    // the page goes by, the deck stays on its section.
    const changes = new Set();
    for (let i = 0; i < 80; i++) {
      await page.mouse.move(width / 2, height / 2);
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(40);
      const s = await page.evaluate(deckState);
      if (s.tab !== first.tab || s.scrollLeft !== first.scrollLeft) changes.add(`${s.tab} at ${s.scrollLeft}`);
    }
    await page.waitForTimeout(800);
    const atEnd = await page.evaluate(() => Math.round(document.querySelector(".tblock").getBoundingClientRect().bottom) <= innerHeight);
    const last = await page.evaluate(deckState);
    if (changes.size || last.tab !== first.tab || last.hash !== "") fail(`/ at ${size}: scrolling down the page moved the deck (${[...changes].join(", ")}; hash ${last.hash})`);
    if (!atEnd) fail(`/ at ${size}: scrolling down did not reach the title block`);
    // Each tab: its section, the deck as tall as it, the deck's top where it was, what follows right under it.
    await page.evaluate(() => scrollTo({ top: document.querySelector(".deck").getBoundingClientRect().top + scrollY, behavior: "instant" }));
    await page.waitForTimeout(300);
    const ids = await page.$$eval("[role=tab]", (tabs) => tabs.map((t) => t.getAttribute("aria-controls").replace("panel-", "")));
    for (const id of ids) {
      const before = await page.evaluate(deckState);
      await page.click(`#tab-${id}`);
      await page.waitForTimeout(1200);
      const s = await page.evaluate(deckState);
      if (s.tab !== `panel-${id}` || s.hash !== `#${id}` || s.panel !== `panel-${id}`)
        fail(`/ at ${size}: tab ${id} shows ${s.panel}, marks ${s.tab}, hash ${s.hash}`);
      if (Math.abs(s.height - s.sheet) > 1) fail(`/ at ${size}: on ${id} the deck is ${s.height} px tall, its section ${s.sheet} px`);
      if (Math.abs(s.deckTop - before.deckTop) > 1) fail(`/ at ${size}: selecting ${id} moved the deck's top from ${before.deckTop} to ${s.deckTop} px`);
      if (s.gap !== null && Math.abs(s.gap - first.gap) > 1) fail(`/ at ${size}: on ${id} what follows the deck is ${s.gap} px under it (${first.gap} on the first)`);
    }
    // A sideways scroll on the deck (a two-finger swipe): the next section.
    await page.click(`#tab-${ids[0]}`);
    await page.waitForTimeout(1200);
    const box = await page.locator(".deck-view").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + Math.min(200, box.height / 2));
    await page.mouse.wheel(Math.round(box.width * 0.6), 0);
    await page.waitForTimeout(1200);
    const swiped = await page.evaluate(deckState);
    if (swiped.tab !== `panel-${ids[1]}` || swiped.panel !== `panel-${ids[1]}`) fail(`/ at ${size}: a sideways scroll left ${swiped.panel} showing, ${swiped.tab} marked`);
    // The arrow keys.
    await page.click(`#tab-${ids[0]}`);
    await page.waitForTimeout(1200);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1200);
    const k = await page.evaluate(deckState);
    const focused = await page.evaluate(() => document.activeElement?.id);
    if (k.tab !== `panel-${ids[1]}` || focused !== `tab-${ids[1]}`) fail(`/ at ${size}: ArrowRight left ${k.tab} marked, focus on ${focused}`);
    // The next button.
    await page.click(".deck-steps button[aria-label=Next]");
    await page.waitForTimeout(1200);
    const n = await page.evaluate(deckState);
    if (n.panel !== `panel-${ids[2]}` || n.tab !== `panel-${ids[2]}`) fail(`/ at ${size}: Next left ${n.panel} showing`);
    await ctx.close();
    console.log(`  ${size}: the page scrolls past the deck untouched; ${ids.length} tabs, each its section, the deck as tall as it`);
  }
  // Opened on a section: in the deck (and an alias), and a stacked one after it.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const first = (kind) => page.evaluate((kind) => document.querySelector(`.slide[data-kind=${kind}]`)?.id, kind);
    await page.goto(base + "/", { waitUntil: "networkidle" });
    const [work, now, post] = [await first("work"), await first("now"), await first("post")];
    // A slide's own address (a work page's), then the old sections'; #now and
    // #writing only while the showcase has the Now slide or a post.
    for (const [address, id] of [
      ["/#work-twinteraction", "work-twinteraction"],
      ...(now ? [["/#now", now]] : []),
      ["/#work", work],
      ["/#experience", work],
      ...(post ? [["/#writing", post]] : []),
    ]) {
      await page.goto(base + "/blog", { waitUntil: "networkidle" });
      await page.goto(base + address, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const s = await page.evaluate(deckState);
      if (s.panel !== `panel-${id}` || s.tab !== `panel-${id}` || s.deckTop < -1 || s.deckTop > 900 * 0.6)
        fail(`${address} opens on ${s.panel} (marked ${s.tab}), the deck's top at ${s.deckTop} px`);
    }
    await page.goto(base + "/blog", { waitUntil: "networkidle" });
    await page.goto(base + "/#contact", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const c = await page.evaluate(() => {
      const r = document.getElementById("contact").getBoundingClientRect();
      return { top: Math.round(r.top), inDeck: !!document.getElementById("contact").closest(".deck"), hash: location.hash };
    });
    // At its top, or as high as the end of the page lets it go.
    const atEnd = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
    if (c.inDeck || c.top < -2 || (c.top > 2 && !atEnd) || c.hash !== "#contact") fail(`/#contact opens with Contact at ${c.top} px (in the deck: ${c.inDeck}, hash ${c.hash})`);
    await ctx.close();
  }
  // Nothing in the deck is wider than its panel.
  {
    let checked = 0;
    for (const width of [768, 1024, 1280, 1440, 1920, 2560]) {
      for (const height of [720, 900]) {
        const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await page.goto(base + "/", { waitUntil: "networkidle" });
        for (const tab of await page.locator("[role=tab]").all()) {
          await tab.click();
          await page.waitForTimeout(200);
          const id = await tab.getAttribute("aria-controls");
          const r = await page.evaluate((id) => {
            const panel = document.getElementById(id);
            const box = panel.getBoundingClientRect();
            const past = [...panel.querySelectorAll("*")]
              .map((el) => [el, el.getBoundingClientRect()])
              .filter(([, r]) => r.width > 0 && r.right > box.right + 0.5)
              .map(([el, r]) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} by ${Math.round(r.right - box.right)} px`);
            return {
              scrollWidth: panel.scrollWidth,
              clientWidth: panel.clientWidth,
              page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              past: past.slice(0, 3),
            };
          }, id);
          const where = `/ at ${width} × ${height}, ${id}`;
          if (r.scrollWidth > r.clientWidth) fail(`${where}: scrollWidth ${r.scrollWidth} > clientWidth ${r.clientWidth}`);
          if (r.past.length) fail(`${where}: past the panel's right edge: ${r.past.join("; ")}`);
          if (r.page > 0) fail(`${where}: the page scrolls sideways by ${r.page} px`);
          checked++;
        }
        await ctx.close();
      }
    }
    console.log(`  nothing wider than its panel: ${checked} panels at 10 sizes`);
  }
  // Reduced motion: the deck, a tab switching at once.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    const ids = await page.$$eval("[role=tab]", (tabs) => tabs.map((t) => t.getAttribute("aria-controls")));
    if (!ids.length) fail("/ with reduced motion: no tabs");
    else {
      await page.click(`[aria-controls=${ids[ids.length - 1]}]`);
      await page.waitForTimeout(50);
      const s = await page.evaluate(deckState);
      if (s.panel !== ids[ids.length - 1]) fail(`/ with reduced motion: a tab did not switch at once (${s.panel} showing)`);
      else console.log("  reduced motion: the deck, a tab switching at once");
    }
    await ctx.close();
  }
  // Without JavaScript: the slides stacked as a list; at 390 px, a row to swipe through.
  for (const [label, options] of [
    ["no JavaScript", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }],
    ["390 px", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }],
  ]) {
    const ctx = await browser.newContext(options);
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll(".deck .slide")].map((s) => s.getBoundingClientRect());
      return {
        slides: boxes.length,
        tabs: document.querySelectorAll("[role=tab]").length,
        links: document.querySelectorAll(".index a[href^='#']").length,
        stacked: boxes.every((r, i) => i === 0 || r.top >= boxes[i - 1].bottom),
        row: boxes.every((r, i) => i === 0 || (Math.abs(r.top - boxes[0].top) < 2 && r.left > boxes[i - 1].left)),
        sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    const ok = !r.tabs && r.links === r.slides && r.sideways <= 0 && (label === "390 px" ? r.row : r.stacked);
    if (!ok) fail(`/ with ${label}: not the slides ${label === "390 px" ? "in a row" : "stacked"} with in-page links (${JSON.stringify(r)})`);
    else console.log(`  ${label}: ${r.slides} slides ${label === "390 px" ? "in a row to swipe" : "stacked"}, ${r.links} in-page links`);
    await ctx.close();
  }
}

console.log("\n— 7. Wide screens: nothing cut at the edges");
{
  const pages = WIDE_PAGES;
  let checked = 0;
  for (const width of WIDE) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const route of pages) {
      const res = await page.goto(base + route, { waitUntil: "load" });
      if (res?.status() !== 200) continue; // a draft, where drafts are not built
      await page.waitForTimeout(500);
      const r = await clippedAt(page);
      if (r.scrollWidth > r.width) fail(`${route} at ${width} px: scrolls sideways (${r.scrollWidth} px wide)`);
      if (r.cut.length) fail(`${route} at ${width} px: ${r.cut.length} cut at the edges: ${r.cut.slice(0, 3).join("; ")}`);
      checked++;
    }
    await ctx.close();
  }
  console.log(`  checked ${checked} pages at ${WIDE.join(", ")} px`);
}

console.log("\n— 8. The art section: the close-up only when chosen, enquiries only where offered");
{
  // A string only the viewer's shaders have.
  const VIEWER_MARK = "D_Charlie";
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const scripts = [];
  page.on("response", (res) => {
    if (res.url().endsWith(".js")) scripts.push(res.text().then((t) => t.includes(VIEWER_MARK), () => false));
  });
  await page.goto(base + PAINTING, { waitUntil: "networkidle" });
  if ((await Promise.all(scripts)).some(Boolean)) fail(`${PAINTING}: the viewer's code is in the first load`);
  const effects = (await page.locator(".inspect-mode button").allTextContents()).filter((name) => name !== "None");
  for (const name of effects) {
    const t = Date.now();
    await page.locator(".inspect-mode").getByRole("button", { name, exact: true }).click();
    const live = await page.waitForSelector("canvas.viewer-canvas[data-live]", { timeout: 30_000 }).then(() => true, () => false);
    if (!live) fail(`${PAINTING}: the ${name} never drew (${await page.locator(".inspect-tools").textContent()})`);
    else console.log(`  ${PAINTING}: ${name} drawn ${Date.now() - t} ms after the click`);
  }
  if (!(await Promise.all(scripts)).some(Boolean)) fail(`${PAINTING}: choosing an effect did not load the viewer's code`);
  await ctx.close();

  // Choosing a mode moves nothing, in a browser on the GPU, on the newest painting with both effects (Lamp and Layers).
  let viewerPage = PAINTING;
  for (const route of routes.filter((r) => /^\/art\/[^/]+$/.test(r))) {
    if ((await (await fetch(base + route)).text()).includes(">Layers</button>")) {
      viewerPage = route;
      break;
    }
  }
  const gpuBrowser = await chromium.launch({ args: VIEWER_BROWSER_ARGS });
  for (const width of [1440, 390]) {
    const r = await measureViewerShift(gpuBrowser, base + viewerPage, width);
    const worst = Math.max(...Object.values(r.moved));
    console.log(`  ${viewerPage} at ${width} px (${r.gpu}): ${r.states.length - 1} mode changes, largest movement ${worst.toFixed(1)} px, layout shift ${r.score.toFixed(4)}`);
    for (const p of shiftProblems(r)) fail(`${viewerPage}: ${p}`);
  }
  await gpuBrowser.close();

  for (const route of routes.filter((r) => /^\/art\/[^/]+$/.test(r))) {
    const twin = await (await fetch(`${base}${route}.md`)).text();
    const page = await (await fetch(base + route)).text();
    const available = twin.includes("\n- Available: yes");
    const fan = twin.includes("\n- Fan art: yes");
    if (page.includes("data-enquiry") !== available) fail(`${route}: enquiry ${available ? "missing" : "shown"} (twin says ${available ? "" : "not "}available)`);
    if (fan && (page.includes("data-enquiry") || page.includes("data-prints"))) fail(`${route}: fan art with an enquiry or a print link`);
  }
  console.log("  enquiries and print links checked on every painting");
}

for (const p of await (await import("./lib/pigment-drawer.mjs")).checkDrawer(browser, base + "/art")) fail(p); // 8, /art: opening, switching and closing a paint's sheet moves nothing (scripts/lib/pigment-drawer.mjs)
await browser.close();
console.log(failures.length ? `\nverify failed: ${failures.length} problem(s)` : "\nverify passed");
process.exit(failures.length ? 1 : 0);
