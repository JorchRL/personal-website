// /toys is hidden on a Vercel production deploy until it is ready (src/ui/sections.ts,
// toysShown; CLAUDE.md, "Hiding /toys"): no link to it, no machine form names it,
// its routes are a 404, and the sheets after it move up a number. Everywhere else
// (pnpm dev, a local build, a preview) it is there, Sheet 03.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// The running head marks the section you are in; outside Next there is no path.
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/",
}));
import { plateNo } from "@/content/art";
import { getAllPosts } from "@/content/posts";
import { buildRss } from "@/seo/rss";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import sitemap from "@/app/sitemap";
import ToysLayout from "@/app/toys/layout";
import { Footer } from "@/ui/Footer";
import { Header } from "@/ui/Header";
import { sections, sheetLabel, shownSections, toysShown } from "@/ui/sections";

const head = () => renderToStaticMarkup(createElement(Header)) + renderToStaticMarkup(createElement(Footer));
const layout = () => ToysLayout({ children: createElement("p", null, "toys") });
const notFoundDigest = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return (error as { digest?: string }).digest;
  }
  return undefined;
};

afterEach(() => vi.unstubAllEnvs());

describe("on a production deploy, /toys", () => {
  it("is hidden", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(toysShown()).toBe(false);
  });

  it("is in neither the running head nor the footer, and the sheets after it move up", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(shownSections().map((s) => `${s.no} ${s.label}`)).toEqual(["01 Work", "02 Blog", "03 Art", "04 About"]);
    expect(head()).not.toContain('href="/toys');
    expect(head()).toContain('<sup aria-hidden="true">03</sup>Art');
    expect(["/art", "/about", "/cv", "/work-with-me"].map((href) => sheetLabel(href))).toEqual([
      "Sheet 03 — Art",
      "Sheet 04 — About",
      "Sheet 05 — CV",
      "Sheet 06 — Work with me",
    ]);
    expect(plateNo(0)).toBe("3.1");
  });

  it("is in no sitemap, llms.txt or feed", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(JSON.stringify(sitemap())).not.toContain("/toys");
    expect(await llmsTxt().text()).not.toContain("/toys");
    expect(buildRss(getAllPosts())).not.toContain("/toys");
  });

  it("and every page under it, is a 404", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(notFoundDigest(layout)).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});

describe("locally and on a preview, /toys", () => {
  it.each([undefined, "preview"])("is shown (VERCEL_ENV %s)", (env) => {
    vi.stubEnv("VERCEL_ENV", env);
    expect(toysShown()).toBe(true);
    expect(shownSections()).toEqual(sections.map((s, i) => ({ ...s, no: String(i + 1).padStart(2, "0") })));
    expect(head()).toContain('href="/toys"');
    expect(head()).toContain('<sup aria-hidden="true">04</sup>Art');
    expect(["/toys", "/art", "/about", "/cv", "/work-with-me"].map((href) => sheetLabel(href))).toEqual([
      "Sheet 03 — Toys",
      "Sheet 04 — Art",
      "Sheet 05 — About",
      "Sheet 06 — CV",
      "Sheet 07 — Work with me",
    ]);
    expect(plateNo(0)).toBe("4.1");
    expect(notFoundDigest(layout)).toBeUndefined();
  });
});
