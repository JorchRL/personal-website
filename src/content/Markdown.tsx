// Markdown to HTML, at build time: GFM, raw HTML, code highlighted by Shiki
// (colours come from the --shiki-* variables in globals.css), maths typeset
// by KaTeX, Hashnode's own syntax turned into plain links and images, a name
// for every link that is only an unnamed image, and each TODO(jorge) wrapped in
// <mark class="todo">. With `headingIds` (work pages), every h2–h6 gets an id
// from its text (headingId in ./slug.ts), so other pages can link to a section.
// Use inside <Prose>.

// KaTeX's stylesheet must come from the version rehype-katex renders with
// (package.json pins katex to it; test/content.test.ts checks).
import "katex/dist/katex.min.css";
import rehypeShiki from "@shikijs/rehype";
import type { Element, ElementContent, Root as HastRoot, RootContent as HastContent } from "hast";
import type { Root as MdastRoot, RootContent as MdastContent } from "mdast";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createCssVariablesTheme } from "shiki";
import { unified, type PluggableList } from "unified";
import { headingId } from "./slug";
import { matchTodos } from "./todos";

export async function Markdown({ source, headingIds = false }: { source: string; headingIds?: boolean }) {
  const html = await renderMarkdown(source, { headingIds });
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}

export async function renderMarkdown(source: string, { headingIds = false } = {}): Promise<string> {
  const file = await (headingIds ? withIds : processor).process(hashnodeSource(source));
  return String(file);
}

/** Code blocks: Shiki, coloured by the --shiki-* variables in globals.css. */
const shikiOptions = {
  theme: createCssVariablesTheme({ name: "paper" }),
  langs: [],
  lazy: true,
  defaultLanguage: "text",
  fallbackLanguage: "text",
};

const base = () => unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(() => hashnodeEmbeds)
  .use(() => hashnodeMentions)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(() => plainHtml)
  .use(() => namedImageLinks)
  .use(() => onePageTitle)
  .use(() => hashnodeMath)
  .use(rehypeKatex)
  .use(rehypeShiki, shikiOptions)
  .use(() => keepFlagsWhole)
  .use(() => markTodos);

const processor = base().use(rehypeStringify);

/**
 * What an MDX post (src/content/Mdx.tsx) shares with a markdown one, after
 * its own parsing: the same HTML clean-up, image-link names, heading levels
 * and ids, KaTeX, Shiki, unbroken flags and TODO marks. The Hashnode fixes
 * are left out: MDX posts are new.
 */
export const mdxRehypePlugins: PluggableList = [
  () => plainHtml,
  () => namedImageLinks,
  () => onePageTitle,
  rehypeKatex,
  [rehypeShiki, shikiOptions],
  () => keepFlagsWhole,
  () => markTodos,
  () => idsFromText,
];
const withIds = base()
  .use(() => idsFromText)
  .use(rehypeStringify);

// --- Hashnode syntax -------------------------------------------------------

const IMAGE_ALIGN = /(!\[[^\]]*\]\([^)\s]+)\s+align="[^"]*"\)/g;
const BOLD_SPACE_INSIDE = /\*\*(?=[^\s*])([^*`\n]*?[^\s*])(\s+)\*\*/g;

/**
 * Where Hashnode's parser and CommonMark disagree, fixed line by line outside
 * code so posts read as they did on Hashnode:
 * - images written `![alt](url align="center")`, which is not markdown: the
 *   attribute goes, so they parse as images;
 * - bold closed after a space, `**Of course not! **`, which Hashnode accepted
 *   and CommonMark does not: the space moves outside the `**`;
 * - a stray backtick ending a line whose next line opens a code span: CommonMark
 *   pairs the two into a one-space span and shifts every span after it, so the
 *   stray one is escaped and shows as a plain backtick.
 */
function hashnodeSource(source: string): string {
  let fence: string | null = null;
  return source
    .split("\n")
    .map((line, index, lines) => {
      const [, marker, rest] = line.match(/^[\s>]*(`{3,}|~{3,})(.*)$/) ?? [];
      if (marker && fence === null && !(marker[0] === "`" && rest.includes("`"))) {
        fence = marker;
        return line;
      }
      if (marker && fence !== null && marker[0] === fence[0] && marker.length >= fence.length && !rest.trim()) {
        fence = null;
        return line;
      }
      if (fence !== null) return line;
      const strayBacktick = /[^`]`$/.test(line) && lines[index + 1]?.startsWith("`") && line.split("`").length % 2 === 0;
      if (strayBacktick) line = `${line.slice(0, -1)}\\\``;
      // Odd parts are inline code spans, left as they are.
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, i) => (i % 2 ? part : part.replace(IMAGE_ALIGN, "$1)").replace(BOLD_SPACE_INSIDE, "**$1**$2")))
        .join("");
    })
    .join("\n");
}

