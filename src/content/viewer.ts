// The close-up viewer's files for one painting (src/art/viewer/maps.ts), made on Jorge's machine by
// `pnpm art:prepare` (scripts/art-prepare/) into public/art/<slug>/:
//
//   viewer.json                  what is there (this file's Viewer, without `base`)
//   lamp/<width>.webp            the scan, for the Lamp (the relief is estimated from it)
//   layers/<width>/L<n>.webp     the Layers' cards, back (L0) to front, with alpha
//   layers/<width>/paper.webp    the bare paper, kept still at the front
//   layers/<width>/colour.webp   the painting with the paper filled in (the depth field)
//   layers/height.webp           the depth and each pixel's layer
//
// Without layers the viewer offers the Lamp alone; without viewer.json, the
// picture alone.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { allFiles, type Viewer } from "@/art/viewer/maps";

const size = z.object({ width: z.number().int().positive(), height: z.number().int().positive() });
const manifest = z.object({
  version: z.literal(2),
  relief: z.literal("estimated"),
  sheetMM: z.tuple([z.number().positive(), z.number().positive()]),
  lamp: z.array(size).min(1),
  layers: z
    .object({
      sizes: z.array(size).min(1),
      height: size,
      cards: z.array(z.object({ name: z.string(), depth: z.number().min(0).max(1) })).min(2).max(6),
      focus: z.number().int().min(0),
    })
    .optional(),
});

export type { Viewer } from "@/art/viewer/maps";

/** Reads public/art/<slug>/viewer.json, or undefined when there is none. Throws when a file it lists is missing. */
export function readViewer(slug: string, publicDir: string, from: string): Viewer | undefined {
  const file = path.join(publicDir, "art", slug, "viewer.json");
  if (!existsSync(file)) return undefined;
  const parsed = manifest.safeParse(JSON.parse(readFileSync(file, "utf8")));
  if (!parsed.success) {
    throw new Error(`${from}: public/art/${slug}/viewer.json: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")} (rerun pnpm art:prepare)`);
  }
  const viewer: Viewer = { ...parsed.data, base: `/art/${slug}` };
  for (const url of allFiles(viewer)) {
    if (!existsSync(path.join(publicDir, url))) throw new Error(`${from}: ${url} is missing (rerun pnpm art:prepare)`);
  }
  return viewer;
}
