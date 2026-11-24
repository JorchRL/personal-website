import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { site } from "@content/site";
import { laterSheets, sections, sheetLabel, shownSheets } from "@/ui/sections";

describe("site constants", () => {
  it("uses the agreed name, URL, role line and intro", () => {
    expect(site.name).toBe("Jorge Romero");
    expect(site.url).toBe("https://jrlgs.dev");
    expect(site.role).toBe("Software engineer and tech lead.");
    expect(site.roles).toBe("Software engineer and watercolour artist.");
    // The link previews' line: both roles, the proof line's last sentence, what he is open to.
    expect(site.intro).toBe(
      "Software engineer and watercolour artist. Now building a game in Godot and an engine in C++. Open to remote roles and contract work.",
    );
    expect(site.proof.endsWith("Now building a game in Godot and an engine in C++.")).toBe(true);
  });

  it("has a usable email for the mailto: link", () => {
    expect(site.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("links social profiles with absolute https URLs", () => {
    for (const href of Object.values(site.social)) {
      expect(new URL(href).protocol).toBe("https:");
    }
  });

  it("carries none of the old site's filler", () => {
    const text = JSON.stringify(site);
    for (const filler of ["Creative Developer", "Available for projects", "happy clients", "50+"]) {
      expect(text).not.toContain(filler);
    }
  });
});

describe("old site redirects", () => {
  it("send each old project page, permanently, to a page that exists", async () => {
    const { default: config } = await import("../next.config");
    const { getAllWork } = await import("@/content/work");
    const pages = new Set(["/work", ...getAllWork().map((w) => `/work/${w.slug}`)]);
    const redirects = (await config.redirects!()).filter((r) => !r.has);
    expect(Object.fromEntries(redirects.map((r) => [r.source, r.destination]))).toEqual({
      "/projects": "/work",
      "/projects/edtech-platform": "/work/whiz-study",
      "/projects/spatial-collaboration": "/work/twinteraction",
      "/projects/metroidvania-game": "/work",
      "/projects/racing-simulator": "/work",
    });
    for (const r of redirects) {
      expect(pages).toContain(r.destination);
      expect("permanent" in r && r.permanent).toBe(true);
    }
  });
});

describe("old blog host", () => {
  // Where a request to blog.jrlgs.dev ends up: the first redirect on that host
  // whose source matches (as Next.js matches them), its destination filled in.
  async function follow(pathname: string) {
    const { default: config } = await import("../next.config");
    const { getPathMatch } = await import("next/dist/shared/lib/router/utils/path-match");
    const host = (await config.redirects!()).filter((r) =>
      r.has?.some((h) => h.type === "host" && h.value === "blog.jrlgs.dev"),
    );
    for (const r of host) {
      const params = getPathMatch(r.source)(pathname);
      if (!params) continue;
      const to = r.destination.replace(/:(\w+)\+?/g, (_, name: string) => String(params[name]));
      return { to, status: "statusCode" in r ? r.statusCode : undefined };
    }
    return null;
  }

  it("sends its home to /blog and each post to /blog/<slug>, permanently in one hop", async () => {
    expect(await follow("/")).toEqual({ to: "https://jrlgs.dev/blog", status: 301 });
    expect(await follow("/my-first-post")).toEqual({ to: "https://jrlgs.dev/blog/my-first-post", status: 301 });
  });

  it("sends its sitemap, robots.txt and feed to the main host's", async () => {
    for (const file of ["/sitemap.xml", "/robots.txt", "/rss.xml"]) {
      expect(await follow(file), file).toEqual({ to: `https://jrlgs.dev${file}`, status: 301 });
    }
  });

  it("sends any deeper path (series, tags, pages) to /blog", async () => {
    for (const path of ["/series/game-dev", "/tag/godot", "/page/2", "/a/b/c"]) {
      expect(await follow(path), path).toEqual({ to: "https://jrlgs.dev/blog", status: 301 });
    }
  });
});

describe("sheet numbers", () => {
  // Numbered in one place (src/ui/sections.ts): a sheet's number is its place
  // among the sheets the build shows, the sections, then /cv and /work-with-me.
  const sheets = [...sections, ...laterSheets];

  it("are never written by hand: each route asks sheetLabel for its own", () => {
    for (const { href } of sheets) {
      const route = `src/app${href}/page.tsx`;
      const text = readFileSync(route, "utf8");
      expect(text, route).toContain(`sheetLabel("${href}")`);
      expect(text, route).not.toMatch(/Sheet \d/);
    }
  });

  it.each([
    ["locally and on a preview", {}, ["01 Work", "02 Blog", "03 Toys", "04 Art", "05 About", "06 CV", "07 Work with me"]],
    ["on a production deploy, /toys hidden", { VERCEL_ENV: "production" }, ["01 Work", "02 Blog", "03 Art", "04 About", "05 CV", "06 Work with me"]],
  ])("follow the order of the sheets shown, with no gap (%s)", (_, env, expected) => {
    expect(shownSheets(env).map((s) => `${s.no} ${s.label}`)).toEqual(expected);
    expect(shownSheets(env).map((s) => sheetLabel(s.href, env))).toEqual(expected.map((e) => `Sheet ${e.replace(" ", " — ")}`));
  });
});
