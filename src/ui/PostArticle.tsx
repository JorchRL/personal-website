// A post's page around its body: the head (label, title, facts, the
// markdown twin's link), the cover, the margin with its tags, the closing
// and the links to the posts on either side. A markdown post
// (src/app/blog/[slug]) and an MDX post (src/app/mdx/blog/[slug]) share it.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { site } from "@content/site";
import { getAllPosts, getPagePost, type Post } from "@/content/posts";
import { TodoText } from "@/content/TodoText";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { postPath } from "@/seo/urls";
import { Closing } from "@/ui/Closing";
import { Cover } from "@/ui/Cover";
import { formatDate, yearOf } from "@/ui/format";
import { JsonLd } from "@/ui/JsonLd";
import { PageHead } from "@/ui/PageHead";
import { Prose } from "@/ui/Prose";

/** A post's title, description, canonical address, twin and Open Graph image. */
export function postMetadata(slug: string): Metadata {
  const post = getPagePost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    markdown: `/blog/${post.slug}.md`,
    article: { publishedTime: post.date, tags: post.tags },
    image: `/blog/${post.slug}/opengraph-image`,
    noindex: post.draft,
  });
}

/** The page of the post `slug`, with `children` (its rendered body) in the prose column. */
export function PostArticle({ slug, children }: { slug: string; children: ReactNode }) {
  // Prev/next and the post's number come from the published posts only: a
  // draft is in neither list, and no published post links to it.
  const posts = getAllPosts();
  const post = getPagePost(slug);
  if (!post) notFound();
  const index = posts.findIndex((p) => p.slug === slug);
  // Posts are newest first: the one before is newer, the one after is older.
  const newer = post.draft ? undefined : posts[index - 1];
  const older = post.draft ? undefined : posts[index + 1];
  const tags = post.tags.map((t) => t.trim()).filter(Boolean);
  const length = post.title.length;

  return (
    <article>
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blog", path: "/blog" },
          { name: post.title, path: postPath(post.slug) },
        ])}
      />

      <PageHead
        kind="article"
        label={
          <>
            <Link href="/blog">Blog</Link> / {yearOf(post.date)} /{" "}
            {post.draft ? "Draft" : `No. ${String(posts.length - index).padStart(2, "0")}`}
          </>
        }
        status={
          post.draft ? (
            <>
              <mark className="draft-mark">Draft</mark> not published · {post.readingMinutes} min read
            </>
          ) : (
            <>{post.readingMinutes} min read</>
          )
        }
        title={<TodoText text={post.title} />}
        titleClass={length > 60 ? "long" : length < 16 ? "short" : ""}
        fit={post.title}
      >
        <dl className="facts">
          <div>
            <dt>Written by</dt>
            <dd>
              <Link href="/about" rel="author">
                {site.name}
              </Link>
            </dd>
          </div>
          <div>
            <dt>{post.draft ? "Draft dated" : "Published"}</dt>
            <dd>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>{post.readingMinutes} min</dd>
          </div>
          <div>
            <dt>Also as</dt>
            <dd>
              <a href={`/blog/${post.slug}.md`} type="text/markdown">
                Markdown
              </a>
            </dd>
          </div>
        </dl>
      </PageHead>

      {post.cover && (
        <div className="cover-row grid">
          <Cover post={post} preload sizes="(min-width: 1101px) 900px, 100vw" />
        </div>
      )}

      <div className="article-body grid">
        <aside className="margin mono" aria-label="About this post">
          <dl>
            {tags.length > 0 && (
              <>
                <dt>Tags</dt>
                {tags.map((tag) => (
                  <dd key={tag}>#{tag}</dd>
                ))}
              </>
            )}
            <dt>Index</dt>
            <dd>
              <Link href="/blog">All posts</Link>
            </dd>
          </dl>
        </aside>
        <Prose>
          {children}
        </Prose>
      </div>

      <footer className="article-end">
        <Closing label="Written by" />
        <PostNav newer={newer} older={older} />
      </footer>
    </article>
  );
}

function PostNav({ newer, older }: { newer?: Post; older?: Post }) {
  return (
    <nav className="post-nav" aria-label="More posts">
      <ul className="grid">
        {older && <NavItem post={older} label="← Older post" />}
        {newer && <NavItem post={newer} label="Newer post →" />}
      </ul>
      <p className="all">
        <Link className="more" href="/blog">
          All posts
        </Link>
      </p>
    </nav>
  );
}

function NavItem({ post, label }: { post: Post; label: string }) {
  return (
    <li>
      <span className="label">{label}</span>
      <Link href={`/blog/${post.slug}`}>
        <TodoText text={post.title} />
      </Link>
      <time className="mono" dateTime={post.date}>
        {formatDate(post.date)}
      </time>
    </li>
  );
}
