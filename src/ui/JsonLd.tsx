import { jsonLdHtml } from "@/seo/jsonld";

/** A JSON-LD block (src/seo/jsonld.ts). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }} />;
}
