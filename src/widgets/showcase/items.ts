// The showcase's items (content/showcase.ts) resolved to what a slide shows:
// its id (the address #<id>), the kind's label, the name, the facts line, a
// line or two from the item's own description, the link to its page and its
// figure. All of it comes from the item's own content; nothing else is written
// here. An item that names nothing throws, naming the item: the build fails.

import { gallery } from "@content/gallery";
import type { ShowcaseItem } from "@content/showcase";
import { getAllArt, plateNo, yearSpan } from "@/content/art";
import { getNowParts } from "@/content/pages";
import { getPost } from "@/content/posts";
import { getWork } from "@/content/work";
import { isoDay } from "@/ui/format";
import { ART_PATH, artPath, postPath, workPath } from "@/seo/urls";

export type SlideFigure =
  | { type: "image"; src: string; width: number; height: number; alt: string }
  | { type: "missing"; todo: string }
  | { type: "now"; body: string }
  | { type: "paintings"; paintings: SlidePainting[] };

/** A painting on the art slide: its picture, its number on /art and its page. */
export type SlidePainting = { src: string; width: number; height: number; alt: string; no: string; href: string };

export type Slide = {
  /** The slide's address: "now", "work-<slug>", "post-<slug>", "art". */
  id: string;
  /** Older addresses that open it: the first slide of a kind takes that kind's old section id. */
  aliases: string[];
  kind: ShowcaseItem["kind"];
  /** "Now", "Work", "Writing", "Art". */
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

const LABELS: Record<ShowcaseItem["kind"], string> = { now: "Now", work: "Work", post: "Writing", art: "Art" };

/** The old home sections' addresses, each opened by the first slide of its kind. */
const OLD_ADDRESSES: Record<ShowcaseItem["kind"], string[]> = {
  now: [],
  work: ["work", "experience"],
  post: ["writing"],
  art: [],
};

/** How many paintings the art slide shows when its item names none. */
export const ART_SLIDE_COUNT = 3;

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
    case "art": {
      const all = getAllArt();
      const picked = item.slugs
        ? item.slugs.map((slug) => {
            const painting = all.find((p) => p.slug === slug);
            if (!painting) throw new Error(`${where}: no painting "${slug}" (content/art/${slug}.md)`);
            return painting;
          })
        : all.slice(0, ART_SLIDE_COUNT);
      if (picked.length < 3 || picked.length > 4) {
        throw new Error(`${where}: the art slide shows three or four paintings, not ${picked.length}`);
      }
      const span = yearSpan(all);
      return {
        id: "art",
        kind: "art",
        label,
        title: gallery.name,
        tab: gallery.name,
        facts: [all.length === 1 ? "1 painting" : `${all.length} paintings`, span],
        text: gallery.lead,
        href: ART_PATH,
        figure: {
          type: "paintings",
          paintings: picked.map((p) => ({
            src: p.image,
            width: p.pixels.width,
            height: p.pixels.height,
            alt: p.alt,
            no: plateNo(all.indexOf(p)),
            href: artPath(p.slug),
          })),
        },
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
