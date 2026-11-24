// /toys and every /toys/<slug>: a 404 on a build that hides the toys (a Vercel
// production deploy, until they are ready; src/ui/sections.ts, toysShown).
// The pages under it are left as they are.

import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { toysShown } from "@/ui/sections";

export default function ToysLayout({ children }: { children: ReactNode }) {
  if (!toysShown()) notFound();
  return children;
}
