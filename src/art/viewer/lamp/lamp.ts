// The Lamp: the painting as a sheet of paper on a dark table, the pointer (or a
// finger) a lamp above it. Ported from the lamp prototype (its main.ts) with
// its shaders as they were (estimate.ts, render.ts, ../gl.ts): the canvas lies
// over the painting's well instead of the whole window, and at zoom 1 the
// sheet sits exactly where the picture is. Its controls are the markup that
// Stage.tsx renders, found here by their data-l names.
//
// The relief is estimated on the GPU from the scan when the Lamp starts
// (estimate.ts): grain, a procedural cotton tooth, ink, gouache and
// cockling, then normals by Sobel. Nothing about it is measured.

import { GL } from "../gl";
import { estimateSurface, type Surface } from "./estimate";
import { RENDER } from "./render";

export type LampOptions = {
  /** The scan's URL (public/art/<slug>/lamp/<width>.webp). */
  url: string;
  sheetMM: [number, number];
  /** Where the picture sits in the canvas (CSS px, relative to it): the sheet's place at zoom 1. */
  picture: () => { x: number; y: number; width: number; height: number };
  /** The colour around the sheet: the well's own, sRGB 0..1. */
  table: [number, number, number];
  /** No idle drift when the visitor prefers reduced motion. */
  reduced: boolean;
  /** Called once the first frame is drawn. */
  onReady: () => void;
};

export type Lamp = { destroy: () => void };

type Mode = "soft" | "raking";
const PRESETS = { soft: { height: 160, radius: 45 }, raking: { height: 14, radius: 3 } };

