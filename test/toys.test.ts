// The toys section: src/toys/<slug>/, one line each in src/toys/registry.ts,
// a page each at /toys/<slug>.

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { toys } from "@/toys/registry";

const TOYS_DIR = path.join(process.cwd(), "src/toys");

describe("toys registry", () => {
  it("lists exactly the toy folders, each under its own folder name", () => {
    const folders = readdirSync(TOYS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(path.join(TOYS_DIR, d.name, "index.tsx")))
      .map((d) => d.name)
      .sort();
    expect(toys.map((line) => line.toy.manifest.slug).sort()).toEqual(folders);
  });
});
