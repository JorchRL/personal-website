// The Layers: the painting as a shadow box. The bare paper stays still at the
// front like a window; the cards sit behind it at their depths, and moving the
// pointer (or tilting a phone) moves the eye, so nearer things slide against
// farther ones. A soft light follows the other side of the eye, the cards cast
// soft shadows on what is behind them, and a depth-of-field blur keeps one
// card sharp (click or tap to focus another). Or one continuous depth field,
// ray-marched. Ported from the diorama prototype (its main.ts) with its shaders
// (shaders.ts): the canvas lies over the painting's well, and at rest the
// frame plane sits exactly where the picture is. Its controls are the markup
// that Stage.tsx renders, found here by their data-d names.

import type { Size } from "../maps";
import { DOF, VERT, scene } from "./shaders";

export type DioramaOptions = {
  cards: string[];
  paper: string;
  colour: string;
  height: string;
  heightSize: Size;
  /** Each card's depth, 0 (the back of the box) to 1 (the paper's plane). */
  depths: number[];
  /** The card in focus at the start. */
  focus: number;
  /** Where the picture sits in the canvas (CSS px, relative to it). */
  picture: () => { x: number; y: number; width: number; height: number };
  /** The page's colour around the sheet, 0..1. */
  page: [number, number, number];
  /** No idle drift when the visitor prefers reduced motion. */
  reduced: boolean;
  onReady: () => void;
};

export type Diorama = { destroy: () => void };

