// Frontmatter shapes for posts and work pages, and the one function that
// reads a content file: split the frontmatter off, validate it, and throw an
// error naming the file and the field when something is wrong.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
// Relative, not @content: next.config.ts loads this file through posts.ts.
import { paints, papers, type PaintKey, type PaperKey } from "../../content/materials";

// ISO date (2026-11-20) or date-time (2023-01-15T09:30:00.000Z), kept as written.
// The yaml package's default (core) schema leaves timestamps as strings.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/, "must be an ISO date, e.g. 2026-11-20")
  .refine((s) => !Number.isNaN(Date.parse(s)), "must be a real date");

export const postFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: isoDate,
  tags: z.array(z.string()),
  cover: z.string().startsWith("/", "must be a path from the site root, e.g. /blog/<slug>/cover.png").optional(),
  /** Not published yet: rendered at its URL where drafts are built, never listed (src/content/drafts.ts). */
  draft: z.boolean().optional(),
});

export const workFrontmatter = z.object({
  title: z.string().min(1),
  role: z.string().min(1),
  // "2021–2023" is a string, but a bare year like 2023 is a YAML number.
  period: z.union([z.string().min(1), z.number().int().transform(String)]),
  stack: z.array(z.string()),
  description: z.string().min(1),
  order: z.number().int(),
  links: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).optional(),
  /** Who built it: "Solo", or the team's size. */
  team: z.string().min(1).optional(),
  /**
   * What the page opens with: a picture or a video, or, until one exists,
   * a TODO naming what to record.
   */
  figure: z
    .union([
      z.string().regex(/^TODO\(jorge\): /, 'must be a picture or video, or "TODO(jorge): what to record"'),
      z.object({
        src: z.string().startsWith("/", "must be a path from the site root, e.g. /work/<slug>/clip.mp4"),
        alt: z.string().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        /** For a video: its still, shown until it plays. */
        poster: z.string().startsWith("/").optional(),
        caption: z.string().optional(),
      }),
    ])
    .optional(),
});

/** One of the keys of `list`, or an error that names the keys there are. */
function keyOf<K extends string>(list: Record<K, unknown>, where: string) {
  const keys = Object.keys(list) as K[];
  return z.custom<K>((value) => typeof value === "string" && keys.includes(value as K), {
    message: `must be one of ${where}: ${keys.join(", ")}`,
  });
}

/** A missing fact, written as "TODO(jorge): …". */
const TODO_FACT = /^TODO\(jorge\): /;
const todo = z.string().regex(TODO_FACT, 'must be "TODO(jorge): …"');
const isTodo = (value: unknown): value is `TODO(jorge): ${string}` => typeof value === "string" && TODO_FACT.test(value);

/** A value `ok` accepts, or a "TODO(jorge): …" in its place; one error message for both. */
function orTodo<T>(ok: (value: unknown) => value is T, message: string) {
  return z.custom<T | `TODO(jorge): ${string}`>((value) => ok(value) || isTodo(value), {
    message: `${message}, or "TODO(jorge): …"`,
  });
}

