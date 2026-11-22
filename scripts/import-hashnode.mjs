// One-off: import every post of the blog at blog.jrlgs.dev into
// content/blog/<slug>.md, with its images downloaded into public/blog/<slug>/.
//
//   node scripts/import-hashnode.mjs
//
// Source: Hashnode's GraphQL API. Reading it now needs a paid plan, so when the
// API refuses, the script falls back to the blog's sitemap (every post; the RSS
// feed holds only the newest 20) plus each post's page, whose embedded data
// holds the same Post object the API returns (markdown included).
//
// The post text is written as it is; only image URLs and links between posts
// are rewritten to local paths. Images over 500 KB are re-encoded to WebP at the
// same size; the description is Hashnode's brief, trimmed to a whole sentence.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { stringify as toYaml } from "yaml";

const HOST = "blog.jrlgs.dev";
const OLD_HOSTS = [HOST, "jorgerl.hashnode.dev"];
const USER_AGENT = "Mozilla/5.0 (compatible; static-site-importer)";
const REENCODE_OVER = 500 * 1024; // bytes
const SHORTEST_SENTENCE_DESCRIPTION = 60; // characters

const root = process.cwd();
const contentDir = path.join(root, "content/blog");
const publicDir = path.join(root, "public/blog");

const posts = await fetchPosts();
const slugs = new Set(posts.map((p) => p.slug));
for (const post of posts) await writePost(post, slugs);
console.log(`imported ${posts.length} posts`);

// --- Fetching ----------------------------------------------------------------

/** Posts newest first, each shaped like the API's Post object. */
async function fetchPosts() {
  try {
    return await fetchFromApi();
  } catch (error) {
    console.warn(`GraphQL API failed (${error.message}); falling back to the sitemap and post pages`);
    return fetchFromSite();
  }
}

