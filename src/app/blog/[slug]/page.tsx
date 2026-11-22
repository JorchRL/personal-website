import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPagePost, getPagePosts } from "@/content/posts";
import { Markdown } from "@/content/Markdown";
import { PostArticle, postMetadata } from "@/ui/PostArticle";

// A markdown post (content/blog/<slug>.md). An .mdx post is served from
// src/app/mdx/blog/[slug] through a rewrite in next.config.ts, so the client
// code its components need never loads here.

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPagePosts()
    .filter((post) => post.format === "md")
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata((await params).slug);
}

export default async function PostPage({ params }: Props) {
  const post = getPagePost((await params).slug);
  if (post?.format !== "md") notFound();
  return (
    <PostArticle slug={post.slug}>
      <Markdown source={post.body} />
    </PostArticle>
  );
}
