// The close-up viewer must not move the page: on a painting's page, through
// every change of mode (None -> Lamp -> Layers -> None -> Layers -> Lamp ->
// None), the toolbar, the painting and the facts below it stay where they are
// (to 1 px), the well keeps its colour, nothing scrolls sideways, the mode's
// controls stay inside the toolbar, and Chrome reports no layout shift. Where
// the controls fold behind "Controls", opening them moves nothing either. Used
// by scripts/viewer-shift.mjs and by `pnpm verify` (step 8).

const BOXES = {
  toolbar: ".inspect",
  mode: ".inspect-mode",
  tools: ".inspect-tools",
  well: ".art-plate .well",
  painting: ".art-plate .viewer-box",
  caption: ".art-plate figcaption",
  facts: ".art-facts",
};

/** The order the modes are chosen in: every change between two modes happens once. */
export const MODE_TOUR = ["Lamp", "Layers", "None", "Layers", "Lamp", "None"];

const snapshot = (page) =>
  page.evaluate((boxes) => {
    const out = { page: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight } };
    for (const [name, sel] of Object.entries(boxes)) {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      out[name] = r ? { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height } : null;
    }
    // Anything shown in the tools' cell (unless folded over the painting) must lie inside it.
    const tools = document.querySelector(".inspect-tools").getBoundingClientRect();
    const bar = document.querySelector(".inspect-bar");
    const folded = getComputedStyle(bar).position === "absolute";
    let spill = 0;
    for (const el of document.querySelectorAll(".inspect-tools *")) {
      if (folded && bar.contains(el)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      spill = Math.max(spill, tools.top - r.top, r.bottom - tools.bottom, tools.left - r.left, r.right - tools.right);
    }
    out.spill = spill;
    out.folded = folded;
    out.sideways = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    out.wellColour = getComputedStyle(document.querySelector(".art-plate .well")).backgroundColor;
    return out;
  }, BOXES);

const press = (page, name) => page.locator(".inspect-mode").getByRole("button", { name, exact: true }).click();

/** Tour the modes at one width. Returns the states, the largest movement per box, the shift score, and the GPU's name. */
export async function measureViewerShift(browser, url, width, { height = 900, timeout = 30_000, shoot } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__shift = 0;
    window.__shifted = [];
    const name = (n) => (n?.nodeType === 1 ? `${n.tagName.toLowerCase()}.${[...n.classList].join(".")}` : n ? `#text "${n.textContent.slice(0, 30)}"` : "?");
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shift += e.value;
        for (const src of e.sources) window.__shifted.push(`${name(src.node)} ${src.previousRect.x},${src.previousRect.y} -> ${src.currentRect.x},${src.currentRect.y}`);
      }
    }).observe({ type: "layout-shift", buffered: false });
  });
  const gpu = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl ? (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) : "no WebGL 2";
  });
  const layers = await page.locator(".inspect-mode").getByRole("button", { name: "Layers", exact: true }).count();
  const tour = layers ? MODE_TOUR : MODE_TOUR.filter((m) => m !== "Layers");
  // A screenshot of each state, the first time it is reached.
  const shot = new Set();
  const take = async (name) => {
    if (!shoot || shot.has(name)) return;
    shot.add(name);
    await shoot(page, name.toLowerCase().replace(/ /g, "-"));
  };
  const states = [{ name: "None", ...(await snapshot(page)) }];
  await take("None");
  const live = [];
  for (const name of tour) {
    await press(page, name);
    if (name !== "None") {
      const drawn = await page.waitForSelector("canvas.viewer-canvas[data-live]", { timeout }).then(() => true, () => false);
      live.push({ name, drawn });
    }
    await page.waitForTimeout(700); // the canvas's fade
    const s = { name, ...(await snapshot(page)) };
    states.push(s);
    await take(name);
    // Folded controls: open them, then close them again.
    if (s.folded && name !== "None") {
      await page.locator(".inspect-more").click();
      await page.waitForTimeout(200);
      states.push({ name: `${name} open`, ...(await snapshot(page)) });
      await take(`${name} open`);
      await page.locator(".inspect-more").click();
    }
  }
  const score = await page.evaluate(() => window.__shift);
  const shifted = [...new Set(await page.evaluate(() => window.__shifted))];
  await ctx.close();

  const moved = {};
  for (const key of [...Object.keys(BOXES), "page"]) {
    let worst = 0;
    for (const s of states.slice(1)) {
      const a = states[0][key], b = s[key];
      if (!a || !b) continue;
      const keys = key === "page" ? ["width", "height"] : ["x", "y", "w", "h"];
      for (const k of keys) worst = Math.max(worst, Math.abs(a[k] - b[k]));
    }
    moved[key] = worst;
  }
  const colourChanged = states.some((s) => s.wellColour !== states[0].wellColour);
  return { width, states, moved, score, shifted, live, colourChanged, gpu };
}

/** The problems, as strings. */
export function shiftProblems(r) {
  const out = [];
  for (const [key, d] of Object.entries(r.moved)) if (d > 1) out.push(`${r.width} px: ${key} moved ${d.toFixed(1)} px`);
  if (r.score > 0) out.push(`${r.width} px: layout-shift score ${r.score.toFixed(4)} (${r.shifted.slice(0, 4).join("; ")})`);
  if (r.colourChanged) out.push(`${r.width} px: the well changed colour (${[...new Set(r.states.map((s) => s.wellColour))].join(" / ")})`);
  for (const l of r.live) if (!l.drawn) out.push(`${r.width} px: ${l.name} never drew`);
  for (const s of r.states) if (s.spill > 0.5) out.push(`${r.width} px: in ${s.name}, the controls spill ${s.spill.toFixed(0)} px out of the toolbar`);
  for (const s of r.states) if (s.sideways > 0) out.push(`${r.width} px: sideways scroll in ${s.name}`);
  return out;
}

/** A headless Chromium with the GPU (Metal on a Mac): the Lamp needs WebGL 2 with float targets. */
export const VIEWER_BROWSER_ARGS = ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"];
