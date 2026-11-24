import { notFound } from "next/navigation";
import { site } from "@content/site";
import { getAllArt, getArt, knownYear, titlePlain } from "@/content/art";
import { ogContentType, ogImage, ogPicture, ogSize } from "@/seo/ogImage";

export const alt = `A painting by ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getAllArt().map((p) => ({ slug: p.slug }));
}

// The link preview: the painting itself beside its title.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const painting = getArt((await params).slug);
  if (!painting) notFound();
  return ogImage({
    // "Art · WC-2026-001 · 2026", and "Fan art" when it is.
    label: ["Art", knownYear(painting), painting.fanArt && "Fan art"].filter(Boolean).join(" · "),
    title: titlePlain(painting),
    picture: await ogPicture(painting.image, painting.pixels),
  });
}
