"use client";

// A deck: one slide at a time under a tab bar (the home page's showcase,
// src/widgets/showcase). The page's vertical scroll passes it by like any
// other block; the deck moves only when the visitor asks: a tab (click, tap,
// Enter, Space, the arrow keys, Home, End), previous and next, a sideways
// gesture on the deck (a two-finger swipe, shift and the wheel, a touch
// swipe), or an address that names a slide.
//
// The server renders every slide, with the bar as a list of in-page links:
// without JavaScript, from 768 px, the slides stack as a list; under 768 px
// they are a row to swipe through (CSS only). Where DECK_QUERY matches,
// globals.css lays the same markup out as the deck from the first paint, and
// this component turns the links into tabs:
//
// - The view clips sideways (overflow: hidden) and snaps to whole slides:
//   no wheel or trackpad gesture can scroll it by itself, so a vertical
//   gesture over it (even one with a little sideways drift) always scrolls
//   the page. A tab slides it with a smooth scroll (instant with reduced
//   motion). A gesture whose first move is mostly sideways (a two-finger
//   swipe, shift and the wheel, a finger with touch-action: pan-y) is the
//   deck's: it follows, then goes on to the next slide or back. The browser
//   can still scroll it to show a focused link or a find-in-page match.
// - The deck is as tall as the slide showing, and between two it blends
//   their heights in step with the slide (heightAt), so what follows the deck
//   moves with the slide instead of jumping. (The view itself keeps the
//   tallest slide's height, cut to that with clip-path: see frame.) After a
//   swipe, if the deck's top has scrolled out of sight above, the page brings
//   it back into view.
// - The tab bar marks the slide showing, and the address bar's hash follows
//   it (replaceState: no history entries).
// - Every panel stays in the page: never hidden or inert. Tab walks from one
//   slide into the next and the browser scrolls the deck to the focused link;
//   find-in-page scrolls it to a match; a screen reader reads every slide.
//   The deck then marks wherever it was scrolled to.

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { DECK_QUERY, activeAt, heightAt } from "./deckGeometry";

export type DeckSection = {
  id: string;
  no: string;
  title: string;
  /** A small label over the title in its tab ("Work", "Writing"). */
  kind?: string;
  /** Older addresses that open it. */
  aliases?: string[];
};

type Props = {
  /** The deck's slides, each a tab (named by `title`). */
  sections: DeckSection[];
  /** Each slide's content, rendered on the server, in the order of `sections`. */
  panels: ReactNode[];
  /** The tab bar's name. */
  label?: string;
};

/** A sideways gesture that goes this far (CSS px) turns to the next section; less goes back. */
const SWIPE_PX = 48;

