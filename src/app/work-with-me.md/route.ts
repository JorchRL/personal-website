// /work-with-me.md: the page for contract clients as markdown, for agents.

import { workWithMeMarkdown } from "@/seo/twins";
import { absoluteUrl } from "@/seo/urls";

export const dynamic = "force-static";

export function GET() {
  return new Response(workWithMeMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${absoluteUrl("/work-with-me")}>; rel="canonical"`,
    },
  });
}
