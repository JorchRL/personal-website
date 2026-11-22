// MDX posts without React: parse a post's body (the same syntax the compiler
// in Mdx.tsx reads: MDX, GFM, $$maths$$), turn a syntax error into one that
// names the file, the line and how to escape the character, and write the
// body back as plain markdown, each component replaced by a readable line
// (the twin at /blog/<slug>.md, the reading time). The loaders use it, so no
// React here, and nothing that imports the widgets.

import type { Root, RootContent } from "mdast";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { stripTodos } from "./todos";

/** Maths in MDX: `$$…$$`, inline within a line, displayed on lines of its own. A single `$` is not maths. */
export const mathOptions = { singleDollarTextMath: false };

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).use(remarkMath, mathOptions);

type Located = { line?: number; column?: number; place?: unknown; reason?: string; message: string };

/**
 * The body's syntax tree. Throws an error naming the file and line on an MDX
 * syntax error (with the escape to use) and on `import` or `export`: a post
 * gets its components from src/content/mdx-components.tsx only.
 * `lineOffset`: the lines of frontmatter above the body.
 */
export function parseMdx(body: string, file: string, lineOffset = 0): Root {
  let tree: Root;
  try {
    tree = parser.parse(body);
  } catch (error) {
    throw mdxError(error as Located, file, lineOffset);
  }
  visit(tree, (node) => {
    if (node.type === "mdxjsEsm") {
      const line = (node.position?.start.line ?? 0) + lineOffset;
      throw new Error(
        `${file}:${line}: import and export are not allowed in a post. ` +
          'Components come from src/content/mdx-components.tsx. To start a paragraph with the word, write it {"import"}.',
      );
    }
  });
  return tree;
}

/** An MDX syntax error as one readable message: file:line:column, what went wrong, how to fix it. */
export function mdxError(error: Located, file: string, lineOffset = 0): Error {
  const line = error.line ?? (error.place as { line?: number } | undefined)?.line;
  const column = error.column ?? (error.place as { column?: number } | undefined)?.column;
  const where = line ? `${file}:${line + lineOffset}${column ? `:${column}` : ""}` : file;
  const reason = (error.reason ?? error.message).split("\n")[0];
  const hint = /import\/export/.test(reason)
    ? 'a paragraph that starts with the word import or export is read as code: write the word {"import"}.'
    : "in .mdx, < starts a component and { starts an expression. To write either as text, " +
      "escape it (\\< or \\{), or put it in `code`.";
  return new Error(`${where}: MDX syntax error: ${reason}\n  Hint: ${hint}`);
}

/**
 * What a component becomes in the plain markdown, from its name, its
 * attributes and its children already made plain.
 */
export type Describe = (name: string, props: Record<string, string>, children: string) => string;

/** The line for an interactive piece written in a post, with no caption of its own. */
const INTERACTIVE = "Interactive figure";

/**
 * The plain markdown of each component in src/content/mdx-components.tsx:
 * - `<Figure>`: the picture as markdown, then its caption;
 * - `<Aside>`: its text as a blockquote;
 * - `<Demo>`: "Interactive figure: <caption> — <the post>", then the static
 *   fallback written inside the component it frames;
 * - a post's own component: the plain text it gives in `own` (a post's
 *   figures, src/content/blog-components/plain.ts), else its fallback (its
 *   children), else "Interactive figure — <the post>";
 * - an HTML tag (`<kbd>`, `<sup>`): its text.
 */
export function describer({
  postUrl,
  own,
}: {
  postUrl: string;
  /** A post's own components that write their own plain text, by name. */
  own?: Record<string, (props: Record<string, string>) => string>;
}): Describe {
  const line = (what: string, url: string) => `${what} — ${url}`;
  const generic = line(INTERACTIVE, postUrl);
  const paragraphs = (...parts: (string | undefined)[]) => parts.filter(Boolean).join("\n\n");
  return (name, props, children) => {
    switch (name) {
      case "Figure":
        return paragraphs(`![${props.alt ?? ""}](${props.src})`, props.caption);
      case "Aside":
        // Its TODOs go before it is quoted, so no empty quote line is left where one was.
        return quoted(stripTodos(children));
      case "Demo": {
        const inside = children
          .split("\n\n")
          .filter((p) => p.trim() !== generic)
          .join("\n\n");
        return paragraphs(line(props.caption ? `${INTERACTIVE}: ${props.caption}` : INTERACTIVE, postUrl), inside);
      }
      default:
        if (/^[a-z]/.test(name)) return children;
        if (own && Object.hasOwn(own, name)) return own[name](props);
        return children || generic;
    }
  };
}