export async function startDiorama(root: HTMLElement, canvas: HTMLCanvasElement, opts: DioramaOptions): Promise<Diorama> {
  const $ = <T extends HTMLElement>(id: string) => root.querySelector(`[data-d="${id}"]`) as T;
  const statsEl = $("stats");
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  if (!gl) throw new Error("WebGL2 not available");
  const offs: (() => void)[] = [];
  const on = <T extends EventTarget>(t: T, type: string, fn: (e: never) => void, o?: AddEventListenerOptions) => {
    t.addEventListener(type, fn as EventListener, o);
    offs.push(() => t.removeEventListener(type, fn as EventListener, o));
  };
  const n = opts.cards.length;

  // ---------- GL plumbing ----------
  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src); gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s) ?? "shader");
    return s;
  }
  function program(fs: string) {
    const p = gl!.createProgram()!;
    gl!.attachShader(p, compile(gl!.VERTEX_SHADER, VERT));
    gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fs));
    gl!.bindAttribLocation(p, 0, "aPos");
    gl!.linkProgram(p);
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(p) ?? "link");
    const u: Record<string, WebGLUniformLocation | null> = {};
    const count = gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) { const name = gl!.getActiveUniform(p, i)!.name.replace("[0]", ""); u[name] = gl!.getUniformLocation(p, name); }
    return { p, u };
  }
  const sceneP = program(scene(n));
  const dof = program(DOF);

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function loadTex(url: string, unit: number) {
    return new Promise<{ w: number; h: number }>((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const t = gl!.createTexture();
        gl!.activeTexture(gl!.TEXTURE0 + unit);
        gl!.bindTexture(gl!.TEXTURE_2D, t);
        gl!.pixelStorei(gl!.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl!.NONE);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
        gl!.generateMipmap(gl!.TEXTURE_2D);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
        const ext = gl!.getExtension("EXT_texture_filter_anisotropic");
        if (ext) gl!.texParameterf(gl!.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
        res({ w: img.width, h: img.height });
      };
      img.onerror = () => rej(new Error(`${url} did not load`));
      img.src = url;
    });
  }

  // texture units: the cards, then the paper, the colour, the height map, the blur's input
  const TEX: Record<string, number> = {};
  opts.cards.forEach((_, k) => (TEX[`uL${k}`] = k));
  TEX.uPaper = n; TEX.uColour = n + 1; TEX.uHeight = n + 2;
  const FBO_UNIT = n + 3;
  const sizes = await Promise.all([
    ...opts.cards.map((f, k) => loadTex(f, k)),
    loadTex(opts.paper, n),
    loadTex(opts.height, n + 2),
  ]);
  const A = sizes[0].w / sizes[0].h;
  // The colour (the depth field's) loads after: the cards do not need it.
  let colourReady: Promise<unknown> | null = null;
  const colour = () => (colourReady ??= loadTex(opts.colour, n + 1));

  // height map on the CPU too, to pick a focus depth on click
  const heightCpu = await (async () => {
    const img = new Image(); img.src = opts.height; await img.decode();
    const c = document.createElement("canvas"); c.width = 384; c.height = Math.round(384 / A);
    const x = c.getContext("2d")!; x.drawImage(img, 0, 0, c.width, c.height);
    return { data: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
  })();

  // ---------- offscreen target for the DOF pass ----------
  const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5);
  let fbo: WebGLFramebuffer | null = null, fboTex: WebGLTexture | null = null;
  function resize() {
    const d = dpr();
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * d));
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * d));
    if (fboTex) gl!.deleteTexture(fboTex);
    if (fbo) gl!.deleteFramebuffer(fbo);
    fboTex = gl!.createTexture();
    gl!.activeTexture(gl!.TEXTURE0 + FBO_UNIT);
    gl!.bindTexture(gl!.TEXTURE_2D, fboTex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, canvas.width, canvas.height, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    fbo = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, fboTex, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  offs.push(() => ro.disconnect());
  resize();

  // The frame plane's rectangle on the canvas: the sheet exactly over the picture.
  function viewRect() {
    const p = opts.picture();
    const u = p.height; // CSS px per frame-plane unit (the sheet is 1 unit high)
    return [-p.x / u, -p.y / u, canvas.clientWidth / u, canvas.clientHeight / u];
  }

  // ---------- state & input ----------
  const ui = {
    mode: 1, view: 0,
    depth: $<HTMLInputElement>("depth"),
    dof: $<HTMLInputElement>("dof"),
    light: $<HTMLInputElement>("light"),
  };

  // card depths (0 = back of the box, 1 = frame plane)
  const LAYER_H = opts.depths;
  const FOCUS = LAYER_H[Math.min(opts.focus, n - 1)];
  let focusT = ui.mode ? FOCUS : 0.86, focus = focusT;

  function bindSeg(attr: "mode" | "view") {
    const btns = root.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`);
    const sync = () => btns.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset[attr]) === ui[attr])));
    btns.forEach((b) => on(b, "click", async () => {
      const v = Number(b.dataset[attr]);
      if (attr === "mode" && v === 0) await colour();
      ui[attr] = v; sync();
      if (attr === "mode") focusT = ui.mode ? FOCUS : 0.86; // refocus on the mask
    }));
    sync();
  }
  bindSeg("mode"); bindSeg("view");

  // pointer -> target look offset in [-1,1]; eased every frame
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  let lastInput = -1e9;
  let pinned: { x: number; y: number } | null = null;
  let clock: number | null = null;
  on(window, "pointermove", (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    look.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    look.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    lastInput = performance.now();
  });

  // gyro (phones). iOS needs a tap to grant permission.
  let gyroBase: { b: number; g: number } | null = null;
  function onOrient(e: DeviceOrientationEvent) {
    if (e.beta == null || e.gamma == null) return;
    if (!gyroBase) gyroBase = { b: e.beta, g: e.gamma };
    look.tx = Math.max(-1, Math.min(1, (e.gamma - gyroBase.g) / 20));
    look.ty = Math.max(-1, Math.min(1, (e.beta - gyroBase.b) / 20));
    lastInput = performance.now();
  }
  const tiltBtn = $<HTMLButtonElement>("tilt");
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (DOE && matchMedia("(pointer: coarse)").matches) {
    if (typeof DOE.requestPermission === "function") {
      tiltBtn.hidden = false;
      on(tiltBtn, "click", async () => {
        if ((await DOE.requestPermission!()) === "granted") { on(window, "deviceorientation", onOrient); tiltBtn.hidden = true; }
      });
    } else on(window, "deviceorientation", onOrient);
  }

  // click to focus: sample the depth under the cursor (where the eye ray first lands, approx.)
  on(canvas, "click", (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const [rx, ry, rw, rh] = viewRect();
    const X = rx + ((e.clientX - r.left) / r.width) * rw, Y = ry + ((e.clientY - r.top) / r.height) * rh;
    const u = X / A, v = Y;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;
    const px = Math.min(heightCpu.w - 1, Math.floor(u * heightCpu.w)), py = Math.min(heightCpu.h - 1, Math.floor(v * heightCpu.h));
    const i = (py * heightCpu.w + px) * 4;
    if (ui.mode === 1) {
      const k = Math.round(heightCpu.data[i + 1] / 51);
      focusT = LAYER_H[k] ?? 0.72;
    } else focusT = (heightCpu.data[i] + heightCpu.data[i + 2] / 255) / 255;
  });

  // ---------- frame ----------
  let frames = 0, fpsT = performance.now(), raf = 0, ready = false;
  const [hw, hh] = [opts.heightSize.width, opts.heightSize.height];
  function frame(now: number) {
    const t = (clock ?? now) / 1000;
    // idle drift so the depth reads even before anyone moves
    if (pinned) { look.tx = pinned.x; look.ty = pinned.y; }
    else if (now - lastInput > 2500 && !opts.reduced) { look.tx = Math.sin(t * 0.37) * 0.75; look.ty = Math.sin(t * 0.53 + 1) * 0.45; }
    const k = pinned ? 1 : 0.06;
    look.x += (look.tx - look.x) * k; look.y += (look.ty - look.y) * k;
    focus += (focusT - focus) * (pinned ? 1 : 0.08);

    const depth = Number(ui.depth.value);
    const Dz = 0.08 + depth * 0.5;
    const E = 2.1;
    const eye = [A / 2 + look.x * 0.3, 0.5 + look.y * 0.2, E];
    // the light trails the look direction, mirrored, so it sweeps across the relief
    const lightOn = ui.light.checked;
    const lp = [A / 2 - look.x * 0.9 + Math.sin(t * 0.21) * 0.15, 0.25 - look.y * 0.5, 0.55];

    const rect = viewRect();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.useProgram(sceneP.p);
    for (const [name, unit] of Object.entries(TEX)) gl!.uniform1i(sceneP.u[name], unit);
    gl!.uniform1fv(sceneP.u.uLayerH, LAYER_H);
    gl!.uniform2f(sceneP.u.uHeightTexel, 2.5 / hw, 2.5 / hh);
    gl!.uniform3fv(sceneP.u.uPage, opts.page);
    gl!.uniform1f(sceneP.u.uA, A);
    gl!.uniform3fv(sceneP.u.uEye, eye);
    gl!.uniform1f(sceneP.u.uDz, Dz);
    gl!.uniform4fv(sceneP.u.uRect, rect);
    gl!.uniform3fv(sceneP.u.uLight, lightOn ? lp : [A / 2, 0.45, 1.2]);
    gl!.uniform1f(sceneP.u.uLightAmt, lightOn ? 1 : 0);
    gl!.uniform1f(sceneP.u.uMode, ui.mode);
    gl!.uniform1f(sceneP.u.uView, ui.view);
    gl!.uniform1f(sceneP.u.uTime, t);
    gl!.uniform2f(sceneP.u.uPx, rect[2] / canvas.width, rect[3] / canvas.height);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.useProgram(dof.p);
    gl!.activeTexture(gl!.TEXTURE0 + FBO_UNIT); gl!.bindTexture(gl!.TEXTURE_2D, fboTex);
    gl!.uniform1i(dof.u.uScene, FBO_UNIT);
    gl!.uniform2f(dof.u.uTexel, 1 / canvas.width, 1 / canvas.height);
    gl!.uniform1f(dof.u.uFocus, focus);
    // The blur's radius in step with the sheet's size on screen (the prototype's
    // canvas was 1.08 sheets high: 14 px of blur on 1100 px).
    const sheetPx = opts.picture().height * dpr() * 1.08;
    const maxR = Number(ui.dof.value) * 14 * (sheetPx / 1100);
    gl!.uniform1f(dof.u.uMaxR, ui.view === 0 ? maxR : 0);
    gl!.uniform1f(dof.u.uDof, maxR * 2.2);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    if (!ready) { ready = true; w.__diorama = hook; opts.onReady(); void colour(); }
    frames++;
    if (now - fpsT > 1000) {
      statsEl.textContent = `${ui.mode ? `${n} cards + frame` : "height field, 72-step march"} · ${Math.round((frames * 1000) / (now - fpsT))} fps · click to focus`;
      frames = 0; fpsT = now;
    }
    raf = requestAnimationFrame(frame);
  }

  // Draw only while the canvas is on screen.
  const io = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) raf = requestAnimationFrame(frame);
  });
  io.observe(canvas);
  offs.push(() => io.disconnect());

  // The headless parity check pins the eye (and the light's clock) through this,
  // as ?lx=&ly= does on the prototype.
  const w = window as unknown as { __diorama?: unknown };
  const hook = {
    pin: (x: number, y: number) => (pinned = { x, y }),
    clock: (ms: number | null) => (clock = ms),
    ui,
  };

  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach((f) => f());
      if (w.__diorama === hook) delete w.__diorama;
      gl!.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
