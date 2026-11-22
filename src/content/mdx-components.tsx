// The components an .mdx post can use, without imports: this map is the only
// way code reaches a post (Mdx.tsx refuses `import`, and any name not listed
// here). Everything renders at build time; the HTML holds every word.
//
// - <Figure src="/blog/<slug>/x.png" alt="…" caption="…" />: a picture as a
//   figure (width and height read from the file under public/).
// - <Aside>…</Aside>: a side note, set off from the text.
// - <Demo caption="…">…</Demo>: a framed slot for a post's own component.
//
// Figure and Demo are numbered in order (Fig. 1, Fig. 2…) unless given a
// `mark`. A post's own interactive component: see postComponents below.

import { readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentType, ReactNode } from "react";
import { LiveSlot, type LivePart } from "./LiveSlot";
import { TodoText } from "./TodoText";
import { DialFace, LoopFace, ScaffoldFace } from "./blog-components/learning-by-guided-building-with-ai/Faces";
import { scaffoldComesDown, theDial, theLoop } from "./blog-components/learning-by-guided-building-with-ai/load";

// Each component takes its own props; MDX hands them over as written in the post.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Component = (props: any) => ReactNode;

function Figure({
  src,
  alt,
  caption,
  mark,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: string;
  mark?: string;
  width?: number;
  height?: number;
}) {
  const size = width && height ? { width, height } : imageSize(src);
  return (
    <figure className="mdx-figure">
      <div className="frame">
        {/* A plain <img>, as in a markdown post: next/image would add client code. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={size.width} height={size.height} loading="lazy" decoding="async" />
      </div>
      {(caption || mark) && (
        <figcaption className="mdx-cap">
          {mark && <b>{mark}</b>} {caption && <TodoText text={caption} />}
        </figcaption>
      )}
    </figure>
  );
}

function Aside({ children }: { children: ReactNode }) {
  return (
    <div className="mdx-aside" role="note">
      <p className="label">Aside</p>
      {children}
    </div>
  );
}

function Demo({ caption, mark, children }: { caption?: string; mark?: string; children: ReactNode }) {
  return (
    <figure className="mdx-demo">
      <div className="frame">{children}</div>
      {(caption || mark) && (
        <figcaption className="mdx-cap">
          {mark && <b>{mark}</b>} {caption && <TodoText text={caption} />}
        </figcaption>
      )}
    </figure>
  );
}

/** What every post can use. */
export const mdxComponents = { Figure, Aside, Demo } satisfies Record<string, Component>;

/**
 * A post's own interactive component, wrapped so that its code loads only on
 * that post and only when it scrolls into view (LiveSlot). What is written
 * between its tags in the post is its static face: what shows first, and all
 * a reader without JavaScript sees.
 *
 *   <Demo caption="…">
 *     <WaveSum frequency={2}>
 *       ![Two waves and their sum](/blog/<slug>/wave-sum.png)
 *     </WaveSum>
 *   </Demo>
 *
 * With `Face` (a server component), the face is rendered from it instead,
 * and the post writes the component with no children: `<TheLoop />`. Its
 * plain text for the twin then comes from src/content/blog-components/plain.ts.
 */
export function postComponent<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
  Face?: ComponentType<Record<string, unknown>>,
) {
  function PostComponent({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) {
    const face = Face ? <Face {...props} /> : <>{children}</>;
    return <LiveSlot load={load as unknown as () => Promise<LivePart>} face={face} props={props} />;
  }
  return PostComponent;
}

/**
 * Each post's own components, by the post's slug. To add one:
 * 1. src/content/blog-components/<slug>/Name.tsx: "use client", a default export.
 * 2. src/content/blog-components/<slug>/load.ts: "use client" and
 *    `export const name = () => import("./Name");`
 * 3. Here: `"<slug>": { Name: postComponent(name) },` (import `name` from that load.ts).
 */
export const postComponents: Record<string, Record<string, Component>> = {
  "learning-by-guided-building-with-ai": {
    TheLoop: postComponent(theLoop, LoopFace),
    ScaffoldComesDown: postComponent(scaffoldComesDown, ScaffoldFace),
    TheDial: postComponent(theDial, DialFace),
  },
};

/** The components a post can use: the shared ones and its own. */
export function componentsFor(slug: string): Record<string, Component> {
  return { ...mdxComponents, ...postComponents[slug] };
}

/** Width and height of a PNG, GIF, JPEG or WebP under public/, read from its header. */
function imageSize(src: string): { width: number; height: number } {
  const file = path.join(process.cwd(), "public", decodeURIComponent(src.replace(/[?#].*$/, "")));
  let bytes: Buffer;
  try {
    bytes = readFileSync(file);
  } catch {
    throw new Error(`<Figure src="${src}">: no such file in public/.`);
  }
  const size = headerSize(bytes);
  if (!size) throw new Error(`<Figure src="${src}">: give its width and height (width={…} height={…}).`);
  return size;
}

function headerSize(b: Buffer): { width: number; height: number } | null {
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.toString("ascii", 0, 3) === "GIF") return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let at = 2;
    while (at < b.length) {
      if (b[at] !== 0xff) return null;
      const marker = b[at + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: b.readUInt16BE(at + 7), height: b.readUInt16BE(at + 5) };
      }
      at += 2 + b.readUInt16BE(at + 2);
    }
  }
  return null;
}
