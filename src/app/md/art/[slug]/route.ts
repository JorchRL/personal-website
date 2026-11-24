// The markdown twin of a painting's page. Served at /art/<slug>.md through a
// rewrite in next.config.ts.

import { getAllArt, getArt } from "@/content/art";
import { artMarkdown } from "@/seo/twins";
import { absoluteUrl, artPath } from "@/seo/urls";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArt().map((p) => ({ slug: p.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const painting = getArt((await params).slug);
  if (!painting) return new Response("Not found", { status: 404 });
  return new Response(artMarkdown(painting), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Search engines index the HTML page, not its twin.
      Link: `<${absoluteUrl(artPath(painting.slug))}>; rel="canonical"`,
    },
  });
}
