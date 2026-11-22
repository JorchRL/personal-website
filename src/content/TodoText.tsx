// A frontmatter string (a title, a description, a period) shown on a page,
// with each TODO(jorge) in it marked as <Markdown> marks one in a body:
// <mark class="todo">. Places that must never show a TODO use stripTodos.

import { Fragment } from "react";
import { matchTodos } from "./todos";

export function TodoText({ text }: { text: string }) {
  const todos = matchTodos(text);
  if (todos.length === 0) return text;
  const parts: React.ReactNode[] = [];
  let at = 0;
  for (const { index, text: todo } of todos) {
    if (index > at) parts.push(text.slice(at, index));
    parts.push(
      <mark key={index} className="todo">
        {todo}
      </mark>,
    );
    at = index + todo.length;
  }
  if (at < text.length) parts.push(text.slice(at));
  return <Fragment>{parts}</Fragment>;
}