/**
 * A paragraph that is only `%[url]` (a Hashnode embed) becomes a link to the
 * url. A paragraph of only `%%[name]` lines (Hashnode widgets: snippets kept in
 * the old blog's settings, such as its follow button or donation footers) goes.
 */
function hashnodeEmbeds(tree: MdastRoot) {
  tree.children = tree.children.filter((node) => {
    if (node.type !== "paragraph") return true;
    const text = plainText(node).trim();
    if (/^(%%\[[\w-]+\]\s*)+$/.test(text)) return false;
    const url = text.match(/^%\[(\S+?)\]$/)?.[1];
    if (url) node.children = [{ type: "link", url, children: [{ type: "text", value: url }] }];
    return true;
  });
}

// --- Maths -----------------------------------------------------------------

/**
 * Hashnode typeset maths with MathJax in the browser, after the markdown had
 * become HTML. So the maths lives in ordinary text: `\(…\)` inline, `$$…$$`
 * displayed, and a bare `\begin{align}…\end{align}` displayed too. A single
 * `$` is not maths (posts use it in prose and shell commands). Each one
 * becomes <code class="math-inline|math-display"> for rehype-katex to typeset.
 * Like MathJax, a <br> inside maths reads as a line break.
 */
const MATH = /\$\$([\s\S]+?)\$\$|\\\(([\s\S]+?)\\\)|(\\begin\{([a-z]+\*?)\}[\s\S]+?\\end\{\4\})/g;
const NOT_MATH = new Set(["pre", "code", "script", "style", "textarea"]);
const BREAK = "\uE000"; // stands for a <br> while a run of text is searched

function hashnodeMath(tree: HastRoot) {
  const visit = (parent: HastRoot | Element) => {
    const children = parent.children as ElementContent[];
    let i = 0;
    while (i < children.length) {
      const start = i;
      while (i < children.length && isTextOrBreak(children[i])) i++;
      if (i === start) {
        const child = children[i];
        if (child.type === "element" && !NOT_MATH.has(child.tagName)) visit(child);
        i++;
        continue;
      }
      const typeset = mathInRun(children.slice(start, i));
      if (typeset) {
        children.splice(start, i - start, ...typeset);
        i = start + typeset.length;
      }
    }
  };
  visit(tree);
}

function isTextOrBreak(node: ElementContent): boolean {
  return node.type === "text" || (node.type === "element" && node.tagName === "br");
}

function mathInRun(run: ElementContent[]): ElementContent[] | null {
  const text = run.map((node) => (node.type === "text" ? node.value : BREAK)).join("");
  const matches = [...text.matchAll(MATH)];
  if (matches.length === 0) return null;
  const out: ElementContent[] = [];
  let at = 0;
  for (const match of matches) {
    out.push(...textWithBreaks(text.slice(at, match.index)));
    const tex = asKatexReadsIt((match[1] ?? match[2] ?? match[3]).replaceAll(BREAK, "\n"));
    out.push({
      type: "element",
      tagName: "code",
      properties: { className: [match[2] === undefined ? "math-display" : "math-inline"] },
      children: [{ type: "text", value: tex }],
    });
    at = match.index + match[0].length;
  }
  out.push(...textWithBreaks(text.slice(at)));
  return out;
}

/**
 * Where MathJax and KaTeX differ:
 * - MathJax, as Hashnode set it up, numbered no equations; KaTeX numbers
 *   align, gather and equation, so they become their starred forms;
 * - MathJax allows \hline in a matrix, KaTeX only in an array, so such a
 *   matrix becomes an array of centred columns (what a matrix is);
 * - a row break written `\\\` before a line end reaches here as `\` and a
 *   line break (markdown took one backslash for a hard break): it is `\\`.
 */
function asKatexReadsIt(tex: string): string {
  return tex
    .replace(/(?<!\\)\\\n/g, "\\\\\n")
    .replace(/\\(begin|end)\{(align|gather|equation)\}/g, "\\$1{$2*}")
    .replace(/\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g, (matrix, body: string) => {
      if (!body.includes("\\hline")) return matrix;
      const columns = Math.max(...body.split("\\\\").map((row) => row.split("&").length));
      return `\\begin{array}{${"c".repeat(columns)}}${body}\\end{array}`;
    });
}

