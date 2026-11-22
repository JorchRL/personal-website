// Content cut at the screen's edges: what pnpm verify checks at wide screens
// (scripts/verify.mjs, step 7) and test/edge-clip.test.ts tests.
//
// An element is cut when part of its box lies outside what can be seen of it:
// the screen's width (the root's clientWidth, which leaves out a scrollbar),
// narrowed by every ancestor that clips sideways (overflow-x other than
// visible). Two cases are not cuts: an element inside a box that scrolls
// sideways (overflow-x auto or scroll) can be scrolled to, and an element
// wholly outside a box with overflow hidden is scrolled away on purpose (a
// deck's other slides). The scrolling box itself is checked like any other.
// What is hidden from assistive technology (aria-hidden) is left out: it is
// decoration, and may run off a box's edge on purpose.

/**
 * @param {{ left: number, right: number }} box the element's box
 * @param {{ left: number, right: number, kind: "clip" | "hidden" | "scroll", name?: string }[]} clips
 *   its clipping ancestors, nearest first: their padding boxes, and how they clip
 * @param {number} width the screen's width, without a scrollbar
 * @param {number} [tol] pixels of slack for rounding
 * @returns {null | { side: "left" | "right", px: number, by: string }}
 */
export function edgeCut(box, clips, width, tol = 1) {
  let lo = { at: 0, by: "the screen" };
  let hi = { at: width, by: "the screen" };
  for (const c of clips) {
    if (c.kind === "scroll") return null;
    if (c.kind === "hidden" && (box.right <= c.left + tol || box.left >= c.right - tol)) return null;
    if (c.left > lo.at) lo = { at: c.left, by: c.name ?? "an ancestor" };
    if (c.right < hi.at) hi = { at: c.right, by: c.name ?? "an ancestor" };
  }
  const left = lo.at - box.left;
  const right = box.right - hi.at;
  if (left <= tol && right <= tol) return null;
  return left >= right
    ? { side: "left", px: Math.round(left), by: lo.by }
    : { side: "right", px: Math.round(right), by: hi.by };
}

/**
 * Runs in the page (see clippedAt): every visible element in <main> that is
 * cut, as "selector: cut N px on the left by X". Its argument is edgeCut.
 */
function collect(cut) {
  const width = document.documentElement.clientWidth;
  const name = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
    return el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + cls.map((c) => `.${c}`).join("");
  };
  const out = [];
  for (const el of document.querySelectorAll("main *")) {
    if (el.closest("[aria-hidden='true']")) continue;
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const clips = [];
    let fixed = getComputedStyle(el).position === "fixed";
    for (let p = el.parentElement; p && !fixed; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflowX !== "visible") {
        const left = p.getBoundingClientRect().left + p.clientLeft;
        const kind = s.overflowX === "clip" ? "clip" : s.overflowX === "hidden" ? "hidden" : "scroll";
        clips.push({ left, right: left + p.clientWidth, kind, name: name(p) });
      }
      fixed = s.position === "fixed";
    }
    const c = cut({ left: r.left, right: r.right }, clips, width);
    if (!c) continue;
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    out.push(`${name(el)}${text ? " (text)" : ""}: cut ${c.px} px on the ${c.side} by ${c.by}`);
  }
  return { width, scrollWidth: document.documentElement.scrollWidth, cut: out };
}

/** The cut elements of a Playwright page as it is now. */
export function clippedAt(page) {
  return page.evaluate(`(${collect})(${edgeCut})`);
}
