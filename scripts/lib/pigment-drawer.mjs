// /art's paint swatches must not move the page: opening a swatch's sheet (the
// drawer under the chart, src/art/pigments/), switching to another and closing
// it, by mouse, keyboard and touch, keeps the swatches row and the content
// after the chart (the title block) where they are on the screen (to 1 px),
// the page never scrolls by itself (closing a sheet while the screen shows the
// part of the page the drawer added included), nothing scrolls sideways, the
// drawer lies under the swatches, as wide as the chart, and Chrome reports no
// layout shift (counting shifts right after a click or tap too). Used by
// scripts/pigment-drawer.mjs and by `pnpm verify` (step 8).

const BOXES = { strip: ".pig-strip", after: "footer.tblock" };
const SETTLE_MS = 450; // more than the hover delay plus the drawer's slide

const snapshot = (page) =>
  page.evaluate((boxes) => {
    const out = { scrollY, sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    for (const [name, sel] of Object.entries(boxes)) {
      const r = document.querySelector(sel).getBoundingClientRect();
      out[name] = { x: r.left, y: r.top, w: r.width, h: r.height };
    }
    out.open = [...document.querySelectorAll("details.pig-item[open]")].map((d) => d.id.replace(/^pig-/, ""));
    const sheet = document.querySelector("details.pig-item[open] > .pig-sheet");
    if (sheet) {
      const s = sheet.getBoundingClientRect();
      const strip = document.querySelector(".pig-strip").getBoundingClientRect();
      const drawer = sheet.querySelector(".pig-drawer");
      out.drawer = {
        gap: s.top - strip.bottom, // ≥ 0: below the swatches, never over them
        dx: Math.abs(s.left - strip.left) + Math.abs(s.right - strip.right), // as wide as the chart
        h: s.height,
        tall: drawer.getBoundingClientRect().height - innerHeight, // ≤ 0: fits the screen (it scrolls inside)
        still: getComputedStyle(drawer).transform === "none",
      };
    }
    return out;
  }, BOXES);

const moved = (a, b) => Math.max(...["x", "y", "w", "h"].map((k) => Math.abs(a[k] - b[k])));

/** Open, switch and close sheets at one width. Returns the steps, the largest movement per box, and the layout-shift score. */
export async function measureDrawer(browser, url, width, { height = width > 700 ? 900 : 844, shoot } = {}) {
  const touch = width <= 700;
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".pig[data-live]");
  // The chart a little under the top of the screen.
  await page.evaluate(() => scrollTo({ top: document.querySelector(".pig-strip").getBoundingClientRect().top + scrollY - 120, behavior: "instant" }));
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    window.__shift = 0;
    window.__shifted = [];
    const name = (n) => (n?.nodeType === 1 ? `${n.tagName.toLowerCase()}.${[...n.classList].join(".")}` : "?");
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__shift += e.value; // hadRecentInput too: a click must not move the page either
        for (const src of e.sources) window.__shifted.push(`${name(src.node)} ${JSON.stringify(src.previousRect)} -> ${JSON.stringify(src.currentRect)} ${e.hadRecentInput ? "(input)" : ""}`);
      }
    }).observe({ type: "layout-shift", buffered: false });
  });

  const steps = [];
  const most = { strip: 0, after: 0 };
  let base = await snapshot(page);
  const step = async (name, expectOpen, act) => {
    await act();
    await page.waitForTimeout(SETTLE_MS);
    const s = await snapshot(page);
    for (const k of Object.keys(most)) most[k] = Math.max(most[k], moved(base[k], s[k]));
    steps.push({ name, expectOpen, ...s, scrolled: s.scrollY - base.scrollY });
    return s;
  };
  const sum = (key) => `#pig-${key} > summary`;
  const rebase = async (act) => {
    await act();
    await page.waitForTimeout(200);
    base = await snapshot(page);
  };

  if (!touch) {
    await step("hover opens", ["ultramarine-blue"], () => page.hover(sum("ultramarine-blue")));
    if (shoot) await shoot(page, "hover");
    await step("hover switches", ["hansa-yellow-light"], () => page.hover(sum("hansa-yellow-light")));
    await step("click pins", ["hansa-yellow-light"], () => page.click(sum("hansa-yellow-light")));
    await step("click switches", ["paynes-grey"], () => page.click(sum("paynes-grey")));
    await step("Close closes", [], () => page.click("#pig-paynes-grey [data-pig-close]"));
    await step("hover opens", ["burnt-sienna"], () => page.hover(sum("burnt-sienna")));
    await step("leaving closes", [], () => page.mouse.move(4, 4));
    await step("Enter opens", ["phthalo-blue"], async () => {
      await page.focus(sum("phthalo-blue"));
      await page.keyboard.press("Enter");
    });
    await step("Escape closes", [], () => page.keyboard.press("Escape"));
    await step("click pins", ["alizarin-crimson"], () => page.click(sum("alizarin-crimson")));
  } else {
    await step("tap opens", ["ultramarine-blue"], () => page.tap(sum("ultramarine-blue")));
    await step("tap switches", ["new-gamboge"], () => page.tap(sum("new-gamboge")));
    if (shoot) await shoot(page, "tap");
    await step("tap closes", [], () => page.tap(sum("new-gamboge")));
    await step("tap opens", ["alizarin-crimson"], () => page.tap(sum("alizarin-crimson")));
  }
  // Scrolled to the page's end (past the title block, into what the drawer
  // added), a click outside closes the sheet: the page must not jump up.
  await rebase(() => page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })));
  await step("click outside, at the page's end", [], () => (touch ? page.touchscreen.tap(4, 4) : page.mouse.click(4, 4)));

  const score = await page.evaluate(() => window.__shift);
  const shifted = await page.evaluate(() => window.__shifted);
  await ctx.close();
  return { width, steps, moved: most, score, shifted };
}

