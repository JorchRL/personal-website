// /rss.xml: every post, newest first, with its description. TODOs never reach
// a feed reader (stripTodos).

import { site } from "@content/site";
import type { PostMeta } from "@/content/posts";
import { stripTodos } from "@/content/todos";
import { absoluteUrl, postPath } from "./urls";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRss(posts: PostMeta[]): string {
  const feed = absoluteUrl("/rss.xml");
  const items = posts.map((post) => {
    const link = absoluteUrl(postPath(post.slug));
    const description = stripTodos(post.description);
    return [
      "    <item>",
      `      <title>${escapeXml(stripTodos(post.title))}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
      ...(description ? [`      <description>${escapeXml(description)}</description>`] : []),
      ...post.tags
        .map(stripTodos)
        .filter(Boolean)
        .map((tag) => `      <category>${escapeXml(tag)}</category>`),
      "    </item>",
    ].join("\n");
  });
  const latest = posts[0] ? new Date(posts[0].date).toUTCString() : undefined;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)} — Blog</title>`,
    `    <link>${absoluteUrl("/blog")}</link>`,
    `    <atom:link href="${feed}" rel="self" type="application/rss+xml"/>`,
    `    <description>${escapeXml(stripTodos(site.intro))}</description>`,
    "    <language>en</language>",
    ...(latest ? [`    <lastBuildDate>${latest}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
