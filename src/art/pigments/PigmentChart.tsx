"use client";

// The colour chart's live part. The chart is server-rendered <details> (see
// PaintsAndPaper.tsx), which already open and close on a click, Enter or
// Space; this adds, without changing a word of the page:
// - one sheet open at a time, in a drawer under the chart (pigments.css): it
//   slides out when a sheet opens from closed, and switching swatches swaps its
//   content in place while the accent tab on its top rule glides to the new one;
// - on a mouse, a sheet opens when the pointer rests on a swatch and closes
//   when it leaves the chart, unless a click pinned it open;
// - Escape, the Close button, or a click outside the chart closes the open
//   sheet (Escape and Close put the focus back on its swatch).
// - the page never jumps: closing a sheet (or switching to a shorter one) while
//   the screen shows the part of the page the drawer made, its height is held
//   at the screen's bottom until the reader scrolls back up.
// It renders nothing itself.

import { useEffect } from "react";

/** How long the pointer rests on a swatch before its sheet opens, and how long it may leave before it closes, in ms. */
export const HOVER_OPEN_MS = 140;
export const HOVER_CLOSE_MS = 260;
/** How long the drawer's slide lasts (pigments.css says 200 ms), with a margin, in ms. */
const ENTER_MS = 260;

/** Wires the chart under `root`; returns a function that unwires it. */
export function enhanceChart(root: HTMLElement): () => void {
  const items = [...root.querySelectorAll<HTMLDetailsElement>("details.pig-item")];
  const summaryOf = (d: HTMLDetailsElement) => d.querySelector<HTMLElement>(":scope > summary")!;
  const mouse = typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;
  /** The sheet the pointer opened (null when none, or when a click pinned it). */
  let hovered: HTMLDetailsElement | null = null;
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Document, type: K, f: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(type, f as EventListener);
    offs.push(() => el.removeEventListener(type, f as EventListener));
  };

  const strip = root.querySelector<HTMLElement>(".pig-strip");
  let enterTimer: ReturnType<typeof setTimeout> | undefined;

  // The page's height, held while the screen shows what the drawer added below it.
  const html = document.documentElement;
  let held = 0;
  const pageEnd = () => document.body.getBoundingClientRect().bottom + scrollY;
  const release = () => {
    held = 0;
    html.style.minHeight = "";
    removeEventListener("scroll", onScroll);
  };
  const onScroll = () => {
    const bottom = scrollY + innerHeight;
    if (bottom <= pageEnd() + 1) release();
    else if (bottom < held) html.style.minHeight = `${(held = bottom)}px`;
  };
  /** Before a change that may shorten the page: keep it at least down to the screen's bottom. */
  const hold = () => {
    const bottom = scrollY + innerHeight;
    if (bottom <= pageEnd() + 1 || bottom <= held) return;
    if (!held) addEventListener("scroll", onScroll, { passive: true });
    html.style.minHeight = `${(held = bottom)}px`;
  };

  /**
   * Marks `d`'s swatch on the drawer's top rule, under its column. Only from the
   * chart's last row: under a higher row the tab would point at another swatch
   * (the sheet's head names the swatch by number either way).
   */
  const mark = (d: HTMLDetailsElement) => {
    if (!strip) return;
    const cell = d.closest("li") ?? d;
    const s = strip.getBoundingClientRect();
    const c = cell.getBoundingClientRect();
    const lastRow = c.bottom >= s.bottom - 2;
    strip.style.setProperty("--pig-mark-x", `${c.left - s.left + (lastRow ? 0 : c.width / 2)}px`);
    strip.style.setProperty("--pig-mark-w", `${lastRow ? c.width : 0}px`);
  };
  /** Shows `d` as the open sheet: slides the drawer out if none was open, else swaps in place. */
  const show = (d: HTMLDetailsElement, entering: boolean) => {
    clearTimeout(enterTimer);
    if (entering) {
      delete root.dataset.glide;
      root.dataset.entering = "";
      enterTimer = setTimeout(() => delete root.dataset.entering, ENTER_MS);
    } else {
      delete root.dataset.entering;
      root.dataset.glide = "";
    }
    mark(d);
    root.dataset.open = d.id;
  };
  const shut = () => {
    clearTimeout(enterTimer);
    delete root.dataset.entering;
    delete root.dataset.glide;
    delete root.dataset.open;
  };

  const current = () => items.find((d) => d.open) ?? null;
  const open = (d: HTMLDetailsElement, by: "pin" | "hover") => {
    const was = current();
    hovered = by === "hover" ? d : null;
    if (was === d) return;
    hold();
    for (const other of items) if (other !== d) other.open = false;
    d.open = true;
    show(d, !was);
  };
  const close = (d: HTMLDetailsElement, refocus: boolean) => {
    hold();
    d.open = false;
    if (hovered === d) hovered = null;
    if (!current()) shut();
    if (refocus) summaryOf(d).focus();
  };
  const toggle = (d: HTMLDetailsElement) => {
    // A sheet the pointer opened is pinned by a click, not closed by it.
    if (d.open && hovered !== d) close(d, false);
    else open(d, "pin");
  };

  for (const d of items) {
    const summary = summaryOf(d);
    on(summary, "click", (e) => {
      e.preventDefault();
      clearTimeout(openTimer);
      toggle(d);
    });
    on(summary, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toggle(d);
    });
    // Opened some other way (find in page, or a click before this code ran): still one at a time.
    on(d, "toggle", () => {
      if (d.open) {
        if (root.dataset.open === d.id) return;
        const was = items.some((other) => other !== d && other.open);
        for (const other of items) if (other !== d) other.open = false;
        show(d, !was);
      } else if (!current()) shut();
    });
    on(d.querySelector<HTMLElement>("[data-pig-close]") ?? d, "click", (e) => {
      if (!(e.target as Element).closest("[data-pig-close]")) return;
      close(d, true);
    });
    if (mouse) {
      on(summary, "pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        const now = current();
        if (now && hovered !== now) return; // a pinned sheet stays until closed
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => open(d, "hover"), now ? HOVER_OPEN_MS / 2 : HOVER_OPEN_MS);
      });
      on(summary, "pointerleave", () => clearTimeout(openTimer));
    }
  }

  if (mouse) {
    on(root, "pointerenter", () => clearTimeout(closeTimer));
    on(root, "pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(openTimer);
      const d = hovered;
      if (d) closeTimer = setTimeout(() => hovered === d && close(d, false), HOVER_CLOSE_MS);
    });
  }

  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;
    const d = current();
    if (!d) return;
    e.preventDefault();
    close(d, root.contains(document.activeElement) || hovered !== d);
  });
  on(document, "pointerdown", (e) => {
    const d = current();
    if (d && !root.contains(e.target as Node)) close(d, false);
  });

  // The chart reflows with the window: keep the tab under its swatch.
  const resized = new (globalThis.ResizeObserver ?? class { observe() {} disconnect() {} })(() => {
    const d = current();
    if (!d) return;
    delete root.dataset.glide;
    mark(d);
  });
  if (strip) resized.observe(strip);

  root.dataset.live = "";
  return () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    clearTimeout(enterTimer);
    resized.disconnect();
    for (const off of offs) off();
    release();
    delete root.dataset.live;
  };
}

export function PigmentChart({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    return root ? enhanceChart(root) : undefined;
  }, [rootId]);
  return null;
}
