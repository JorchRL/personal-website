// @vitest-environment jsdom
// LiveSlot: the face shows until the live part has loaded and mounted, and comes
// back if loading or mounting fails. A test-only live part stands in for a
// post's own interactive piece.

import { act, createElement, useEffect, useState, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveSlot, type LivePart } from "@/content/LiveSlot";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// A stand-in IntersectionObserver the test drives by hand.
class FakeObserver {
  static last: FakeObserver | undefined;
  options: IntersectionObserverInit | undefined;
  targets: Element[] = [];
  disconnected = false;
  constructor(
    private callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.options = options;
    FakeObserver.last = this;
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
  /** The cell scrolls into (or near) view. */
  enter() {
    const entries = this.targets.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry);
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

const face = createElement("p", null, "The face");
const Live: ComponentType<{ size?: string }> = ({ size }) =>
  createElement("p", null, size ? `The live part, ${size}` : "The live part");

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  FakeObserver.last = undefined;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function render(load: () => Promise<LivePart>, props?: Record<string, unknown>) {
  await act(async () => root.render(createElement(LiveSlot, { load, face, props })));
}

/** Lets the dynamic import resolve and React commit. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("LiveSlot", () => {
  it("shows the face and loads nothing until the cell comes into view", async () => {
    const load = vi.fn(async () => ({ default: Live }));
    await render(load);
    expect(container.textContent).toBe("The face");
    expect(load).not.toHaveBeenCalled();
    expect(FakeObserver.last?.options?.rootMargin).toBe("0px");
  });

  it("mounts the live part in place of the face once it is in view", async () => {
    const load = vi.fn(async () => ({ default: Live }));
    await render(load);
    await act(async () => FakeObserver.last!.enter());
    await settle();
    expect(load).toHaveBeenCalledTimes(1);
    expect(container.textContent).toBe("The live part");
    expect(FakeObserver.last!.disconnected).toBe(true);
  });

  it("keeps the face while the live part is still loading", async () => {
    let resolve: (part: LivePart) => void = () => {};
    const load = () => new Promise<LivePart>((r) => (resolve = r));
    await render(load);
    await act(async () => FakeObserver.last!.enter());
    expect(container.textContent).toBe("The face");
    await act(async () => resolve({ default: Live }));
    expect(container.textContent).toBe("The live part");
  });

  it("passes the post's attributes to the live part", async () => {
    await render(async () => ({ default: Live }), { size: "full size" });
    await act(async () => FakeObserver.last!.enter());
    await settle();
    expect(container.textContent).toBe("The live part, full size");
  });

  it("keeps the face when loading fails", async () => {
    await render(async () => {
      throw new Error("chunk failed to load");
    });
    await act(async () => FakeObserver.last!.enter());
    await settle();
    expect(container.textContent).toBe("The face");
  });

  it("brings the face back when the live part throws while mounting", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const Broken = () => {
      throw new Error("no WebGL");
    };
    await render(async () => ({ default: Broken }));
    await act(async () => FakeObserver.last!.enter());
    await settle();
    expect(container.textContent).toBe("The face");
    expect(logged).toHaveBeenCalled();
  });

  it("brings the face back when the live part throws in an effect (a lost GL context)", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const FailsLater = () => {
      useEffect(() => {
        throw new Error("webglcontextlost");
      }, []);
      return createElement("canvas");
    };
    await render(async () => ({ default: FailsLater }));
    await act(async () => FakeObserver.last!.enter());
    await settle();
    expect(container.textContent).toBe("The face");
    expect(container.querySelector("canvas")).toBeNull();
    expect(logged).toHaveBeenCalled();
  });

  it("brings the face back when the live part gives up later, from a state update (a lost GL context event)", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    let loseContext: () => void = () => {};
    const GivesUp = () => {
      const [, setFailed] = useState(false);
      useEffect(() => {
        loseContext = () =>
          setFailed(() => {
            throw new Error("webglcontextlost");
          });
      }, []);
      return createElement("canvas");
    };
    await render(async () => ({ default: GivesUp }));
    await act(async () => FakeObserver.last!.enter());
    await settle();
    expect(container.querySelector("canvas")).not.toBeNull();
    await act(async () => loseContext());
    expect(container.textContent).toBe("The face");
    expect(container.querySelector("canvas")).toBeNull();
    expect(logged).toHaveBeenCalled();
  });

  it("loads at once where IntersectionObserver does not exist", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const load = vi.fn(async () => ({ default: Live }));
    await render(load);
    await settle();
    expect(load).toHaveBeenCalledTimes(1);
    expect(container.textContent).toBe("The live part");
  });
});
