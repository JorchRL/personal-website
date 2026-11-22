import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPagePost, getPagePosts } from "@/content/posts";
import { Mdx } from "@/content/Mdx";
import { PostArticle, postMetadata } from "@/ui/PostArticle";
import "@/content/mdx.css";

// An MDX post (content/blog/<slug>.mdx), served at /blog/<slug> through a
// rewrite in next.config.ts. A route of its own, so the client code and the
// styles its components need load only on MDX posts, never on markdown ones.

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPagePosts()
    .filter((post) => post.format === "mdx")
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata((await params).slug);
}

export default async function MdxPostPage({ params }: Props) {
  const post = getPagePost((await params).slug);
  if (post?.format !== "mdx") notFound();
  return (
    <PostArticle slug={post.slug}>
      <Mdx post={post} />
    </PostArticle>
  );
}
