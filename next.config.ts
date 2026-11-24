import type { NextConfig } from "next";
import { mdxPostSlugs } from "./src/content/posts";

const OLD_BLOG = { type: "host" as const, value: "blog.jrlgs.dev" };

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // AVIF first (about 40% smaller than WebP for the paintings), WebP for browsers without it.
  images: { formats: ["image/avif", "image/webp"] },
  // The old site's project pages, still linked from CVs and LinkedIn.
  async redirects() {
    return [
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/projects/edtech-platform", destination: "/work/whiz-study", permanent: true },
      { source: "/projects/spatial-collaboration", destination: "/work/twinteraction", permanent: true },
      { source: "/projects/metroidvania-game", destination: "/work", permanent: true },
      { source: "/projects/racing-simulator", destination: "/work", permanent: true },
      // The old blog's host, for the day its DNS points here, in one hop each
      // (the first match wins, so the order matters): its sitemap, robots.txt
      // and feed go to the main host's; every post moves to /blog/<slug>; any
      // deeper path (the old /series/…, /tag/…, /page/… pages) goes to /blog.
      ...["/sitemap.xml", "/robots.txt", "/rss.xml"].map((file) => ({
        source: file,
        has: [OLD_BLOG],
        destination: `https://jrlgs.dev${file}`,
        statusCode: 301 as const,
      })),
      { source: "/", has: [OLD_BLOG], destination: "https://jrlgs.dev/blog", statusCode: 301 },
      { source: "/:slug", has: [OLD_BLOG], destination: "https://jrlgs.dev/blog/:slug", statusCode: 301 },
      { source: "/:slug/:rest+", has: [OLD_BLOG], destination: "https://jrlgs.dev/blog", statusCode: 301 },
    ];
  },
  // The markdown twins: /blog/<slug>.md, /work/<slug>.md and /art/<slug>.md are served by the
  // route handlers under src/app/md/. An .mdx post's page is rendered by
  // src/app/mdx/blog/[slug], so its components' code stays off markdown posts.
  async rewrites() {
    return [
      { source: "/blog/:slug.md", destination: "/md/blog/:slug" },
      { source: "/work/:slug.md", destination: "/md/work/:slug" },
      { source: "/art/:slug.md", destination: "/md/art/:slug" },
      ...mdxPostSlugs().map((slug) => ({ source: `/blog/${slug}`, destination: `/mdx/blog/${slug}` })),
    ];
  },
};

export default nextConfig;
