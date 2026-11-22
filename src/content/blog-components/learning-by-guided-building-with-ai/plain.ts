// The three diagrams as plain markdown, for the post's twin (/blog/<slug>.md)
// and its word count: the same words the diagrams show. No React here
// (src/content/mdx-plain.ts uses it).

import { dial, loop, scaffold, WHO_NAME, type Example } from "./data";

function example(e: Example): string {
  const body = e.code ? `\`\`\`cpp\n${e.lines.join("\n")}\n\`\`\`` : e.lines.map((l) => `> ${l}`).join("\n>\n");
  return [`${e.label}:`, body, e.remark].filter(Boolean).join("\n\n");
}

export function loopPlain(): string {
  const stages = loop.stages.map(
    (s, i) => `${i + 1}. ${s.name} (${WHO_NAME[s.who]}${s.optional ? ", optional" : ""}): ${s.text}`,
  );
  const examples = loop.stages.flatMap((s) => (s.example ? [example(s.example)] : []));
  return [
    `${loop.title}, then back to step 3 for the next brief:`,
    stages.join("\n"),
    ...examples,
    loop.credit,
  ].join("\n\n");
}

export function scaffoldPlain(): string {
  const levels = scaffold.levels.map(
    (l) => `- ${l.name} (${l.status}): ${l.text} Gives: ${l.gives.length ? l.gives.join(", ") : "no brief"}.`,
  );
  return [`${scaffold.title}. ${scaffold.step.replace(/`/g, "")}`, levels.join("\n"), scaffold.credit].join("\n\n");
}

export function dialPlain(): string {
  const settings = dial.settings.map((s) => {
    const who = [`types: ${WHO_NAME[s.types]}`, s.reviews ? `reviews: ${WHO_NAME[s.reviews]}` : ""].filter(Boolean);
    return `- ${s.name} (${s.scope}; ${who.join("; ")}): ${s.text}${s.then ? ` ${dial.rows.then}: ${s.then}` : ""}`;
  });
  return [`${dial.title}:`, settings.join("\n"), dial.credit].join("\n\n");
}

/** By component name, as the post writes it. */
export const plain = {
  TheLoop: loopPlain,
  ScaffoldComesDown: scaffoldPlain,
  TheDial: dialPlain,
};
