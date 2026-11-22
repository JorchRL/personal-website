import type { MetadataRoute } from "next";
import { getAllPosts } from "@/content/posts";
import { getAllWork } from "@/content/work";
import { absoluteUrl, postPath, workPath } from "@/seo/urls";

// Only real URLs. lastmod only where it is known (a post's date, and the blog
// index's latest post); no priority or changefreq, which search engines ignore.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/work") },
    ...getAllWork().map((work) => ({ url: absoluteUrl(workPath(work.slug)) })),
    { url: absoluteUrl("/about") },
    { url: absoluteUrl("/cv") },
    { url: absoluteUrl("/work-with-me") },
    { url: absoluteUrl("/blog"), ...(posts[0] ? { lastModified: posts[0].date } : {}) },
    ...posts.map((post) => ({ url: absoluteUrl(postPath(post.slug)), lastModified: post.date })),
  ];
}
