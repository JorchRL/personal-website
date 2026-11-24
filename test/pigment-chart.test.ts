// @vitest-environment jsdom
// The colour chart's live part (src/art/pigments/PigmentChart.tsx) on the
// chart's own server HTML: a swatch's sheet opens and closes from the
// keyboard, one at a time; Escape and Close shut it and give the focus back to
// its swatch; on a mouse, resting on a swatch opens it and leaving the chart
// closes it, unless a click pinned it. jsdom has no layout: how the sheet lies
// over the page is checked in a browser.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PaintsAndPaper } from "@/art/pigments/PaintsAndPaper";
import { enhanceChart, HOVER_CLOSE_MS, HOVER_OPEN_MS } from "@/art/pigments/PigmentChart";

const html = renderToStaticMarkup(createElement(PaintsAndPaper));

let root: HTMLElement;
let unwire: () => void;

function setup(mouse: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: mouse && query.includes("hover: hover"), media: query }));
  document.body.innerHTML = `<main>${html}</main><a id="elsewhere" href="/art/x">A painting</a>`;
  root = document.getElementById("paints-and-paper")!;
  unwire = enhanceChart(root);
}

const item = (key: string) => document.getElementById(`pig-${key}`) as HTMLDetailsElement;
const summary = (key: string) => item(key).querySelector("summary")!;
const openKeys = () => [...root.querySelectorAll<HTMLDetailsElement>("details.pig-item")].filter((d) => d.open).map((d) => d.id);
const key = (el: Element | Document, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
function pointer(el: Element, type: string) {
  const e = new Event(type, { bubbles: type !== "pointerenter" && type !== "pointerleave" });
  Object.defineProperty(e, "pointerType", { value: "mouse" });
  el.dispatchEvent(e);
}

afterEach(() => {
  unwire();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("from the keyboard", () => {
  beforeEach(() => setup(false));

  it("marks the chart live", () => {
    expect(root.hasAttribute("data-live")).toBe(true);
  });

  it("opens a swatch's sheet with Enter or Space, one at a time", () => {
    summary("ultramarine-blue").focus();
    key(summary("ultramarine-blue"), "Enter");
    expect(openKeys()).toEqual(["pig-ultramarine-blue"]);
    key(summary("burnt-sienna"), " ");
    expect(openKeys()).toEqual(["pig-burnt-sienna"]);
    key(summary("burnt-sienna"), "Enter");
    expect(openKeys()).toEqual([]);
  });

  it("reaches the open sheet's links and Close by Tab: they follow the swatch in the page", () => {
    key(summary("phthalo-blue"), "Enter");
    const focusable = [...root.querySelectorAll<HTMLElement>("summary, a[href], button")];
    const at = focusable.indexOf(summary("phthalo-blue"));
    const next = focusable.slice(at + 1, at + 3);
    expect(next.map((el) => item("phthalo-blue").contains(el))).toEqual([true, true]);
    expect(next[0].matches("[data-pig-close]")).toBe(true);
  });

  it("closes with Escape and gives the focus back to the swatch", () => {
    summary("new-gamboge").focus();
    key(summary("new-gamboge"), "Enter");
    const link = item("new-gamboge").querySelector<HTMLAnchorElement>(".pig-sources a")!;
    link.focus();
    key(document, "Escape");
    expect(openKeys()).toEqual([]);
    expect(document.activeElement).toBe(summary("new-gamboge"));
  });

  it("closes with Close, focus back on the swatch", () => {
    key(summary("paynes-grey"), "Enter");
    item("paynes-grey").querySelector<HTMLButtonElement>("[data-pig-close]")!.click();
    expect(openKeys()).toEqual([]);
    expect(document.activeElement).toBe(summary("paynes-grey"));
  });

  it("slides the drawer out only from closed: switching swatches swaps it in place", () => {
    key(summary("ultramarine-blue"), "Enter");
    expect(root.hasAttribute("data-entering")).toBe(true);
    expect(root.hasAttribute("data-glide")).toBe(false);
    key(summary("burnt-sienna"), "Enter");
    expect(root.hasAttribute("data-entering")).toBe(false);
    expect(root.hasAttribute("data-glide")).toBe(true);
    expect(root.dataset.open).toBe("pig-burnt-sienna");
    key(summary("burnt-sienna"), "Enter");
    expect(root.hasAttribute("data-open")).toBe(false);
    expect(root.hasAttribute("data-glide")).toBe(false);
  });

  it("closes when a click lands outside the chart", () => {
    summary("paynes-grey").click();
    expect(openKeys()).toEqual(["pig-paynes-grey"]);
    document.getElementById("elsewhere")!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(openKeys()).toEqual([]);
  });
});

describe("with a mouse", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setup(true);
  });

  it("opens on a resting pointer and closes when it leaves the chart", () => {
    pointer(summary("alizarin-crimson"), "pointerenter");
    expect(openKeys()).toEqual([]);
    vi.advanceTimersByTime(HOVER_OPEN_MS);
    expect(openKeys()).toEqual(["pig-alizarin-crimson"]);
    pointer(root, "pointerleave");
    vi.advanceTimersByTime(HOVER_CLOSE_MS);
    expect(openKeys()).toEqual([]);
  });

  it("keeps a sheet a click pinned open when the pointer leaves", () => {
    pointer(summary("quinacridone-red"), "pointerenter");
    vi.advanceTimersByTime(HOVER_OPEN_MS);
    summary("quinacridone-red").click();
    expect(openKeys()).toEqual(["pig-quinacridone-red"]);
    pointer(root, "pointerleave");
    vi.advanceTimersByTime(HOVER_CLOSE_MS * 2);
    expect(openKeys()).toEqual(["pig-quinacridone-red"]);
    // A pinned sheet is not swapped by hovering another swatch.
    pointer(summary("hansa-yellow-light"), "pointerenter");
    vi.advanceTimersByTime(HOVER_OPEN_MS);
    expect(openKeys()).toEqual(["pig-quinacridone-red"]);
  });
});
