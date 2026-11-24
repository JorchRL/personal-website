// Scene: one fullscreen pass. Every pixel shoots a ray from the eye through the (fixed) paper
// frame plane z = 0 into the box behind it, and finds what it hits:
//   mode 1 (cut-out layers): flat cards at fixed depths, composited front to back;
//   mode 0 (depth field):    a ray march through the estimated height map.
// Output: rgb + hit depth h in alpha (1 = frame plane, 0 = back of the box) for the blur pass.
export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){ vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5); gl_Position = vec4(aPos, 0., 1.); }`;

// The scene pass for n cards (2 to 6). Five cards give the prototype's shader as it was.
export const scene = (n: number) => /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outC;
uniform sampler2D ${cards(n).map((k) => `uL${k}`).join(', ')}, uPaper, uColour, uHeight;
uniform float uLayerH[${n}];
uniform vec2 uHeightTexel; // 2.5 texels of the height map, in uv
uniform vec3 uPage;       // the page around the sheet
uniform float uA;        // image aspect W/H; image spans X in [0,A], Y in [0,1] (Y down)
uniform vec3 uEye;       // eye position, z = distance in front of the frame plane
uniform float uDz;       // depth of the box behind the frame
uniform vec4 uRect;      // screen uv -> frame plane: P = uRect.xy + vUv * uRect.zw
uniform vec3 uLight;     // point light (physical coords)
uniform float uLightAmt, uMode, uView, uTime;
uniform vec2 uPx;        // one canvas pixel in frame-plane units

vec2 P;

// Each depth plane is scaled up by its perspective factor, so that from the rest position
// (eye centred) every plane lines up exactly with the original painting.
float sc(float z){ return 1. - z / uEye.z; }
vec2 toUv(vec2 X, float z){ vec2 c = vec2(uA * .5, .5); vec2 r = c + (X - c) / sc(z); return vec2(r.x / uA, r.y); }
vec3 toPhys(vec2 uv, float z){ vec2 c = vec2(uA * .5, .5); return vec3(c + (vec2(uv.x * uA, uv.y) - c) * sc(z), z); }
vec2 uvAt(float z){ float t = 1. - z / uEye.z; vec2 Q = uEye.xy + t * (P - uEye.xy); return toUv(Q, z); }
float zOf(float h){ return -uDz * (1. - h); }

float H(vec4 t){ return t.r + t.b / 255.; } // 16-bit height packed in R (hi) + B (lo)
vec3 normalAt(vec2 uv){
  vec2 e = uHeightTexel;
  float hx = H(textureLod(uHeight, uv + vec2(e.x, 0.), 1.5)) - H(textureLod(uHeight, uv - vec2(e.x, 0.), 1.5));
  float hy = H(textureLod(uHeight, uv + vec2(0., e.y), 1.5)) - H(textureLod(uHeight, uv - vec2(0., e.y), 1.5));
  float k = uDz * 2.2;
  return normalize(vec3(-hx / (2. * e.x * uA) * k, -hy / (2. * e.y) * k, 1.));
}

// Gentle light: soft diffuse from a point light hovering in front of the painting.
vec3 light(vec3 col, vec2 uv, float z, float occ){
  vec3 S = toPhys(uv, z);
  vec3 L = uLight - S; float d = length(L); vec3 l = L / d;
  float diff = max(dot(normalAt(uv), l), 0.);
  float att = 1. / (1. + 1.2 * d * d);
  float lit = .70 + .62 * diff * att * 1.6 * (1. - occ);
  vec3 warm = vec3(1.05, .99, .9);
  vec3 c = col * mix(vec3(1.), warm * lit, uLightAmt);
  // the shadows still read with the light "off" (it then sits straight ahead)
  return c * (1. - occ * .5 * (1. - uLightAmt));
}

// alpha of a card at plane zj seen from point S toward the light: soft cast shadow
float castFrom(sampler2D tex, float zj, vec3 S){
  if (zj <= S.z + 1e-4) return 0.;
  float s = (zj - S.z) / (uLight.z - S.z);
  vec2 X = S.xy + s * (uLight.xy - S.xy);
  float lod = 1.5 + 55. * (zj - S.z);
  return textureLod(tex, toUv(X, zj), lod).a;
}
float frameShadow(vec3 S){ return castFrom(uPaper, 0., S); }

float layerShadow(vec3 S){
  float o = frameShadow(S);
${front(n).filter((k) => k > 0).map((k) => `  o = max(o, castFrom(uL${k}, zOf(uLayerH[${k}]), S));\n`).join('')}  return o * .62;
}

vec3 layerDebug(int k){
  vec3 c[6] = vec3[6](vec3(.16,.24,.78), vec3(1.,.78,0.), vec3(1.,.16,.63), vec3(.24,.78,.35), vec3(1.,.35,.12), vec3(.55,.31,.86));
  return c[k];
}

// composite one card (front to back, premultiplied accumulation)
void card(sampler2D tex, int k, inout vec4 acc, inout float hAcc){
  float h = uLayerH[k]; float z = zOf(h);
  vec2 uv = uvAt(z);
  vec4 t = texture(tex, uv);
  if (k > 0 && (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.)) t.a = 0.;
  if (k == 0) t.a = 1.;
  if (t.a <= 0.002) return;
  vec3 S = toPhys(uv, z);
  vec3 col = light(t.rgb, uv, z, layerShadow(S));
  if (uView == 1.) col = vec3(h);
  if (uView == 2.) col = mix(t.rgb, layerDebug(k), .55);
  float w = (1. - acc.a) * t.a;
  acc.rgb += col * w; acc.a += w; hAcc += h * w;
}

// ---- continuous: ray march the height field -------------------------------------------
float hAt(vec2 uv){ return H(texture(uHeight, uv)); }
vec4 marchField(){
  const int N = 72;
  float z0 = 0., z1 = -uDz;
  float zPrev = z0, z = z0;
  bool hit = false;
  for (int i = 1; i <= N; i++){
    z = mix(z0, z1, float(i) / float(N));
    if (z <= zOf(hAt(uvAt(z)))) { hit = true; break; }
    zPrev = z;
  }
  // refine between the last miss and the first hit
  float a = zPrev, b = z;
  for (int i = 0; i < 6; i++){
    float m = .5 * (a + b);
    if (m <= zOf(hAt(uvAt(m)))) b = m; else a = m;
  }
  vec2 uv = uvAt(b);
  float h = hAt(uv);
  vec3 col = texture(uColour, uv).rgb;
  // soft self-shadow: march toward the light through the height field
  vec3 S = toPhys(uv, b);
  float occ = frameShadow(S);
  float send = (0. - S.z) / (uLight.z - S.z);
  for (int i = 1; i <= 14; i++){
    float s = send * float(i) / 14.;
    vec3 R = S + s * (uLight - S);
    vec2 ruv = toUv(R.xy, R.z);
    float hz = zOf(H(textureLod(uHeight, ruv, 2.)));
    occ = max(occ, clamp((hz - R.z) * 24., 0., 1.));
  }
  occ *= .62;
  col = light(col, uv, b, occ);
  if (uView == 1.) col = vec3(h);
  if (uView == 2.) { int k = int(texture(uHeight, uv).g * 5. + .5); col = mix(texture(uColour, uv).rgb, layerDebug(clamp(k,0,${n - 1})), .55); }
  return vec4(col, h);
}

void main(){
  P = uRect.xy + vUv * uRect.zw;
  vec3 page = uPage;
  bool inside = P.x >= 0. && P.x <= uA && P.y >= 0. && P.y <= 1.;
  if (!inside){
    // the sheet sits on the page and casts a soft shadow away from the light
    vec2 off = -(uLight.xy - vec2(uA * .5, .5)) * .012 + vec2(0., .008);
    vec2 q = abs(P - off - vec2(uA * .5, .5)) - vec2(uA * .5, .5);
    float d = length(max(q, 0.)) + min(max(q.x, q.y), 0.);
    float sh = exp(-max(d, 0.) * 60.) * .16;
    outC = vec4(page * (1. - sh), 1.);
    return;
  }
  // frame (white paper margin) is always the front-most card, at the frame plane
  vec2 fuv = vec2(P.x / uA, P.y);
  vec4 fr = texture(uPaper, fuv);
  vec4 acc = vec4(0.); float hAcc = 0.;
  if (fr.a > .002){
    vec3 col = fr.rgb; // the paper margin stays as scanned
    if (uView == 1.) col = vec3(1.);
    acc = vec4(col * fr.a, fr.a); hAcc = fr.a;
  }
  if (acc.a < .999){
    if (uMode > .5){
${front(n).map((k) => `      card(uL${k}, ${k}, acc, hAcc);\n`).join('')}    } else {
      vec4 f = marchField();
      float w = 1. - acc.a;
      acc.rgb += f.rgb * w; hAcc += f.a * w; acc.a = 1.;
    }
  }
  outC = vec4(acc.rgb, hAcc);
}`;

