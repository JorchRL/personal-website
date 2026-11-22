// An .mdx post's body, compiled and rendered at build time (the route is
// static: no MDX code reaches the browser). Same treatment as a markdown
// post (the rehype plugins in Markdown.tsx), with maths written $$…$$, a
// heading id on every h2–h6, and only the components in mdx-components.tsx.
// Use inside <Prose>.

import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { mdxRehypePlugins } from "./Markdown";
import { mathOptions, mdxError, parseMdx } from "./mdx-plain";
import { componentsFor } from "./mdx-components";

type Source = { slug: string; body: string; file: string; bodyStart?: number };
type MDXContent = Awaited<ReturnType<typeof evaluate>>["default"];

export async function Mdx({ post }: { post: Source }) {
  const Content = await compileMdx(post);
  return (
    <div className="markdown">
      <Content components={componentsFor(post.slug)} />
    </div>
  );
}

/** Compiles a post's body. Throws, naming the file and line, on a syntax error or an unknown component. */
export async function compileMdx({ slug, body, file, bodyStart: offset = 0 }: Source): Promise<MDXContent> {
  parseMdx(body, file, offset); // the clearer error for syntax, import and export
  try {
    const compiled = await evaluate(body, {
      ...runtime,
      development: false,
      remarkPlugins: [remarkGfm, [remarkMath, mathOptions], [checkComponents, { slug, file, offset }]],
      rehypePlugins: mdxRehypePlugins,
    });
    return compiled.default;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(file)) throw error;
    throw mdxError(error as Error, file, offset);
  }
}

const NUMBERED = new Set(["Figure", "Demo"]);
const NO_TAGS = new Set(["script", "style", "iframe", "object", "embed"]);

/**
 * Every component a post uses is in its map, and each figure gets its mark (Fig. 1, Fig. 2…) unless it names its own.
 */
function checkComponents({ slug, file, offset }: { slug: string; file: string; offset: number }) {
  const known = componentsFor(slug);
  return (tree: Root) => {
    let figures = 0;
    const visit = (node: Root | Root["children"][number]) => {
      if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        const where = `${file}:${(node.position?.start.line ?? 0) + offset}`;
        const name = node.name ?? "";
        if (/^[A-Z]/.test(name) && !(name in known)) {
          throw new Error(
            `${where}: <${name}> is not a component posts can use. ` +
              `Available: ${Object.keys(known).join(", ")} (src/content/mdx-components.tsx).`,
          );
        }
        if (NO_TAGS.has(name)) throw new Error(`${where}: <${name}> is not allowed in a post.`);
        if (NUMBERED.has(name)) {
          figures++;
          if (!node.attributes.some((a) => a.type === "mdxJsxAttribute" && a.name === "mark")) {
            node.attributes.push({ type: "mdxJsxAttribute", name: "mark", value: `Fig. ${figures}` });
          }
        }
      }
      if ("children" in node) for (const child of node.children) visit(child);
    };
    visit(tree);
  };
}
