// Image helpers on Float32Array planes (row-major, W*H): blurs, the guided
// filter, binary dilate and erode, push-pull hole filling, polygon masks.
export function boxBlur(src, W, H, r) {
  // separable box filter via running sums, clamped edges
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  const n = 2 * r + 1;
  for (let y = 0; y < H; y++) {
    const row = y * W; let s = 0;
    for (let k = -r; k <= r; k++) s += src[row + Math.min(W - 1, Math.max(0, k))];
    for (let x = 0; x < W; x++) {
      tmp[row + x] = s / n;
      s += src[row + Math.min(W - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < W; x++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += tmp[Math.min(H - 1, Math.max(0, k)) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = s / n;
      s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
    }
  }
  return out;
}
export const gauss = (a, W, H, r) => boxBlur(boxBlur(boxBlur(a, W, H, r), W, H, r), W, H, r);

// He et al. guided filter: edge-aware smoothing of p using guide I
export function guided(I, p, W, H, r, eps) {
  const N = W * H;
  const mI = boxBlur(I, W, H, r), mp = boxBlur(p, W, H, r);
  const Ip = new Float32Array(N), II = new Float32Array(N);
  for (let i = 0; i < N; i++) { Ip[i] = I[i] * p[i]; II[i] = I[i] * I[i]; }
  const mIp = boxBlur(Ip, W, H, r), mII = boxBlur(II, W, H, r);
  const a = new Float32Array(N), b = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const cov = mIp[i] - mI[i] * mp[i], v = mII[i] - mI[i] * mI[i];
    a[i] = cov / (v + eps); b[i] = mp[i] - a[i] * mI[i];
  }
  const ma = boxBlur(a, W, H, r), mb = boxBlur(b, W, H, r);
  const q = new Float32Array(N);
  for (let i = 0; i < N; i++) q[i] = ma[i] * I[i] + mb[i];
  return q;
}

// binary dilate/erode with a square-ish (box) structuring element, via box blur
export const dilate = (m, W, H, r) => boxBlur(m, W, H, r).map(v => (v > 1e-4 ? 1 : 0));
export const erode = (m, W, H, r) => boxBlur(m, W, H, r).map(v => (v > 1 - 1e-4 ? 1 : 0));

// Push-pull hole filling: rgb channels (array of planes) with weights w in [0,1].
// Builds a weighted pyramid down, then fills each level's gaps from the coarser one.
export function pushPull(chans, w, W, H) {
  const levels = [{ c: chans.map(ch => ch.map((v, i) => v * w[i])), w: Float32Array.from(w), W, H }];
  while (levels.at(-1).W > 1 || levels.at(-1).H > 1) {
    const L = levels.at(-1);
    const w2 = Math.max(1, Math.ceil(L.W / 2)), h2 = Math.max(1, Math.ceil(L.H / 2));
    const c2 = L.c.map(() => new Float32Array(w2 * h2)), ww = new Float32Array(w2 * h2);
    for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
      let sw = 0; const sc = L.c.map(() => 0);
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const sx = Math.min(L.W - 1, 2 * x + dx), sy = Math.min(L.H - 1, 2 * y + dy), i = sy * L.W + sx;
        sw += L.w[i]; L.c.forEach((ch, k) => (sc[k] += ch[i]));
      }
      const o = y * w2 + x;
      ww[o] = Math.min(1, sw); // premultiplied: keep sums normalised by weight below
      const norm = sw > 0 ? Math.min(1, sw) / sw : 0;
      sc.forEach((v, k) => (c2[k][o] = v * norm));
    }
    levels.push({ c: c2, w: ww, W: w2, H: h2 });
  }
  // pull: from coarse to fine, composite fine-over-upsampled-coarse
  for (let l = levels.length - 2; l >= 0; l--) {
    const L = levels[l], C = levels[l + 1];
    for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
      // bilinear sample of the coarse level
      const fx = Math.min(C.W - 1, Math.max(0, (x + 0.5) / 2 - 0.5)), fy = Math.min(C.H - 1, Math.max(0, (y + 0.5) / 2 - 0.5));
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(C.W - 1, x0 + 1), y1 = Math.min(C.H - 1, y0 + 1);
      const tx = fx - x0, ty = fy - y0;
      const i = y * L.W + x, a = 1 - L.w[i];
      if (a <= 0) continue;
      const s = (ch) => (ch[y0 * C.W + x0] * (1 - tx) + ch[y0 * C.W + x1] * tx) * (1 - ty) + (ch[y1 * C.W + x0] * (1 - tx) + ch[y1 * C.W + x1] * tx) * ty;
      L.c.forEach((ch, k) => (ch[i] += a * s(C.c[k])));
      L.w[i] = 1;
    }
  }
  return levels[0].c;
}

// point-in-polygon (even-odd), polygon as [[x,y],...] in pixel coords
export function polyMask(poly, W, H) {
  const m = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const xs = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) / (yj - yi)) * (xj - xi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2)
      for (let x = Math.max(0, Math.ceil(xs[k])); x < Math.min(W, xs[k + 1]); x++) m[y * W + x] = 1;
  }
  return m;
}
