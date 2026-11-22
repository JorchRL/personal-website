// The markdown twin of a work page. Served at /work/<slug>.md through a
// rewrite in next.config.ts.

import { getAllWork, getWork } from "@/content/work";
import { workMarkdown } from "@/seo/twins";
import { absoluteUrl, workPath } from "@/seo/urls";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWork().map((work) => ({ slug: work.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const work = getWork((await params).slug);
  if (!work) return new Response("Not found", { status: 404 });
  return new Response(workMarkdown(work), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Search engines index the HTML page, not its twin.
      Link: `<${absoluteUrl(workPath(work.slug))}>; rel="canonical"`,
    },
  });
}
