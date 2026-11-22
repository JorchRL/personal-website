// The markdown twin of a post. Served at /blog/<slug>.md through a rewrite in
// next.config.ts (a route segment cannot end in ".md" after a dynamic name).

import { getPagePost, getPagePosts } from "@/content/posts";
import { postMarkdown } from "@/seo/twins";
import { absoluteUrl, postPath } from "@/seo/urls";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPagePosts().map((post) => ({ slug: post.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPagePost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  return new Response(postMarkdown(post), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Search engines index the HTML page, not its twin.
      Link: `<${absoluteUrl(postPath(post.slug))}>; rel="canonical"`,
      // A draft is read at its address, never indexed.
      ...(post.draft ? { "X-Robots-Tag": "noindex" } : {}),
    },
  });
}
