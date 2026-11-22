export type Clip = { left: number; right: number; kind: "clip" | "hidden" | "scroll"; name?: string };
export type Cut = { side: "left" | "right"; px: number; by: string };
export function edgeCut(box: { left: number; right: number }, clips: Clip[], width: number, tol?: number): Cut | null;
export function clippedAt(page: unknown): Promise<{ width: number; scrollWidth: number; cut: string[] }>;
