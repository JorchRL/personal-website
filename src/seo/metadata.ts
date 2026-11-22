// Per-page metadata: title, description, canonical URL, Open Graph and the
// alternate forms (RSS, the markdown twin). Next.js replaces a parent's
// `openGraph` and `alternates` wholesale, so every page builds all of them here.
// The Open Graph image is the site's default (app/opengraph-image.tsx) unless
// the page passes its own `image`. A page's `openGraph.images` overrides an
// opengraph-image.tsx file in its segment, so a post or work page must pass
// the path of its own generated image.

import type { Metadata } from "next";
import { site } from "@content/site";
import { stripTodos } from "@/content/todos";

type Page = {
  title?: string;
  description?: string;
  path: string;
  /** The markdown twin's path, e.g. /blog/<slug>.md */
  markdown?: string;
  article?: { publishedTime: string; tags: string[] };
  /** The page's Open Graph image, e.g. /blog/<slug>/opengraph-image. */
  image?: string;
  /** Keep the page out of search indexes (a draft post). */
  noindex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  markdown,
  article,
  image = "/opengraph-image",
  noindex,
}: Page): Metadata {
  const cleanTitle = title ? stripTodos(title) || undefined : undefined;
  const cleanDescription = stripTodos(description ?? site.intro) || stripTodos(site.intro);
  return {
    ...(cleanTitle ? { title: cleanTitle } : {}),
    description: cleanDescription,
    alternates: {
      canonical: path,
      types: {
        "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} — Blog` }],
        ...(markdown ? { "text/markdown": markdown } : {}),
      },
    },
    openGraph: {
      siteName: site.name,
      locale: "en_GB",
      url: path,
      title: cleanTitle ?? site.name,
      description: cleanDescription,
      images: [{ url: image, width: 1200, height: 630, alt: cleanTitle ?? site.name }],
      ...(article
        ? {
            type: "article",
            publishedTime: article.publishedTime,
            authors: [site.url],
            tags: article.tags.map(stripTodos).filter(Boolean),
          }
        : { type: "website" }),
    },
    twitter: { card: "summary_large_image" },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