const cards = (n: number) => Array.from({ length: n }, (_, k) => k);
const front = (n: number) => cards(n).reverse();

// Depth of field: gather blur where each tap only counts if its own circle of confusion
// reaches the centre pixel; far taps cannot bleed over a sharper, nearer centre.
export const DOF = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outC;
uniform sampler2D uScene;
uniform vec2 uTexel;
uniform float uFocus, uDof, uMaxR;
float coc(float h){ return clamp(abs(h - uFocus) * uDof, 0., uMaxR); }
void main(){
  vec2 uv = vec2(vUv.x, 1. - vUv.y); // FBO rows are bottom-up
  vec4 c0 = texture(uScene, uv);
  float r0 = coc(c0.a);
  vec3 sum = c0.rgb; float wsum = 1.;
  const int N = 56;
  const float GA = 2.39996323;
  for (int i = 0; i < N; i++){
    float f = (float(i) + .5) / float(N);
    float r = sqrt(f) * uMaxR;
    float a = float(i) * GA;
    vec2 o = vec2(cos(a), sin(a)) * r;
    vec4 s = texture(uScene, uv + o * uTexel);
    float rs = coc(s.a);
    if (s.a < c0.a) rs = min(rs, r0);          // farther than centre: limited by centre blur
    float w = clamp(rs - r + 1., 0., 1.);
    sum += s.rgb * w; wsum += w;
  }
  vec3 col = sum / wsum;
  // faint vignette inside the box so it reads as depth, not as a flat print
  outC = vec4(col, 1.);
}`;