const FOCUSABLE = "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function Deck({ sections, panels, label = "Sections" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const [on, setOn] = useState(false);
  const [active, setActive] = useState(0);
  // Panels with nothing to focus: they take a tab stop of their own.
  const [bare, setBare] = useState<boolean[]>([]);
  const ids = sections.map((s) => s.id).join(" ");
  // Other anchors that open a section ("experience" opens Work), as "alias=id".
  const aliases = sections.flatMap((s) => (s.aliases ?? []).map((a) => `${a}=${s.id}`)).join(" ");

  useEffect(() => {
    const query = window.matchMedia(DECK_QUERY);
    const update = () => setOn(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!on || !root) return;
    const panelEls = [...root.querySelectorAll<HTMLElement>(".deck-panel")];
    setBare(panelEls.map((p) => !p.querySelector(FOCUSABLE)));
    const named = new Map(
      aliases
        .split(" ")
        .filter(Boolean)
        .map((pair) => pair.split("=") as [string, string]),
    );
    const c = startDeck(root, ids.split(" "), setActive, named);
    controller.current = c;
    return () => {
      controller.current = null;
      c.stop();
    };
  }, [on, ids, aliases]);

  // Keep the marked tab in sight where the bar is wider than the screen.
  useEffect(() => {
    const nav = rootRef.current?.querySelector<HTMLElement>(".index");
    const tab = nav?.querySelectorAll<HTMLElement>("a")[active];
    if (!on || !nav || !tab) return;
    const left = tab.offsetLeft - 24;
    const right = tab.offsetLeft + tab.offsetWidth + 24;
    if (left < nav.scrollLeft) nav.scrollLeft = left;
    else if (right > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = right - nav.clientWidth;
  }, [on, active]);

  const step = (by: number) => {
    const to = active + by;
    if (to >= 0 && to < sections.length) select(to);
  };

  const select = (i: number) => {
    const hash = `#${sections[i].id}`;
    if (location.hash !== hash) history.replaceState(history.state, "", hash);
    setActive(i);
    controller.current?.go(i);
  };

  const tabs = useRef<(HTMLAnchorElement | null)[]>([]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (!on || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    select(i);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>, i: number) => {
    if (!on) return;
    const n = sections.length;
    const to =
      event.key === "ArrowRight"
        ? (i + 1) % n
        : event.key === "ArrowLeft"
          ? (i - 1 + n) % n
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? n - 1
              : -1;
    if (to >= 0) {
      event.preventDefault();
      select(to);
      tabs.current[to]?.focus();
    } else if (event.key === " ") {
      // A link scrolls the page on Space; a tab is selected.
      event.preventDefault();
      select(i);
    } else if (event.key === "Tab" && !event.shiftKey) {
      // From the tab into its panel, not into the first panel in the page.
      const panel = rootRef.current?.querySelectorAll<HTMLElement>(".deck-panel")[active];
      const target = panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      if (target) {
        event.preventDefault();
        target.focus();
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className="deck"
      data-deck={on ? "" : undefined}
      style={{ "--n": sections.length } as CSSProperties}
    >
      <nav className="index mono" aria-label={label}>
        <ol role={on ? "tablist" : undefined} aria-label={on ? label : undefined}>
          {sections.map((s, i) => (
            <li key={s.id} role={on ? "presentation" : undefined}>
              <a
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                href={`#${s.id}`}
                id={on ? `tab-${s.id}` : undefined}
                role={on ? "tab" : undefined}
                aria-selected={on ? i === active : undefined}
                aria-controls={on ? `panel-${s.id}` : undefined}
                tabIndex={on ? (i === active ? 0 : -1) : undefined}
                onClick={(e) => onClick(e, i)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <b>{s.no}</b>
                {s.kind && <span className="k"> {s.kind}</span>}
                <span className="nm">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
        {on && (
          <div className="deck-steps">
            <button type="button" onClick={() => step(-1)} disabled={active === 0} aria-label="Previous">
              <span className="arrow prev" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} disabled={active === sections.length - 1} aria-label="Next">
              <span className="arrow next" aria-hidden="true" />
            </button>
          </div>
        )}
        {on && <span className="deck-mark" aria-hidden="true" />}
      </nav>
      <div className="deck-view">
        <div className="deck-track">
          {panels.map((panel, i) => (
            <div
              key={sections[i].id}
              className="deck-panel"
              id={`panel-${sections[i].id}`}
              role={on ? "tabpanel" : undefined}
              aria-labelledby={on ? `tab-${sections[i].id}` : undefined}
              tabIndex={on ? (bare[i] ? 0 : -1) : undefined}
              data-current={i === active ? "" : undefined}
            >
              <div className="deck-sheet">{panel}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Controller = {
  /** Brings the deck to section `i` (sliding, unless reduced motion), and the deck into view. */
  go(i: number): void;
  stop(): void;
};

/** Runs the deck under `root`: its height, the marked tab, the hash, addresses and focus. */
function startDeck(
  root: HTMLElement,
  ids: string[],
  onActive: (i: number) => void,
  aliases: Map<string, string> = new Map(),
): Controller {
  /** The deck section an address names: its id, or one of its aliases. */
  const sectionOf = (hash: string) => {
    const name = decodeURIComponent(hash.slice(1));
    return ids.indexOf(aliases.get(name) ?? name);
  };
  const nav = root.querySelector<HTMLElement>(".index")!;
  const view = root.querySelector<HTMLElement>(".deck-view")!;
  const panels = [...view.querySelectorAll<HTMLElement>(".deck-panel")];
  const sheets = panels.map((p) => p.querySelector<HTMLElement>(".deck-sheet")!);
  const tabs = [...nav.querySelectorAll<HTMLElement>("li > a")].slice(0, ids.length);
  const mark = () => nav.querySelector<HTMLElement>(".deck-mark");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasScrollEnd = "onscrollend" in view;

  let heights: number[] = [];
  // Each tab's box in the bar: the mark sits on its lower edge.
  let tabBoxes: { x: number; y: number; w: number }[] = [];
  let active = -1;
  let settled = -1;
  // A slide this code started (a tab, an address): the section it goes to,
  // marked from the start rather than each section it passes.
  // It goes straight from where it was to that section: the deck's height
  // and the tab's mark move from their start to their end in step with it,
  // not up and down through the sections it passes.
  let seeking: { i: number; until: number; x0: number; h0: number; m0: { x: number; y: number; w: number } } | null =
    null;
  let shown = { h: 0, x: 0, y: 0, w: 0 };

  /** The mark between two tabs, `f` of the way: sliding along a row, or moving at half way to another row. */
  const between = (a: { x: number; y: number; w: number }, b: { x: number; y: number; w: number }, f: number) =>
    a.y === b.y ? { x: a.x + (b.x - a.x) * f, y: a.y, w: a.w + (b.w - a.w) * f } : f < 0.5 ? a : b;
  let frameId = 0;
  let measureId = 0;
  let idle = 0;
  let started = false;
  let width = 0;
  let swiped = false;
  // A sideways gesture the deck follows: where it started, and how far it has
  // gone. A gesture's first move decides its axis; a vertical one is the page's.
  let gesture: { axis: "x" | "y"; from: number; moved: number } | null = null;
  let gestureEnd = 0;
  let touch: { id: number; x: number; y: number; axis: "x" | "y" | null; from: number } | null = null;

  const position = () => (view.clientWidth ? view.scrollLeft / view.clientWidth : 0);
  const behavior = (): ScrollBehavior => (still.matches ? "instant" : "smooth");

  /**
   * Brings the deck's top into view if it has gone above the window, or, for
   * a tab or an address (`low`), if the deck starts low on the screen.
   */
  function showDeck(how: ScrollBehavior, low = true) {
    const top = root.getBoundingClientRect().top;
    if (top < 0 || (low && top > window.innerHeight * 0.6)) {
      window.scrollTo({ top: window.scrollY + top, behavior: how });
    }
  }

  function measure() {
    measureId = 0;
    heights = sheets.map((s) => s.offsetHeight);
    tabBoxes = tabs.map((t) => ({ x: t.offsetLeft, y: t.offsetTop + t.offsetHeight - 1, w: t.offsetWidth }));
    // A new width: back on the whole section it showed.
    if (view.clientWidth !== width) {
      const i = active >= 0 ? active : activeAt(position(), ids.length);
      if (width && !gesture && !touch) view.scrollTo({ left: i * view.clientWidth, behavior: "instant" });
      width = view.clientWidth;
    }
    frame();
  }

  function frame() {
    frameId = 0;
    // The view scrolls sideways only. The browser may have scrolled it down
    // to show something low in a section (a focused link, a find-in-page
    // match): it is somewhere in the part the view showed. Show that part
    // with the page's scroll instead, centred on the screen.
    if (view.scrollTop) {
      const down = view.scrollTop;
      const tall = view.clientHeight;
      view.scrollTop = 0;
      const top = view.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + down + tall / 2 - window.innerHeight / 2, behavior: "instant" });
    }
    const x = position();
    if (seeking && performance.now() > seeking.until) seeking = null;
    let h = heightAt(heights, x);
    let box = { x: 0, y: 0, w: 0 };
    if (tabBoxes.length) {
      const i = Math.min(Math.floor(x), tabBoxes.length - 1);
      const f = Math.min(Math.max(x - i, 0), 1);
      box = between(tabBoxes[i], tabBoxes[Math.min(i + 1, tabBoxes.length - 1)], f);
    }
    if (seeking && seeking.x0 !== seeking.i) {
      const t = Math.min(Math.max((x - seeking.x0) / (seeking.i - seeking.x0), 0), 1);
      h = seeking.h0 + ((heights[seeking.i] ?? h) - seeking.h0) * t;
      box = between(seeking.m0, tabBoxes[seeking.i] ?? box, t);
    }
    // The view keeps the tallest section's height, so the browser can show
    // anything in any section by scrolling the page; below the section showing
    // it is cut off (clip-path, which neither moves nor hides anything from the
    // browser), and what follows the deck is pulled up by as much.
    root.style.setProperty("--deck-cut", `${Math.max(0, Math.max(...heights, 0) - h)}px`);
    shown = { h, ...box };
    const m = mark();
    if (m) {
      m.style.translate = `${box.x}px ${box.y}px`;
      m.style.width = `${box.w}px`;
    }
    const now = seeking ? seeking.i : activeAt(x, ids.length);
    if (now !== active) {
      active = now;
      onActive(now);
      if (started && location.hash !== `#${ids[now]}`) {
        history.replaceState(history.state, "", `#${ids[now]}`);
      }
    }
  }

  // The deck came to rest. After a swipe to another section, show its start
  // if the deck's top is out of sight. (Not when the browser moved it to show
  // a focused link or a find-in-page match: that stays where the browser put it.)
  function settle() {
    seeking = null;
    frame();
    if (active !== settled) {
      if (swiped) showDeck(behavior(), false);
      settled = active;
    }
    swiped = false;
  }

  function go(i: number) {
    seeking = {
      i,
      until: performance.now() + 1500,
      x0: position(),
      h0: shown.h,
      m0: { x: shown.x, y: shown.y, w: shown.w },
    };
    view.scrollTo({ left: i * view.clientWidth, behavior: behavior() });
    showDeck(behavior());
    settled = i;
    frame();
  }

  /** Follows a sideways gesture: up to one section either way, snapping off meanwhile. */
  function follow(from: number, moved: number) {
    const w = view.clientWidth;
    const max = (ids.length - 1) * w;
    view.dataset.following = "";
    view.scrollLeft = Math.min(Math.max(from + moved, from - w, 0), from + w, max);
  }

  /** The gesture ended: on to the next section the way it went, or back if it barely moved. */
  function release(from: number, moved: number) {
    delete view.dataset.following;
    swiped = true;
    const w = view.clientWidth;
    const here = Math.round(from / w);
    const to = Math.abs(moved) >= SWIPE_PX ? here + Math.sign(moved) : here;
    const i = Math.min(Math.max(to, 0), ids.length - 1);
    view.scrollTo({ left: i * w, behavior: behavior() });
  }

  // The wheel and the trackpad. A gesture whose first move is mostly sideways
  // is the deck's: it follows, and the event's default (the browser's back or
  // forward swipe) is cancelled. Any other gesture is left alone, so the page
  // scrolls as usual. Shift and the wheel count as sideways.
  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return; // a pinch: zoom
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.clientWidth : 1;
    let dx = event.deltaX * unit;
    let dy = event.deltaY * unit;
    if (event.shiftKey && !dx) [dx, dy] = [dy, 0];
    if (!gesture) {
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      gesture = { axis: Math.abs(dx) > Math.abs(dy) ? "x" : "y", from: view.scrollLeft, moved: 0 };
    }
    window.clearTimeout(gestureEnd);
    gestureEnd = window.setTimeout(() => {
      if (gesture?.axis === "x") release(gesture.from, gesture.moved);
      gesture = null;
    }, 160);
    if (gesture.axis === "y") return;
    event.preventDefault();
    gesture.moved += dx;
    seeking = null;
    follow(gesture.from, gesture.moved);
  };

  // A finger: the browser pans the page vertically (touch-action: pan-y); a
  // sideways drag moves the deck with it.
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || touch) return;
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null, from: view.scrollLeft };
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!touch || event.pointerId !== touch.id) return;
    const dx = event.clientX - touch.x;
    const dy = event.clientY - touch.y;
    if (!touch.axis && Math.hypot(dx, dy) > 8) touch.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (touch.axis === "x") {
      seeking = null;
      follow(touch.from, -dx);
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!touch || event.pointerId !== touch.id) return;
    if (touch.axis === "x") release(touch.from, touch.x - event.clientX);
    touch = null;
  };
  const onPointerCancel = () => {
    if (touch?.axis === "x") release(touch.from, 0);
    touch = null;
  };

  const onScroll = () => {
    if (!frameId) frameId = requestAnimationFrame(frame);
    if (!hasScrollEnd) {
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 140);
    }
  };

  // Focus moved into a section (Tab from the last link of the one before):
  // the browser has scrolled the deck to it; make it a whole section.
  const onFocus = (event: FocusEvent) => {
    const i = panels.findIndex((p) => p.contains(event.target as Node));
    if (i >= 0 && i !== activeAt(position(), ids.length)) {
      view.scrollTo({ left: i * view.clientWidth, behavior: "instant" });
    }
  };

  // An address that names a section (a link to /#writing on the page, back
  // or forward): show it.
  const onHash = () => {
    const i = sectionOf(location.hash);
    if (i >= 0) go(i);
  };

  const scheduleMeasure = () => {
    if (!measureId) measureId = requestAnimationFrame(measure);
  };
  // The sections' heights, and the window's width (the deck's).
  const resize = new ResizeObserver(scheduleMeasure);
  sheets.forEach((s) => resize.observe(s));
  window.addEventListener("resize", scheduleMeasure);
  document.fonts?.ready.then(scheduleMeasure);

  view.addEventListener("scroll", onScroll, { passive: true });
  view.addEventListener("wheel", onWheel, { passive: false });
  view.addEventListener("pointerdown", onPointerDown);
  view.addEventListener("pointermove", onPointerMove);
  view.addEventListener("pointerup", onPointerUp);
  view.addEventListener("pointercancel", onPointerCancel);
  if (hasScrollEnd) view.addEventListener("scrollend", settle);
  view.addEventListener("focusin", onFocus);
  window.addEventListener("hashchange", onHash);
  window.addEventListener("popstate", onHash);

  // Opened on a section (/#writing, or an alias): that section, with the
  // deck's top in view.
  const start = sectionOf(location.hash);
  measure();
  root.dataset.ready = "";
  if (start >= 0) {
    view.scrollTo({ left: start * view.clientWidth, behavior: "instant" });
    frame();
    showDeck("instant");
  }
  settled = active;
  started = true;

  return {
    go,
    stop() {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(measureId);
      window.clearTimeout(idle);
      resize.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      view.removeEventListener("scroll", onScroll);
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("pointerdown", onPointerDown);
      view.removeEventListener("pointermove", onPointerMove);
      view.removeEventListener("pointerup", onPointerUp);
      view.removeEventListener("pointercancel", onPointerCancel);
      window.clearTimeout(gestureEnd);
      delete view.dataset.following;
      view.removeEventListener("scrollend", settle);
      view.removeEventListener("focusin", onFocus);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
      root.style.removeProperty("--deck-cut");
      delete root.dataset.ready;
    },
  };
}
