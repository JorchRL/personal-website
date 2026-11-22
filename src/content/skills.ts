// /about's skills table (content/about.ts) with the cells that come from a
// work page filled in: a stack named there, or the last year of its period.
// A fact still missing on the work page is asked there only: its row waits
// (a stack) or its cell shows PENDING (a year).

import { skills, type SkillRow } from "@content/about";
import { findTodos } from "./todos";
import { getAllWork, type Work } from "./work";

/** A cell whose fact is asked on a work page and not given yet. */
export const PENDING = "—";

export type Skill = { skill: string; usedFor: string; href?: string; lastUsed: string; depth: string };

export function getSkills(): Skill[] {
  const work = getAllWork();
  const page = (slug: string): Work => {
    const found = work.find((w) => w.slug === slug);
    if (!found) throw new Error(`content/about.ts: no work page "${slug}" (content/work/${slug}.md)`);
    return found;
  };
  return skills.flatMap((row: SkillRow) => {
    let skill: string;
    if (typeof row.skill === "string") skill = row.skill;
    else {
      const stack = page(row.skill.stackOf).stack;
      if (stack.length === 0 || stack.some((item) => findTodos(item).length > 0)) return [];
      skill = stack.join(", ");
    }
    const lastUsed = typeof row.lastUsed === "string" ? row.lastUsed : lastYear(page(row.lastUsed.endOf).period);
    return [{ skill, usedFor: row.usedFor, href: row.href, lastUsed, depth: row.depth }];
  });
}

/** "2023–2026" → "2026"; "2025–now" → this year; a period with a TODO → PENDING. */
function lastYear(period: string): string {
  if (findTodos(period).length > 0) return PENDING;
  if (/now\s*$/i.test(period)) return String(new Date().getFullYear());
  return period.match(/\d{4}(?!.*\d{4})/)?.[0] ?? PENDING;
}
