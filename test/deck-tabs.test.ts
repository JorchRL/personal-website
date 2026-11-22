// @vitest-environment jsdom
// The deck's tab bar once the deck is on: the tabs pattern (tablist, tabs
// with aria-selected and aria-controls, tabpanels), arrow keys, the hash, a
// page opened on a section, and a sideways scroll of the deck marking its
// section. jsdom has no layout: the deck's view is given a width of 1000 px
// and its sideways scroll is kept by hand; the rest is checked in a browser
// (pnpm verify, step 6).

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Deck, type DeckSection } from "@/widgets/Deck";
import { DECK_QUERY } from "@/widgets/deckGeometry";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SECTIONS: DeckSection[] = [
  { id: "experience", no: "01", title: "Experience" },
  { id: "work", no: "02", title: "Selected work", aliases: ["projects"] },
  { id: "now", no: "03", title: "Now" },
];
const panels = SECTIONS.map((s) =>
  createElement(
    "section",
    { key: s.id, id: s.id },
    createElement("h2", null, s.title),
    s.id === "now" ? null : createElement("a", { href: `/${s.id}` }, "More"),
  ),
);

let container: HTMLDivElement;
let root: Root;
let scrollY = 0;
/** The behaviour of the last sideways scroll the deck asked for. */
let lastBehavior: ScrollBehavior | undefined;
const lefts = new WeakMap<Element, number>();

function stubBrowser(deck: boolean, reduce = false) {
  scrollY = 0;
  lastBehavior = undefined;
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === DECK_QUERY ? deck : query.includes("reduce") ? reduce : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (f: FrameRequestCallback) => setTimeout(() => f(0), 0) as unknown as number);
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => scrollY });
  window.scrollTo = ((options: ScrollToOptions) => {
    scrollY = options.top ?? scrollY;
    window.dispatchEvent(new Event("scroll"));
  }) as typeof window.scrollTo;
  // The deck's view: 1000 px wide, scrolled sideways by hand.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("deck-view") ? 1000 : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
    configurable: true,
    get(this: HTMLElement) {
      return lefts.get(this) ?? 0;
    },
    set(this: HTMLElement, value: number) {
      lefts.set(this, value);
    },
  });
  HTMLElement.prototype.scrollTo = function (this: HTMLElement, options?: ScrollToOptions | number) {
    if (typeof options !== "object") return;
    lastBehavior = options.behavior;
    if (options.left !== undefined) this.scrollLeft = options.left;
    this.dispatchEvent(new Event("scroll"));
  } as typeof HTMLElement.prototype.scrollTo;
}

/** Lets the deck's next frame run. */
const nextFrame = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

const view = () => container.querySelector<HTMLElement>(".deck-view")!;

async function render() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(createElement(Deck, { sections: SECTIONS, panels, label: "Showcase" })));
}

const tabs = () => [...container.querySelectorAll<HTMLAnchorElement>("[role=tab]")];
const selected = () => tabs().findIndex((t) => t.getAttribute("aria-selected") === "true");

beforeEach(() => {
  history.replaceState(null, "", "/");
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  for (const name of ["clientWidth", "scrollLeft", "scrollTo"]) delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
});