export const artFrontmatter = z
  .object({
    /** Its title; "TODO(jorge): …" until he names it. */
    title: z.string().min(1),
    /** The year it was painted, or "TODO(jorge): …". */
    year: orTodo(
      (v): v is number => typeof v === "number" && Number.isInteger(v) && v >= 1900 && v <= 2100,
      "must be a year, e.g. 2026",
    ),
    /** The picture: a JPEG, PNG or WebP under public/art/, e.g. /art/<slug>.jpg. */
    image: z
      .string()
      .regex(/^\/art\/[\w.-]+\.(jpe?g|png|webp)$/i, "must be a JPEG, PNG or WebP under public/art/, e.g. /art/<slug>.jpg"),
    /** What the picture shows, for a reader who cannot see it. */
    alt: z.string().min(1),
    /** The paper, by its key in content/materials.ts, or "TODO(jorge): …". */
    paper: orTodo(
      (v): v is PaperKey => typeof v === "string" && Object.hasOwn(papers, v),
      `must be one of the papers in content/materials.ts: ${Object.keys(papers).join(", ")}`,
    ),
    /** The paints, by their keys in content/materials.ts; leave out to say nothing. */
    paints: z.array(keyOf<PaintKey>(paints, "the paints in content/materials.ts")).optional(),
    /** The medium, when the paints do not say it all ("Watercolour and ink"). */
    medium: z.string().min(1).optional(),
    /** Width and height in centimetres; leave out for the usual sheet (content/materials.ts). */
    size: z.object({ width: z.number().positive(), height: z.number().positive() }).optional(),
    /** Still his to part with: the page then offers an enquiry by email (never on fan art). */
    available: z.boolean(),
    /** Someone else's character or world: marked "Fan art", never offered or printed. */
    fanArt: z.boolean().default(false),
    /** Fan art only: whose character or world it is of ("Majora's Mask"). */
    subject: z.string().min(1).optional(),
    /** Fan art only: who owns it ("Nintendo"), for "Characters © <owner>". */
    owner: z.string().min(1).optional(),
    /** How it was made, one line ("Three sittings, about four hours. Finished; now with my nephew."); shown only when set. */
    making: z.string().min(1).optional(),
    /** Where prints of it are sold; the page links it only when set (never on fan art). */
    prints: z.url({ protocol: /^https$/, error: "must be an https:// link" }).optional(),
    /**
     * A dummy painting, not his: a TODO saying so. While it is here the TODO
     * gate fails a production build (CLAUDE.md, How to add a painting).
     */
    placeholder: todo.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fanArt) {
      for (const key of ["subject", "owner"] as const) {
        if (!data[key]) ctx.addIssue({ code: "custom", path: [key], message: "fan art needs it (the label names its subject and owner)" });
      }
    }
  });

export type PostMeta = z.infer<typeof postFrontmatter> & { slug: string };
/** A post's source format: `.md` (markdown, src/content/Markdown.tsx) or `.mdx` (src/content/Mdx.tsx). */
export type PostFormat = "md" | "mdx";
export type Post = PostMeta & {
  body: string;
  readingMinutes: number;
  format: PostFormat;
  /** Its path from the repository's root, for error messages. */
  file: string;
  /** The lines of frontmatter above the body, so an error names the line in the file. */
  bodyStart?: number;
};
export type WorkMeta = z.infer<typeof workFrontmatter> & { slug: string };
export type Work = WorkMeta & { body: string };
export type ArtMeta = z.infer<typeof artFrontmatter> & { slug: string };

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Reads one markdown or MDX file: validated frontmatter plus the body. */
export function readContentFile<T extends z.ZodType>(
  file: string,
  schema: T,
): { slug: string; data: z.infer<T>; body: string } {
  const raw = readFileSync(file, "utf8");
  const name = path.relative(process.cwd(), file);
  const match = raw.match(FRONTMATTER);
  if (!match) throw new Error(`${name}: no frontmatter (a --- block at the top)`);

  let yaml: unknown;
  try {
    yaml = parseYaml(match[1]);
  } catch (error) {
    throw new Error(`${name}: frontmatter is not valid YAML: ${(error as Error).message}`);
  }

  const result = schema.safeParse(yaml ?? {});
  if (!result.success) {
    const problems = result.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new Error(`${name}: invalid frontmatter\n${problems.join("\n")}`);
  }

  return { slug: path.basename(file, path.extname(file)), data: result.data, body: raw.slice(match[0].length) };
}

/** Every `.md` file in `dir`, or none when the directory does not exist yet. */
export function markdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => path.join(dir, f));
}

/** Every post file in `dir` (`.md` and `.mdx`), or none when the directory does not exist yet. */
export function postFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}
