// The core facts (who Jorge is, what he wants, where he is, his time zone)
// are written once, in content/site.ts, and every page and machine form reads
// them from there. And the links between the rungs of the same story (home →
// CV → work page, /about and /work-with-me → a work page's section) land on
// an anchor that exists.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { studioRoles } from "@content/about";
import { site } from "@content/site";
import { cvSlugs } from "@/content/cv";
import { getAbout } from "@/content/pages";
import { headingIds } from "@/content/slug";
import { getAllWork } from "@/content/work";
import { roleId } from "@/ui/roles";

const root = process.cwd();

/** Every source file a page is made from: content/, src/ and scripts/. */
function sources(): string[] {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const file = path.join(dir, name);
      if (statSync(file).isDirectory()) return walk(file);
      return /\.(ts|tsx|mjs|md|css)$/.test(name) ? [file] : [];
    });
  return ["content", "src", "scripts"].flatMap((d) => walk(path.join(root, d)));
}

const files = sources().map((file) => ({ name: path.relative(root, file), text: readFileSync(file, "utf8") }));
const holders = (fact: string) => files.filter((f) => f.text.includes(fact)).map((f) => f.name);

describe("core facts", () => {
  // Each is written in content/site.ts only; a copy anywhere else is a second source that can drift.
  const facts = {
    "the time zone": site.timeZone,
    "the role line": site.role,
    "what he is open to": site.open,
    "when he can start": site.start,
    "the availability line's overlap": "full overlap with US hours",
    "what he is looking for": site.lookingFor,
    "the proof line's first sentence": "designed its exam engine, content pipeline and AI tutor.",
  };

  for (const [name, fact] of Object.entries(facts)) {
    it(`writes ${name} in content/site.ts only`, () => {
      expect(holders(fact), fact).toEqual(["content/site.ts"]);
    });
  }

  it("keeps no unused copies of the ask or the call to action", () => {
    expect(Object.keys(site)).not.toContain("ask");
    expect(Object.keys(site)).not.toContain("cta");
  });

  it("fills /about's {{site.…}} placeholders from content/site.ts", () => {
    const about = getAbout();
    expect(about).not.toContain("{{");
    expect(about).toContain(site.lookingFor);
  });
});

describe("links between rungs", () => {
  const work = getAllWork();
  const anchors = new Map<string, Set<string>>([
    ...work.map((w) => [`/work/${w.slug}`, new Set(headingIds(w.body))] as const),
    ["/cv", new Set(cvSlugs())],
    ["/about", new Set(["h-roles", "h-skills", "h-why", "h-hire", ...studioRoles.map((r) => roleId(r.role))])],
  ]);

  it("land every link to a section of a work page, /cv or /about on an anchor that exists", () => {
    const links = files.flatMap((f) =>
      [...f.text.matchAll(/["(](\/(?:work\/[a-z0-9-]+|cv|about))#([\w-]+)[")]/g)].map((m) => ({ file: f.name, page: m[1], id: m[2] })),
    );
    expect(links.length).toBeGreaterThan(5);
    for (const { file, page, id } of links) {
      expect(anchors.get(page)?.has(id), `${file}: ${page}#${id}`).toBe(true);
    }
  });

  it("send each role on /about and each offer on /work-with-me to a work page, at its section where one tells it", async () => {
    const { workWithMe } = await import("@content/work-with-me");
    const hrefs = [...studioRoles.map((r) => r.href), ...workWithMe.offers.map((o) => o.proof.href)];
    for (const href of hrefs) expect(href, href).toMatch(/^\/work\/[a-z0-9-]+(#[\w-]+)?$/);
    // Every role's proof is told in a section of its work page.
    for (const role of studioRoles) expect(role.href, role.role).toContain("#");
  });

  it("give every work page in the CV an entry the work page links back to", () => {
    const slugs = new Set(work.map((w) => w.slug));
    for (const slug of cvSlugs()) expect(slugs.has(slug), slug).toBe(true);
  });
});