async function fetchFromApi() {
  const query = `query ($host: String!, $after: String) {
    publication(host: $host) {
      posts(first: 20, after: $after) {
        edges { node { slug title brief publishedAt tags { name } coverImage { url } content { markdown } } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }`;
  const posts = [];
  let after = null;
  do {
    const response = await fetch("https://gql.hashnode.com/", {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify({ query, variables: { host: HOST, after } }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const page = json.data?.publication?.posts;
    if (!page) throw new Error(JSON.stringify(json.errors ?? json).slice(0, 200));
    posts.push(...page.edges.map((e) => e.node));
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return posts;
}

/** Every post in the sitemap: a one-segment path (not /archive, /page/…, /series/…). */
async function fetchFromSite() {
  const sitemap = await fetchText(`https://${HOST}/sitemap.xml`);
  const slugs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, url]) => new URL(url).pathname.slice(1))
    .filter((slug) => /^[a-z0-9-]+$/.test(slug) && slug !== "archive");
  const posts = [];
  for (const slug of slugs) posts.push(await fetchPostPage(slug));
  return posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/** Reads the Post object out of the React Server Components data in a post's page. */
async function fetchPostPage(slug) {
  const html = await fetchText(`https://${HOST}/${slug}`);
  const rows = rscRows(html);
  let post;
  for (const row of rows.values()) {
    if (!row.startsWith("[") && !row.startsWith("{")) continue;
    let value;
    try {
      value = JSON.parse(row);
    } catch {
      continue;
    }
    post ??= findObject(value, (o) => o.__typename === "Post" && o.slug === slug && o.content);
  }
  if (!post) throw new Error(`${slug}: no Post object in the page`);
  const resolve = (v) => (typeof v === "string" && /^\$[0-9a-f]+$/.test(v) ? rows.get(v.slice(1)) : v);
  const markdown = resolve(post.content.markdown);
  if (typeof markdown !== "string") throw new Error(`${slug}: markdown not found`);
  return {
    slug: post.slug,
    title: resolve(post.title),
    brief: resolve(post.brief),
    publishedAt: post.publishedAt,
    tags: post.tags ?? [],
    coverImage: post.coverImage,
    content: { markdown },
  };
}

/**
 * The page streams its data as `self.__next_f.push([1, "…"])` chunks. Joined,
 * they form rows `<hex id>:<json>\n`, or `<hex id>:T<hex byte length>,<text>`
 * for long text (which may contain newlines).
 */
function rscRows(html) {
  const chunks = [...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)]
    .map(([, json]) => JSON.parse(json))
    .filter(([kind]) => kind === 1)
    .map(([, text]) => text);
  const data = Buffer.from(chunks.join(""), "utf8");
  const rows = new Map();
  let at = 0;
  while (at < data.length) {
    if (data[at] === 0x0a) {
      at++;
      continue;
    }
    const colon = data.indexOf(":", at);
    if (colon < 0) break;
    const id = data.subarray(at, colon).toString();
    if (data[colon + 1] === 0x54 /* T */) {
      const comma = data.indexOf(",", colon);
      const length = parseInt(data.subarray(colon + 2, comma).toString(), 16);
      rows.set(id, data.subarray(comma + 1, comma + 1 + length).toString());
      at = comma + 1 + length;
    } else {
      const end = data.indexOf("\n", colon);
      const stop = end < 0 ? data.length : end;
      rows.set(id, data.subarray(colon + 1, stop).toString());
      at = stop + 1;
    }
  }
  return rows;
}

function findObject(value, test) {
  if (Array.isArray(value)) {
    for (const v of value) {
      const found = findObject(v, test);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    if (test(value)) return value;
    for (const v of Object.values(value)) {
      const found = findObject(v, test);
      if (found) return found;
    }
  }
  return undefined;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

// --- Writing -----------------------------------------------------------------

async function writePost(post, slugs) {
  const dir = path.join(publicDir, post.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const local = new Map(); // remote URL → /blog/<slug>/<file>
  const save = async (url, name) => {
    if (!local.has(url)) local.set(url, `/blog/${post.slug}/${await download(url, dir, name, local.size + 1)}`);
    return local.get(url);
  };

  const cover = post.coverImage?.url ? await save(post.coverImage.url, "cover") : undefined;

  let body = post.content.markdown;
  for (const url of imageUrls(body)) await save(url);
  for (const [url, file] of local) body = body.split(url).join(file);
  body = body.replace(
    new RegExp(`https?://(?:${OLD_HOSTS.map((h) => h.replace(/\./g, "\\.")).join("|")})/([a-z0-9-]+)\\b(?![./-])`, "g"),
    (link, slug) => (slugs.has(slug) ? `/blog/${slug}` : link),
  );

  const frontmatter = {
    title: post.title,
    description: describe(post.brief),
    date: post.publishedAt,
    tags: post.tags.map((t) => t.name),
    ...(cover ? { cover } : {}),
  };
  const file = `---\n${toYaml(frontmatter, { lineWidth: 0 })}---\n\n${body.trim()}\n`;
  writeFileSync(path.join(contentDir, `${post.slug}.md`), file);
  console.log(`${post.slug}: ${local.size} images`);
}

/**
 * Hashnode's brief is the post's opening, cut mid-word and ended with "...".
 * Keep it up to its last complete sentence when that leaves at least 60
 * characters; otherwise cut at the last whole word and end with "…".
 */
function describe(brief) {
  const text = brief.replace(/\s+/g, " ").trim();
  const cut = text.match(/^([\s\S]*?)\s*(\.\.\.|…)$/)?.[1];
  if (cut === undefined) return text; // not truncated
  // The last . ! or ? followed by a space, not part of an ellipsis ("…you know...").
  const sentence = cut.match(/^[\s\S]*[^.][.!?]["')\]]*(?=\s|$)/)?.[0];
  if (sentence && sentence.length >= SHORTEST_SENTENCE_DESCRIPTION) return sentence;
  const words = cut.replace(/\s+\S*$/, "").replace(/[\s,;:–—-]+$/, "");
  return `${words}…`;
}

/** Image URLs in markdown images and raw <img> tags. */
function imageUrls(markdown) {
  const urls = new Set();
  for (const [, url] of markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)/g)) urls.add(url);
  for (const [, url] of markdown.matchAll(/<img\b[^>]*?\bsrc="(https?:\/\/[^"]+)"/gi)) urls.add(url);
  return urls;
}

/**
 * Downloads the original (no CDN resizing) into `dir` and returns its file
 * name: `name` when given (the cover), else the remote file name, else image-<n>.
 */
async function download(url, dir, name, n) {
  const original = url.includes("cdn.hashnode.com") ? url.replace(/\?.*$/, "") : url;
  const response = await fetch(original, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${original}: HTTP ${response.status}`);
  const type = response.headers.get("content-type") ?? "";
  const remoteName = path.basename(new URL(original).pathname);
  const ext = path.extname(remoteName) || extensionFor(type);
  const base = (name ?? (path.extname(remoteName) ? path.basename(remoteName, ext) : `image-${n}`)).replace(
    /[^\w.-]/g,
    "-",
  );
  const data = Buffer.from(await response.arrayBuffer());
  const webp = await smallerWebp(data, ext);
  const file = webp ? `${base}.webp` : `${base}${ext}`;
  writeFileSync(path.join(dir, file), webp ?? data);
  return file;
}

/**
 * A PNG or JPEG over 500 KB becomes WebP at the same dimensions: quality 90, or
 * lossless when that is smaller (line art: flat colour and clean strokes).
 * Returns null to keep the original (small files, GIFs, SVGs, or no saving).
 */
async function smallerWebp(data, ext) {
  if (data.length <= REENCODE_OVER || ![".png", ".jpg", ".jpeg"].includes(ext.toLowerCase())) return null;
  const image = () => sharp(data).rotate(); // apply EXIF orientation, as browsers do
  const [lossy, lossless] = await Promise.all([
    image().webp({ quality: 90 }).toBuffer(),
    image().webp({ lossless: true }).toBuffer(),
  ]);
  const best = lossless.length < lossy.length ? lossless : lossy;
  return best.length < data.length ? best : null;
}

function extensionFor(contentType) {
  const map = { "image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif", "image/webp": ".webp", "image/svg+xml": ".svg" };
  return map[contentType.split(";")[0].trim()] ?? ".bin";
}