function textWithBreaks(text: string): ElementContent[] {
  return text.split(BREAK).flatMap((part, i): ElementContent[] => [
    ...(i > 0 ? [{ type: "element", tagName: "br", properties: {}, children: [] } as Element] : []),
    ...(part ? [{ type: "text" as const, value: part }] : []),
  ]);
}

/**
 * A Hashnode mention, `@[Name](@handle)`, becomes a link to the person's
 * Hashnode profile, and the `@` in front of it goes, as Hashnode showed it.
 */
function hashnodeMentions(tree: MdastRoot) {
  const visit = (node: MdastRoot | MdastContent) => {
    if (!("children" in node)) return;
    node.children.forEach((child, i) => {
      if (child.type === "link" && /^@[\w-]+$/.test(child.url)) {
        child.url = `https://hashnode.com/${child.url}`;
        const before = node.children[i - 1];
        if (before?.type === "text" && before.value.endsWith("@")) before.value = before.value.slice(0, -1);
      }
      visit(child as MdastContent);
    });
  };
  visit(tree);
}

function plainText(node: MdastContent): string {
  if ("value" in node) return node.value;
  if ("children" in node) return node.children.map((child) => plainText(child as MdastContent)).join("");
  return "";
}

// --- Raw HTML from imported posts ------------------------------------------

const DROPPED = new Set(["script", "style"]);
const EMBEDS = new Set(["iframe", "embed", "object"]);

/**
 * Embeds become links; scripts, inline event handlers and the obsolete `align`
 * attribute go. Images load lazily (a post may hold a dozen). In a raw HTML
 * table cell, `code` in backticks becomes <code>, as Hashnode showed it. A
 * code block's language is lower-cased for Shiki (posts write `TypeScript`).
 */
function plainHtml(tree: HastRoot) {
  walk(tree, (node, parent, index) => {
    if (DROPPED.has(node.tagName)) {
      parent.children.splice(index, 1);
      return index;
    }
    if (EMBEDS.has(node.tagName)) {
      const url = String(node.properties.src ?? node.properties.data ?? "");
      if (!url) {
        parent.children.splice(index, 1);
        return index;
      }
      const link: Element = {
        type: "element",
        tagName: "a",
        properties: { href: url },
        children: [{ type: "text", value: url }],
      };
      // At block level, give the link its own paragraph.
      parent.children[index] =
        parent.type === "root" ? { type: "element", tagName: "p", properties: {}, children: [link] } : link;
      return index + 1;
    }
    for (const name of Object.keys(node.properties)) {
      if (name === "align" || /^on[A-Z]/.test(name)) delete node.properties[name];
    }
    if (node.tagName === "img") Object.assign(node.properties, { loading: "lazy", decoding: "async" });
    if (node.tagName === "td" || node.tagName === "th") node.children = node.children.flatMap(backticksToCode);
    if (node.tagName === "code" && Array.isArray(node.properties.className)) {
      node.properties.className = node.properties.className.map((c) =>
        String(c).startsWith("language-") ? String(c).toLowerCase() : c,
      );
    }
  });
}

