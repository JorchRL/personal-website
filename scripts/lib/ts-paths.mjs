// Lets a plain Node script import the site's TypeScript loaders (src/content/*.ts)
// the way Next.js and Vitest do: the `@/` and `@content/` aliases from
// tsconfig.json, and imports written without the `.ts` extension. Node 22.18+
// strips the types itself. Import this module first:
//
//   import "./lib/ts-paths.mjs";
//   const { getCv } = await import("../src/content/cv.ts");

import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const aliases = { "@/": path.join(root, "src/"), "@content/": path.join(root, "content/") };
const extensions = ["", ".ts", ".tsx", "/index.ts"];

function find(base) {
  for (const ext of extensions) {
    const file = base + ext;
    if (existsSync(file) && (ext !== "" || /\.[cm]?[jt]sx?$/.test(file))) return pathToFileURL(file).href;
  }
  return undefined;
}

registerHooks({
  resolve(specifier, context, next) {
    for (const [prefix, dir] of Object.entries(aliases)) {
      if (specifier.startsWith(prefix)) {
        const url = find(dir + specifier.slice(prefix.length));
        if (url) return { url, shortCircuit: true };
      }
    }
    if (/^\.\.?\//.test(specifier) && context.parentURL?.startsWith("file:") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      const url = find(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
      if (url) return { url, shortCircuit: true };
    }
    return next(specifier, context);
  },
});