describe("the deck's tabs", () => {
  it("stay in-page links where the deck is off (no JavaScript, narrow)", async () => {
    stubBrowser(false);
    await render();
    expect(container.querySelector("[role=tablist]")).toBeNull();
    const links = [...container.querySelectorAll(".index a")].map((a) => a.getAttribute("href"));
    expect(links).toEqual(["#experience", "#work", "#now"]);
    expect(container.querySelector("[tabindex]")).toBeNull();
  });

  it("follow the tabs pattern once the deck is on", async () => {
    stubBrowser(true);
    await render();
    expect(container.querySelector("[role=tablist]")).not.toBeNull();
    expect(tabs()).toHaveLength(3);
    // Previous and next: the first slide has no previous.
    const [prev, next] = [...container.querySelectorAll<HTMLButtonElement>(".deck-steps button")];
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    for (const [i, tab] of tabs().entries()) {
      const panel = document.getElementById(tab.getAttribute("aria-controls")!);
      expect(panel?.getAttribute("role")).toBe("tabpanel");
      expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
      expect(panel?.querySelector("section")?.id).toBe(SECTIONS[i].id);
    }
    expect(selected()).toBe(0);
    expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    // A panel with nothing to focus takes a tab stop; the others are reached through their links.
    expect(document.getElementById("panel-now")?.tabIndex).toBe(0);
    expect(document.getElementById("panel-work")?.tabIndex).toBe(-1);
    // Every panel stays in the page: Tab, find-in-page and screen readers reach every section.
    expect(container.querySelector(".deck-panel[hidden], [inert], .deck-panel[aria-hidden]")).toBeNull();
    // The section showing is marked current: before the code runs, only it gives the deck its height.
    const current = [...container.querySelectorAll(".deck-panel")].map((p) => p.hasAttribute("data-current"));
    expect(current).toEqual([true, false, false]);
  });

  it("move with the arrow keys, Home and End, sliding the deck, and the hash follows without new history", async () => {
    stubBrowser(true);
    await render();
    const length = history.length;
    tabs()[0].focus();
    await act(async () => {
      tabs()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(selected()).toBe(1);
    expect(document.activeElement).toBe(tabs()[1]);
    expect(location.hash).toBe("#work");
    expect(view().scrollLeft).toBe(1000);
    expect(lastBehavior).toBe("smooth");
    await act(async () => {
      tabs()[1].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    });
    expect(selected()).toBe(2);
    await act(async () => {
      tabs()[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(selected()).toBe(0);
    expect(view().scrollLeft).toBe(0);
    expect(location.hash).toBe("#experience");
    expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(history.length).toBe(length);
  });

  it("step with previous and next", async () => {
    stubBrowser(true);
    await render();
    const buttons = () => [...container.querySelectorAll<HTMLButtonElement>(".deck-steps button")];
    await act(async () => buttons()[1].click());
    expect(selected()).toBe(1);
    expect(view().scrollLeft).toBe(1000);
    await act(async () => buttons()[1].click());
    expect(selected()).toBe(2);
    expect(buttons()[1].disabled).toBe(true);
    await act(async () => buttons()[0].click());
    expect(selected()).toBe(1);
  });

  it("switch at once with reduced motion", async () => {
    stubBrowser(true, true);
    await render();
    await act(async () => {
      tabs()[2].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
    });
    expect(view().scrollLeft).toBe(2000);
    expect(lastBehavior).toBe("instant");
  });

  it("select a section when clicked, naming it in the address without a new history entry", async () => {
    stubBrowser(true);
    await render();
    const length = history.length;
    await act(async () => {
      tabs()[2].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
    });
    expect(location.hash).toBe("#now");
    expect(history.length).toBe(length);
    expect(selected()).toBe(2);
    expect(view().scrollLeft).toBe(2000);
  });

  it("follow a sideways swipe to the next section, and leave a vertical gesture to the page", async () => {
    stubBrowser(true);
    await render();
    const wheel = (deltaX: number, deltaY: number) => {
      const event = new WheelEvent("wheel", { deltaX, deltaY, bubbles: true, cancelable: true });
      view().dispatchEvent(event);
      return event.defaultPrevented;
    };
    const gestureEnds = () =>
      act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 220));
      });
    // Mostly vertical, with a little sideways drift: the page's, untouched.
    expect(wheel(20, 200)).toBe(false);
    expect(wheel(30, 150)).toBe(false);
    await gestureEnds();
    expect(view().scrollLeft).toBe(0);
    expect(selected()).toBe(0);
    // Mostly sideways: the deck's; it follows, then goes on to the next section.
    expect(wheel(60, 4)).toBe(true);
    expect(view().scrollLeft).toBe(60);
    expect(wheel(40, 0)).toBe(true);
    await gestureEnds();
    await nextFrame();
    expect(view().scrollLeft).toBe(1000);
    expect(selected()).toBe(1);
    expect(location.hash).toBe("#work");
    // A nudge: back where it was.
    wheel(20, 0);
    await gestureEnds();
    expect(view().scrollLeft).toBe(1000);
    // Never more than one section a gesture.
    for (let i = 0; i < 30; i++) wheel(-200, 0);
    expect(view().scrollLeft).toBe(0);
    await gestureEnds();
    await nextFrame();
    expect(selected()).toBe(0);
  });

  it("mark the section the browser scrolls the deck to (a focused link, a find), and ignore the page's own scroll", async () => {
    stubBrowser(true);
    await render();
    // The page scrolls down: nothing changes.
    await act(async () => {
      window.scrollTo({ top: 1500 });
    });
    await nextFrame();
    expect(selected()).toBe(0);
    expect(view().scrollLeft).toBe(0);
    expect(location.hash).toBe("");
    // A sideways swipe on the deck, two sections along.
    await act(async () => {
      view().scrollLeft = 2000;
      view().dispatchEvent(new Event("scroll"));
    });
    await nextFrame();
    expect(selected()).toBe(2);
    expect(location.hash).toBe("#now");
  });

  it("open the page on the section its hash names", async () => {
    history.replaceState(null, "", "/#now");
    stubBrowser(true);
    await render();
    expect(view().scrollLeft).toBe(2000);
    expect(selected()).toBe(2);
  });

  it("open the page on a section an alias names, and go there on a hash change", async () => {
    history.replaceState(null, "", "/#projects");
    stubBrowser(true);
    await render();
    expect(view().scrollLeft).toBe(1000);
    expect(selected()).toBe(1);
    await act(async () => {
      history.replaceState(null, "", "/#experience");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    await nextFrame();
    expect(selected()).toBe(0);
    await act(async () => {
      history.replaceState(null, "", "/#projects");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    await nextFrame();
    expect(selected()).toBe(1);
  });

  it("take Tab from the tab into the selected panel", async () => {
    stubBrowser(true);
    await render();
    await act(async () => {
      tabs()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    await act(async () => {
      tabs()[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    });
    expect(document.activeElement?.getAttribute("href")).toBe("/work");
  });
});