function backticksToCode(node: ElementContent): ElementContent[] {
  if (node.type !== "text" || !node.value.includes("`")) return [node];
  return node.value.split(/`([^`]+)`/).flatMap((part, i): ElementContent[] => {
    if (i % 2 === 1) return [{ type: "element", tagName: "code", properties: {}, children: [{ type: "text", value: part }] }];
    return part ? [{ type: "text", value: part }] : [];
  });
}

// --- Image links -----------------------------------------------------------

/** Names for image-only links to known places, by host (without "www."). */
const LINK_NAMES: Record<string, string> = { "buymeacoffee.com": "Buy me a coffee" };

/**
 * A link whose only content is an image with no alt text has no accessible
 * name (imported posts end with a Buy Me a Coffee button made that way). The
 * image gets one: the place's name from LINK_NAMES, else the link's host for
 * an external link or its path for an internal one. Posts keep their words;
 * only the rendered alt changes.
 */
function namedImageLinks(tree: HastRoot) {
  walk(tree, (node) => {
    if (node.tagName !== "a") return;
    const content = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
    const [img] = content;
    if (content.length !== 1 || img.type !== "element" || img.tagName !== "img") return;
    if (String(img.properties.alt ?? "").trim()) return;
    const name = linkName(String(node.properties.href ?? ""));
    if (name) img.properties.alt = name;
  });
}

function linkName(href: string): string {
  if (!URL.canParse(href) || !/^https?:$/.test(new URL(href).protocol)) return href;
  const host = new URL(href).hostname.replace(/^www\./, "");
  return LINK_NAMES[host] ?? host;
}

// --- Inline code -----------------------------------------------------------

/**
 * Browsers break a line after a hyphen, so `--reload` could end one line with
 * "-" and start the next with "-reload". Short inline code with a hyphen and
 * no spaces (flags, package names) gets class "nowrap" and stays on one line.
 * (Code blocks are out of reach: Shiki hands back each one inside a root
 * node, which walk() does not enter, and they scroll anyway.)
 */
function keepFlagsWhole(tree: HastRoot) {
  walk(tree, (node) => {
    if (node.tagName !== "code") return;
    const text = node.children.map((c) => (c.type === "text" ? c.value : "")).join("");
    if (text.includes("-") && !/\s/.test(text) && text.length <= 32) {
      const classes = Array.isArray(node.properties.className) ? node.properties.className : [];
      node.properties.className = [...classes, "nowrap"];
    }
  });
}

// --- Headings --------------------------------------------------------------

/**
 * The page's title is its only <h1>. A body that uses # headings (several
 * imported posts do) has every heading moved down one level, so its outline
 * stays the same under the title.
 */
function onePageTitle(tree: HastRoot) {
  const headings: Element[] = [];
  walk(tree, (node) => {
    if (/^h[1-6]$/.test(node.tagName)) headings.push(node);
  });
  if (!headings.some((h) => h.tagName === "h1")) return;
  for (const h of headings) h.tagName = `h${Math.min(Number(h.tagName[1]) + 1, 6)}`;
}

/** An id on every h2–h6, from its text; a repeated heading gets -1, -2 … */
function idsFromText(tree: HastRoot) {
  const seen = new Map<string, number>();
  walk(tree, (node) => {
    if (!/^h[2-6]$/.test(node.tagName) || node.properties?.id) return;
    const id = headingId(textOf(node));
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    node.properties = { ...node.properties, id: n ? `${id}-${n}` : id };
  });
}

function textOf(node: HastContent | ElementContent): string {
  if (node.type === "text") return node.value;
  return "children" in node ? node.children.map((c) => textOf(c as ElementContent)).join("") : "";
}

// --- TODO marker -----------------------------------------------------------

const NOT_PROSE = new Set(["pre", "code", "script", "style", "mark"]);

/** Wraps each TODO(jorge) in ordinary text in <mark class="todo">. */
function markTodos(tree: HastRoot) {
  const visit = (parent: HastRoot | Element) => {
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      if (child.type === "element") {
        if (!NOT_PROSE.has(child.tagName)) visit(child);
      } else if (isComponent(child)) {
        visit(child as unknown as Element);
      } else if (child.type === "text") {
        const parts = splitTodos(child.value);
        if (parts) {
          parent.children.splice(i, 1, ...parts);
          i += parts.length - 1;
        }
      }
    }
  };
  visit(tree);
}

function splitTodos(text: string): ElementContent[] | null {
  const todos = matchTodos(text);
  if (todos.length === 0) return null;
  const parts: ElementContent[] = [];
  let at = 0;
  for (const { index, text: todo } of todos) {
    if (index > at) parts.push({ type: "text", value: text.slice(at, index) });
    parts.push({
      type: "element",
      tagName: "mark",
      properties: { className: ["todo"] },
      children: [{ type: "text", value: todo }],
    });
    at = index + todo.length;
  }
  if (at < text.length) parts.push({ type: "text", value: text.slice(at) });
  return parts;
}

// --- Tree walking ----------------------------------------------------------

/**
 * A component in an MDX post (<Aside>, <Figure>…): not an element, but its
 * children are the post's text, so the walks below go through it. A markdown
 * tree has none.
 */
function isComponent(node: { type: string }): boolean {
  return (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && "children" in node;
}

/**
 * Visits every element depth-first. The visitor may replace or remove
 * `parent.children[index]`; it returns the index to continue from
 * (undefined = descend into the node, then move on).
 */
function walk(
  parent: HastRoot | Element,
  visitor: (node: Element, parent: HastRoot | Element, index: number) => number | void,
) {
  let i = 0;
  while (i < parent.children.length) {
    const child: HastContent = parent.children[i];
    if (child.type !== "element") {
      if (isComponent(child)) walk(child as unknown as Element, visitor);
      i++;
      continue;
    }
    const next = visitor(child, parent, i);
    if (next === undefined) {
      walk(child, visitor);
      i++;
    } else {
      i = next;
    }
  }
}
