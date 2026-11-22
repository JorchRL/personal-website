import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findTodos, stripTodos } from "@/content/todos";
import { renderMarkdown } from "@/content/Markdown";

describe("findTodos", () => {
  it("finds a TODO running to the end of the line", () => {
    expect(findTodos("a TODO(jorge): cv link b")).toEqual(["TODO(jorge): cv link b"]);
  });

  it("stops a TODO at the end of its sentence or at a quote", () => {
    expect(findTodos("Led TODO(jorge): team size people. Good.")).toEqual(["TODO(jorge): team size people"]);
    expect(findTodos('cv: "TODO(jorge): CV file" }')).toEqual(["TODO(jorge): CV file"]);
  });

  it("stops a TODO at a closing paren it did not open, and keeps its own parens", () => {
    expect(findTodos("Born (TODO(jorge): year).")).toEqual(["TODO(jorge): year"]);
    expect(findTodos("TODO(jorge): CV file (PDF)")).toEqual(["TODO(jorge): CV file (PDF)"]);
  });

  it("finds every TODO in a text, and none in clean text", () => {
    expect(findTodos("TODO(jorge): one.\nTODO(jorge): two")).toEqual(["TODO(jorge): one", "TODO(jorge): two"]);
    expect(findTodos("Nothing to do here. TODO without an owner.")).toEqual([]);
  });
});

describe("stripTodos", () => {
  it("removes each sentence holding a TODO", () => {
    expect(stripTodos("Fine. Led TODO(jorge): team size people. Good.")).toBe("Fine. Good.");
  });

  it("leaves clean text alone and empties a field that is only a TODO", () => {
    expect(stripTodos("Fine. Good.")).toBe("Fine. Good.");
    expect(stripTodos("TODO(jorge): one-line summary")).toBe("");
  });

  it("keeps the other lines of a multi-line text", () => {
    expect(stripTodos("First line.\n\nTODO(jorge): a gap.\n\nLast line.")).toBe("First line.\n\nLast line.");
  });
});

describe("<Markdown> TODO marker", () => {
  it("wraps a TODO in <mark class=\"todo\">", async () => {
    const html = await renderMarkdown("Led a team of TODO(jorge): team size people. Shipped it.");
    expect(html).toBe(
      '<p>Led a team of <mark class="todo">TODO(jorge): team size people</mark>. Shipped it.</p>',
    );
  });

  it("keeps a closing paren outside the mark", async () => {
    const html = await renderMarkdown("Born (TODO(jorge): year).");
    expect(html).toBe('<p>Born (<mark class="todo">TODO(jorge): year</mark>).</p>');
  });

  it("does not mark a TODO inside code", async () => {
    const html = await renderMarkdown("`TODO(jorge): x`\n\n```\nTODO(jorge): y\n```");
    expect(html).not.toContain("<mark");
  });
});

describe("pnpm todos", () => {
  const script = path.join(process.cwd(), "scripts/todo-report.mjs");
  const fixture = path.join(process.cwd(), "test/fixtures/todos");

  it("writes TODO-REPORT.md with file, line and text", () => {
    const out = mkdtempSync(path.join(tmpdir(), "todos-"));
    try {
      const report = path.join(out, "TODO-REPORT.md");
      const result = spawnSync("node", [script, "--root", fixture, "--out", report], { encoding: "utf8" });
      expect(result.status).toBe(0);
      const text = readFileSync(report, "utf8");
      expect(text).toContain("| content/blog/sample.md | 3 | TODO(jorge): one-line summary |");
      expect(text).toContain("| content/blog/sample.md | 7 | TODO(jorge): team size people |");
      expect(text).toContain("| content/site.ts | 1 | TODO(jorge): CV file |");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  describe("the build gate", () => {
    const run = (env: Record<string, string>) =>
      spawnSync("node", [script, "--gate", "--root", fixture], {
        encoding: "utf8",
        env: { ...process.env, STRICT_TODOS: "", VERCEL_ENV: "", ...env },
      });

    it("fails under STRICT_TODOS=1 while TODOs remain, naming each one", () => {
      const strict = run({ STRICT_TODOS: "1" });
      expect(strict.status).toBe(1);
      expect(strict.stderr).toContain("STRICT_TODOS=1");
      expect(strict.stderr).toContain("content/blog/sample.md:7  TODO(jorge): team size people");
    });

    it("fails a Vercel production deploy while TODOs remain, naming each one", () => {
      const production = run({ VERCEL_ENV: "production" });
      expect(production.status).toBe(1);
      expect(production.stderr).toContain("VERCEL_ENV=production");
      expect(production.stderr).toContain("content/blog/sample.md:7  TODO(jorge): team size people");
      expect(production.stderr).toContain("content/site.ts:1  TODO(jorge): CV file");
    });

    it("passes a local build and a Vercel preview deploy", () => {
      expect(run({}).status).toBe(0);
      expect(run({ VERCEL_ENV: "preview" }).status).toBe(0);
      expect(run({ VERCEL_ENV: "development" }).status).toBe(0);
    });

    it("passes a production deploy once no TODO is left", () => {
      const clean = mkdtempSync(path.join(tmpdir(), "todos-clean-"));
      try {
        mkdirSync(path.join(clean, "content"));
        writeFileSync(path.join(clean, "content/site.ts"), 'export const cv = "/cv.pdf";\n');
        const result = spawnSync("node", [script, "--gate", "--root", clean], {
          encoding: "utf8",
          env: { ...process.env, STRICT_TODOS: "", VERCEL_ENV: "production" },
        });
        expect(result.status).toBe(0);
      } finally {
        rmSync(clean, { recursive: true, force: true });
      }
    });
  });
});
