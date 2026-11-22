// /cv.md: the CV as markdown, for agents (src/seo/twins.ts).

import { getCv } from "@/content/cv";
import { cvMarkdown } from "@/seo/twins";
import { absoluteUrl } from "@/seo/urls";

export const dynamic = "force-static";

export function GET() {
  return new Response(cvMarkdown(getCv()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${absoluteUrl("/cv")}>; rel="canonical"`,
    },
  });
}
