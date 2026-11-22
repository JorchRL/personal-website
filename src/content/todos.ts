// A missing fact in the content is written `TODO(jorge): <what is missing>`.
// It runs to the end of its sentence, its line, a closing quote (so a TODO
// inside a quoted YAML or TypeScript string stops at the quote), or a closing
// paren it did not open.
// No imports: scripts/todo-report.mjs loads this file directly with Node.

const TODO = /TODO\(jorge\):[^\n"`<]*?(?=[.!?](?:\s|$)|["`<\n]|$)/g;

export type TodoMatch = { index: number; text: string };

/** Every TODO in `text`, with its position. */
export function matchTodos(text: string): TodoMatch[] {
  return [...text.matchAll(TODO)].map((m) => ({ index: m.index, text: closeAtParen(m[0]).trimEnd() }));
}

const PREFIX = "TODO(jorge):".length;

/** Cuts a TODO at a `)` it did not open: in "(TODO(jorge): year)" the paren is not its own. */
function closeAtParen(todo: string): string {
  let depth = 0;
  for (let i = PREFIX; i < todo.length; i++) {
    if (todo[i] === "(") depth++;
    else if (todo[i] === ")" && depth-- === 0) return todo.slice(0, i);
  }
  return todo;
}

/** The text of every TODO in `text`. */
export function findTodos(text: string): string[] {
  return matchTodos(text).map((m) => m.text);
}

/**
 * `text` without the sentences that hold a TODO, for places that must never
 * show one: `<title>`, Open Graph tags, RSS, llms.txt. Lines left empty are
 * dropped; an all-TODO field becomes "" (the caller then omits it).
 */
export function stripTodos(text: string): string {
  if (!text.includes("TODO(jorge)")) return text;
  return text
    .split("\n")
    .flatMap((line) => {
      if (!line.includes("TODO(jorge)")) return [line];
      const kept = line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !sentence.includes("TODO(jorge)"))
        .join(" ");
      return kept.trim() ? [kept] : [];
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
