import { notFound } from "next/navigation";
import { site } from "@content/site";
import { getPagePost, getPagePosts } from "@/content/posts";
import { formatDate } from "@/ui/format";
import { ogContentType, ogImage, ogSize } from "@/seo/ogImage";

export const alt = `A post by ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getPagePosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPagePost((await params).slug);
  if (!post) notFound();
  return ogImage({ label: `Blog · ${formatDate(post.date)}`, title: post.title });
}
