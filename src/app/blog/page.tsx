import Link from "next/link";
import { getAllPosts, type Post } from "@/content/posts";
import { TodoText } from "@/content/TodoText";
import { pageMetadata } from "@/seo/metadata";
import { formatDayMonth, yearOf } from "@/ui/format";
import { PageHead } from "@/ui/PageHead";
import { sheetLabel } from "@/ui/sections";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Posts by Jorge Romero on code, maths, design and learning to build software.",
  path: "/blog",
});

// Every imported post carries Hashnode's catch-all tags; in a list they say
// nothing, so the list leaves them out (the post page shows every tag).
const LIST_HIDDEN_TAGS = new Set(["Programming Blogs", "Blogging"]);

function listTags(post: Post): string[] {
  return post.tags
    .map((tag) => tag.trim())
    .filter((tag) => !LIST_HIDDEN_TAGS.has(tag))
    .slice(0, 2);
}

function byYear(posts: Post[]): [number, Post[]][] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = yearOf(post.date);
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years];
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const years = posts.map((p) => yearOf(p.date));
  const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";

  return (
    <>
      <PageHead
        label={sheetLabel("/blog")}
        status={
          <>
            {posts.length} posts · {span} ·{" "}
            <a className="u" href="/rss.xml">
              RSS
            </a>
          </>
        }
        title="Blog"
        lead="Code, maths, design and learning to build software."
        side={<p>First published at blog.jrlgs.dev. Every post is also plain markdown: add .md to its address.</p>}
      />

      {byYear(posts).map(([year, list]) => (
        <section key={year} className="year grid" aria-labelledby={`y${year}`}>
          <div className="year-head">
            <h2 id={`y${year}`}>{year}</h2>
            <p className="mono">
              {list.length} {list.length === 1 ? "post" : "posts"}
            </p>
          </div>
          <ol className="posts">
            {list.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>
                  <time className="mono" dateTime={post.date}>
                    {formatDayMonth(post.date)}
                  </time>
                  <span className="ti">
                    <TodoText text={post.title} />
                    <span className="ds">
                      <TodoText text={post.description} />
                    </span>
                  </span>
                  <span className="tags mono">{listTags(post).join(" · ")}</span>
                  <span className="min mono">{post.readingMinutes} min</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
