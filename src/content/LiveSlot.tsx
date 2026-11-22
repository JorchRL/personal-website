"use client";

// A post's own interactive piece (src/content/mdx-components.tsx,
// postComponent): shows its static face, and when it comes into view, loads
// the live part and mounts it in the face's place. (Into view, not near it:
// its code must not load with the page before anyone sees it.) If loading
// fails, or the live part throws while mounting or later, the face stays or
// comes back. The face is in the HTML either way.

import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/** The live part's module: a client component as its default export. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LivePart = { default: ComponentType<any> };

type Props = {
  load: () => Promise<LivePart>;
  face: ReactNode;
  /** The props for the live part: the attributes written in the post. */
  props?: Record<string, unknown>;
};

type Live = LivePart["default"];

export function LiveSlot({ load, face, props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<{ Part: Live } | null>(null);

  useEffect(() => {
    const cell = ref.current;
    if (!cell) return;
    let cancelled = false;
    const start = () => {
      load().then(
        (part) => {
          if (!cancelled) setLive({ Part: part.default });
        },
        () => {
          // The face stays: a figure never breaks the page.
        },
      );
    };
    if (typeof IntersectionObserver === "undefined") {
      start();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: "0px" },
    );
    observer.observe(cell);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [load]);

  return (
    <div ref={ref} className="live-slot" data-live={live ? "live" : "face"}>
      {live ? (
        <FaceOnError face={face}>
          <live.Part {...props} />
        </FaceOnError>
      ) : (
        face
      )}
    </div>
  );
}

class FaceOnError extends Component<{ face: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.face : this.props.children;
  }
}
