import type { MetadataRoute } from "next";
import { SEARCH_CRAWLERS } from "@/seo/crawlers";
import { absoluteUrl } from "@/seo/urls";

export default function robots(): MetadataRoute.Robots {
  // /md/ is where the markdown twins are rendered; they are served at /blog/<slug>.md.
  const rule = { allow: "/", disallow: "/md/" };
  return {
    rules: [{ userAgent: SEARCH_CRAWLERS, ...rule }, { userAgent: "*", ...rule }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