/** What is wrong in a measureDrawer result, as sentences (empty when nothing is). */
export function drawerProblems(r) {
  const out = [];
  for (const [k, v] of Object.entries(r.moved)) if (v > 1) out.push(`at ${r.width} px the ${k === "strip" ? "swatches row" : "content after the chart"} moved ${v.toFixed(1)} px`);
  if (r.score > 0) out.push(`at ${r.width} px layout shift ${r.score.toFixed(4)} (${r.shifted.slice(0, 4).join("; ")})`);
  for (const s of r.steps) {
    const where = `at ${r.width} px, "${s.name}"`;
    if (s.open.join() !== s.expectOpen.join()) out.push(`${where}: open ${s.open.join() || "none"}, expected ${s.expectOpen.join() || "none"}`);
    if (Math.abs(s.scrolled) > 1) out.push(`${where}: the page scrolled ${s.scrolled.toFixed(0)} px`);
    if (s.sideways > 0) out.push(`${where}: the page scrolls sideways (${s.sideways} px)`);
    if (s.drawer) {
      if (s.drawer.gap < 0) out.push(`${where}: the drawer covers the swatches by ${(-s.drawer.gap).toFixed(1)} px`);
      if (s.drawer.dx > 1) out.push(`${where}: the drawer is not as wide as the chart (${s.drawer.dx.toFixed(1)} px off)`);
      if (s.drawer.tall > 0) out.push(`${where}: the drawer is ${s.drawer.tall.toFixed(0)} px taller than the screen`);
      if (!s.drawer.still || s.drawer.h < 40) out.push(`${where}: the drawer is not out (height ${s.drawer.h.toFixed(0)}, still ${s.drawer.still})`);
    }
  }
  return out;
}

/** Run the check at 1440 and 390 px; print a line per width and each problem. Returns the problems. */
export async function checkDrawer(browser, url, { shots, log = console.log } = {}) {
  const problems = [];
  for (const width of [1440, 390]) {
    const shoot = shots ? (page) => page.screenshot({ path: `${shots}/drawer-${width}.png` }) : undefined;
    const r = await measureDrawer(browser, url, width, { shoot });
    log(`  /art at ${width} px: ${r.steps.length} steps, swatches row moved ${r.moved.strip.toFixed(1)} px, content after the chart ${r.moved.after.toFixed(1)} px, layout shift ${r.score.toFixed(4)}`);
    problems.push(...drawerProblems(r));
  }
  return problems;
}