/** For counting words: the same text, without addresses. */
export const describePlain = describer({ postUrl: "" });

/**
 * The body as plain markdown: the text as written, each component replaced by
 * what `describe` returns, each `{expression}` by its value when it is a
 * string literal (`{"{"}`) and by nothing otherwise.
 */
export function mdxToMarkdown(body: string, tree: Root, describe: Describe): string {
  // `indent`: the columns of indentation to take off each line of the source
  // (children indented under their tag), never off what a component returns.
  const plain = (start: number, end: number, nodes: RootContent[], indent = 0): string => {
    const source = (from: number, to: number) =>
      indent > 0 ? body.slice(from, to).replace(new RegExp(`\n[ \t]{0,${indent}}`, "g"), "\n") : body.slice(from, to);
    let out = "";
    let at = start;
    for (const node of topmost(nodes)) {
      const from = node.position!.start.offset!;
      const to = node.position!.end.offset!;
      out += source(at, from) + replace(node);
      at = to;
    }
    return out + source(at, end);
  };

  const replace = (node: RootContent): string => {
    if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") return literal(node.value);
    const element = node as MdxJsxFlowElement | MdxJsxTextElement;
    const kids = element.children as RootContent[];
    let children = "";
    if (kids.length > 0) {
      const first = kids[0].position!.start;
      const last = kids[kids.length - 1].position!.end;
      // Children indented under their tag lose that indentation.
      children = plain(first.offset!, last.offset!, kids, first.column - 1).trim();
    }
    return describe(element.name ?? "", attributes(element), children);
  };

  return plain(0, body.length, tree.children)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** A component's string attributes (expression attributes as their source text). */
function attributes(element: MdxJsxFlowElement | MdxJsxTextElement): Record<string, string> {
  const props: Record<string, string> = {};
  for (const attr of element.attributes) {
    if (attr.type !== "mdxJsxAttribute") continue;
    const { name, value } = attr as MdxJsxAttribute;
    props[name] = value === null || value === undefined ? "true" : typeof value === "string" ? value : literal(value.value);
  }
  return props;
}

/** The value of a JavaScript string, number or boolean literal; "" for any other expression. */
function literal(source: string): string {
  const text = source.trim();
  if (/^"(?:[^"\\]|\\.)*"$/.test(text)) return JSON.parse(text) as string;
  if (/^'(?:[^'\\]|\\.)*'$/.test(text)) return text.slice(1, -1).replace(/\\(.)/g, "$1");
  if (/^`[^`$]*`$/.test(text)) return text.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(text)) return text;
  if (text === "true" || text === "false") return text;
  return "";
}

const MDX_NODES = new Set(["mdxJsxFlowElement", "mdxJsxTextElement", "mdxFlowExpression", "mdxTextExpression"]);

/** The outermost components and expressions among `nodes`, in order. */
function topmost(nodes: RootContent[]): RootContent[] {
  return nodes.flatMap((node) => {
    if (MDX_NODES.has(node.type)) return [node];
    return "children" in node ? topmost(node.children as RootContent[]) : [];
  });
}

function visit(node: Root | RootContent, fn: (node: RootContent) => void) {
  if (node.type !== "root") fn(node);
  if ("children" in node) for (const child of node.children as RootContent[]) visit(child, fn);
}

/** Every component a body uses, with its first line (for error messages). */
export function componentsUsed(tree: Root): { name: string; line: number; props: Record<string, string> }[] {
  const used: { name: string; line: number; props: Record<string, string> }[] = [];
  visit(tree, (node) => {
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      used.push({ name: node.name ?? "", line: node.position?.start.line ?? 0, props: attributes(node) });
    }
  });
  return used;
}

/** A blockquote of `text`, line by line. */
export function quoted(text: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");
}
