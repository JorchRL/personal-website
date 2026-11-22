// /about.md: the about page as markdown, for agents.

import { getAbout } from "@/content/pages";
import { aboutMarkdown } from "@/seo/twins";
import { absoluteUrl } from "@/seo/urls";

export const dynamic = "force-static";

export function GET() {
  return new Response(aboutMarkdown(getAbout()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${absoluteUrl("/about")}>; rel="canonical"`,
    },
  });
}