async function bitmap(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return createImageBitmap(await res.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}

export async function startLamp(root: HTMLElement, canvas: HTMLCanvasElement, opts: LampOptions): Promise<Lamp> {
  const $ = <T extends HTMLElement>(id: string) => root.querySelector(`[data-l="${id}"]`) as T;
  const g = new GL(canvas);
  const gl = g.gl;
  const offs: (() => void)[] = [];
  const on = <T extends EventTarget>(t: T, type: string, fn: (e: never) => void, o?: AddEventListenerOptions) => {
    t.addEventListener(type, fn as EventListener, o);
    offs.push(() => t.removeEventListener(type, fn as EventListener, o));
  };

  // ---------- state ----------
  const state = {
    mode: "soft" as Mode,
    height: 160, // lamp height above the table, mm
    relief: 1,
    view: 0,
    zoom: 1,
    center: [0, 0] as [number, number], // sheet mm at the canvas centre
    lamp: [0, 0] as [number, number], // smoothed lamp xy, mm
    target: [0, 0] as [number, number],
    pointerIn: false,
    idleT: 0,
  };
  const sheetMM = opts.sheetMM;

  // ---------- load ----------
  const img = await bitmap(opts.url);
  const workW = img.width, workH = img.height;
  const albedoTex = g.imageTexture(img);
  img.close();
  const est: Surface = estimateSurface(g, albedoTex, workW, workH, sheetMM);

  // ---------- view mapping ----------
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  // At zoom 1 the sheet covers the picture exactly.
  const fitMMPerPx = () => sheetMM[0] / (opts.picture().width * dpr());
  const mmPerPx = () => fitMMPerPx() / state.zoom;
  const home = (): [number, number] => {
    const p = opts.picture(), k = fitMMPerPx() * dpr();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return [sheetMM[0] / 2 + (w / 2 - (p.x + p.width / 2)) * k, sheetMM[1] / 2 + (h / 2 - (p.y + p.height / 2)) * k];
  };
  const local = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const screenToMM = (cx: number, cy: number): [number, number] => {
    const k = mmPerPx(), d = dpr();
    return [state.center[0] + (cx * d - canvas.width / 2) * k, state.center[1] + (cy * d - canvas.height / 2) * k];
  };
  const mmToScreen = (x: number, y: number): [number, number] => {
    const k = mmPerPx(), d = dpr();
    return [((x - state.center[0]) / k + canvas.width / 2) / d, ((y - state.center[1]) / k + canvas.height / 2) / d];
  };
  const resize = () => {
    const d = dpr();
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * d));
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * d));
    if (state.zoom === 1) state.center = home();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  offs.push(() => ro.disconnect());
  resize();

  // ---------- input ----------
  const pointers = new Map<number, [number, number]>();
  let pinchDist = 0;
  const zoomAt = (cx: number, cy: number, f: number) => {
    const before = screenToMM(cx, cy);
    state.zoom = Math.min(8, Math.max(1, state.zoom * f));
    const after = screenToMM(cx, cy);
    state.center[0] += before[0] - after[0];
    state.center[1] += before[1] - after[1];
    if (state.zoom === 1) state.center = home();
  };
  on(canvas, "pointermove", (e: PointerEvent) => {
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinchDist) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, dist / pinchDist);
      pinchDist = dist;
      return;
    }
    state.target = screenToMM(p[0], p[1]);
    state.pointerIn = true;
  });
  on(canvas, "pointerdown", (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId);
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 1) { state.target = screenToMM(p[0], p[1]); state.pointerIn = true; }
    pinchDist = 0;
  });
  const up = (e: PointerEvent) => { pointers.delete(e.pointerId); pinchDist = 0; };
  on(canvas, "pointerup", up);
  on(canvas, "pointercancel", up);
  on(canvas, "pointerleave", (e: PointerEvent) => { if (e.pointerType === "mouse") state.pointerIn = false; });
  on(canvas, "wheel", (e: WheelEvent) => { e.preventDefault(); const p = local(e); zoomAt(p[0], p[1], Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  on(canvas, "dblclick", () => { state.zoom = 1; state.center = home(); });
  on(window, "keydown", (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.key === "r" || e.key === "R") setMode("raking");
    else if (e.key === "s" || e.key === "S") setMode("soft");
    else if (e.key === "n" || e.key === "N") { state.view = (state.view + 1) % 4; updateUI(); }
  });

  // ---------- UI ----------
  const seg = (id: string, fn: (v: string) => void) =>
    on($(id), "click", (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest("button");
      if (b) fn(b.dataset.v!);
    });
  function setMode(m: Mode) { state.mode = m; state.height = PRESETS[m].height; updateUI(); }
  seg("mode", (v) => setMode(v as Mode));
  seg("view", (v) => { state.view = Number(v); updateUI(); });
  on($("height"), "input", (e: Event) => { state.height = Number((e.target as HTMLInputElement).value); updateUI(); });
  on($("relief"), "input", (e: Event) => { state.relief = Number((e.target as HTMLInputElement).value); updateUI(); });
  const mark = (id: string, v: string) => {
    for (const b of $(id).querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.v === v));
  };
  function updateUI() {
    mark("mode", state.mode);
    mark("view", String(state.view));
    $<HTMLInputElement>("height").value = String(state.height);
    $("heightVal").textContent = `${state.height} mm`;
    $<HTMLInputElement>("relief").value = String(state.relief);
    $("reliefVal").textContent = `×${state.relief.toFixed(2)}`;
  }

  // ---------- frame ----------
  state.center = home();
  state.lamp = [sheetMM[0] * 0.62, sheetMM[1] * 0.4];
  state.target = [...state.lamp];
  updateUI();

  const lm = $("lamp");
  let last = performance.now();
  let raf = 0;
  let ready = false;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!state.pointerIn && !opts.reduced) {
      // idle: the lamp drifts slowly around the sheet
      state.idleT += dt * 0.25;
      state.target = [sheetMM[0] * (0.5 + 0.36 * Math.cos(state.idleT)), sheetMM[1] * (0.5 + 0.3 * Math.sin(state.idleT * 1.3))];
    }
    const k = 1 - Math.exp(-dt * 9);
    state.lamp[0] += (state.target[0] - state.lamp[0]) * k;
    state.lamp[1] += (state.target[1] - state.lamp[1]) * k;

    const kpx = mmPerPx();
    const origin: [number, number] = [state.center[0] - (canvas.width / 2) * kpx, state.center[1] - (canvas.height / 2) * kpx];
    const h = state.height;
    // Exposure: fix the irradiance on a ring 45 mm from the lamp's foot, so a high
    // lamp gives a broad even pool and a low one a raking ring around a hotspot.
    const R0 = 45;
    const intensity = (0.9 * Math.pow(h * h + R0 * R0, 1.5)) / h;
    const radius = state.mode === "soft" ? PRESETS.soft.radius : PRESETS.raking.radius;

    g.pass(RENDER, null, {
      uAlbedo: { tex: albedoTex },
      uNormal: { tex: est.normal.tex },
      uHeight: { tex: est.height.tex },
      uSheetMM: sheetMM,
      uTable: opts.table,
      uCanvas: [canvas.width, canvas.height],
      uOrigin: origin,
      uMMPerPx: kpx,
      uTexelMM: sheetMM[0] / workW,
      uLamp: [state.lamp[0], state.lamp[1], h],
      uLampRadius: radius,
      uDownDim: state.mode === "raking" ? 0.04 : 1,
      uIntensity: intensity,
      uAmbient: 0.018,
      uRelief: state.relief,
      uView: state.view,
      uShadows: 1,
      uHasHeight: 1,
    }, [canvas.width, canvas.height]);

    const [sx, sy] = mmToScreen(state.lamp[0], state.lamp[1]);
    // Moved by a transform, not left/top: it follows the lamp every frame, and a box moved by layout counts as a layout shift.
    lm.style.transform = `translate(${sx}px, ${sy}px)`;
    lm.dataset.h = `lamp ${h} mm up`;
    lm.hidden = state.view !== 0;
    if (!ready) { ready = true; w.__lamp = hook; opts.onReady(); }
    raf = requestAnimationFrame(frame);
  }

  // Draw only while the canvas is on screen.
  const io = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  io.observe(canvas);
  offs.push(() => io.disconnect());

  // The headless parity check sets the lamp through this, as it does on the prototype.
  const hook = { state, setMode, updateUI, home };
  const w = window as unknown as { __lamp?: unknown };

  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach((f) => f());
      if (w.__lamp === hook) delete w.__lamp;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
