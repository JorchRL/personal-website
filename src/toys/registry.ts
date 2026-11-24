import * as dot from "./dot";
import type { ToyModule } from "./types";

export type ToyLine = {
  toy: ToyModule;
  added: string;
}

export const toys: ToyLine[] = [
  {toy: dot, added: "2026-11-22"}
]

export function getToy(slug: string): ToyLine | undefined {
  return toys.find((line) => line.toy.manifest.slug === slug)
}
