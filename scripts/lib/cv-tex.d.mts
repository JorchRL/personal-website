import type { Cv } from "../../src/content/cv";

export const BULLET_WINDOW: { min: number; max: number };
export function esc(text: string): string;
export function rich(text: string): string;
export function bulletLength(text: string): number;
export function bulletsOutsideWindow(cv: Cv): { entry: string; text: string; length: number }[];
export function cvTex(cv: Cv, site: string): string;
