// The showcase's items (content/showcase.ts) resolved to what a slide shows:
// its id (the address #<id>), the kind's label, the name, the facts line, a
// line or two from the item's own description, the link to its page and its
// figure. All of it comes from the item's own content; nothing else is written
// here. An item that names nothing throws, naming the item: the build fails.

import type { ShowcaseItem } from "@content/showcase";
import { getNowParts } from "@/content/pages";
import { getPost } from "@/content/posts";
import { getWork } from "@/content/work";
import { isoDay } from "@/ui/format";
import { postPath, workPath } from "@/seo/urls";

export type SlideFigure =
  | { type: "image"; src: string; width: number; height: number; alt: string }
  | { type: "missing"; todo: string }
  | { type: "now"; body: string };

export type Slide = {
  /** The slide's address: "now", "work-<slug>", "post-<slug>". */
  id: string;
  /** Older addresses that open it: the first slide of a kind takes that kind's old section id. */
  aliases: string[];
  kind: ShowcaseItem["kind"];
  /** "Now", "Work", "Writing". */
  label: string;
  title: string;
  /** Its name in the tab bar. */
  tab: string;
  facts: string[];
  text?: string;
  note?: string;
  href?: string;
  figure: SlideFigure;
};

const LABELS: Record<ShowcaseItem["kind"], string> = { now: "Now", work: "Work", post: "Writing" };

/** The old home sections' addresses, each opened by the first slide of its kind. */
const OLD_ADDRESSES: Record<ShowcaseItem["kind"], string[]> = {
  now: [],
  work: ["work", "experience"],
  post: ["writing"],
};

/** The first sentences of a description, up to two, as it is written. */
export function lead(text: string, sentences = 2): string {
  const parts = text.trim().match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts) return text.trim();
  return parts.slice(0, sentences).join("").trim();
}

/** The showcase's items as slides, in order. */
export function resolveShowcase(items: ShowcaseItem[]): Slide[] {
  const seen = new Set<string>();
  return items.map((item, i) => {
    const where = `content/showcase.ts, item ${i + 1}`;
    const slide = resolve(item, where);
    if (seen.has(slide.id)) throw new Error(`${where}: ${slide.id} is in the showcase twice`);
    seen.add(slide.id);
    const first = !items.slice(0, i).some((other) => other.kind === item.kind);
    return {
      ...slide,
      aliases: first ? OLD_ADDRESSES[item.kind] : [],
      tab: item.tab ?? slide.tab,
      note: item.note,
    };
  });
}

function resolve(item: ShowcaseItem, where: string): Omit<Slide, "aliases" | "note"> {
  const label = LABELS[item.kind];
  switch (item.kind) {
    case "now": {
      const { dateline, body } = getNowParts();
      const month = dateline.replace(/\.$/, "");
      return { id: "now", kind: "now", label, title: month, tab: "Now", facts: [], figure: { type: "now", body } };
    }
    case "work": {
      const work = getWork(item.slug);
      if (!work) throw new Error(`${where}: no work page "${item.slug}" (content/work/${item.slug}.md)`);
      const figure: SlideFigure =
        work.figure && typeof work.figure === "object"
          ? {
              type: "image",
              src: work.figure.poster ?? work.figure.src,
              width: work.figure.width,
              height: work.figure.height,
              alt: work.figure.alt,
            }
          : {
              type: "missing",
              todo: work.figure ?? "TODO(jorge): a video, a playable build or a screenshot of this work",
            };
      return {
        id: `work-${work.slug}`,
        kind: "work",
        label,
        title: work.title,
        tab: work.title,
        facts: [work.role, work.period],
        text: lead(work.description),
        href: workPath(work.slug),
        figure,
      };
    }
    case "post": {
      const post = getPost(item.slug);
      if (!post) throw new Error(`${where}: no post "${item.slug}" (content/blog/${item.slug})`);
      return {
        id: `post-${post.slug}`,
        kind: "post",
        label,
        title: post.title,
        tab: post.title,
        facts: [isoDay(post.date), `${post.readingMinutes} min`],
        text: lead(post.description),
        href: postPath(post.slug),
        figure: post.cover
          ? // The frame crops every figure to one shape, so the size is only a hint.
            { type: "image", src: post.cover, width: 1600, height: 840, alt: "" }
          : { type: "image", src: `${postPath(post.slug)}/opengraph-image`, width: 1200, height: 630, alt: "" },
      };
    }
  }
}
