import { getAllPosts } from "@/content/posts";
import { getAllWork } from "@/content/work";
import { buildLlmsTxt } from "@/seo/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(getAllPosts(), getAllWork()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
