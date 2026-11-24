// Final shading: a sheet of cotton paper on a dark table, lit by one lamp.
//
// Paper model: Oren-Nayar diffuse (rough matte fibres) + Charlie sheen (the soft
// glow fibres give at grazing light) + a weak GGX lobe whose strength and
// roughness depend on the surface: bare paper, gouache (satin), ink (a little gloss).
// Albedo = pigment colour from the scan, linear.

export const RENDER = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uAlbedo, uNormal, uHeight;
uniform vec2 uSheetMM, uCanvas, uOrigin;   // uOrigin: sheet mm at the canvas top-left
uniform float uMMPerPx, uTexelMM;
uniform vec3 uLamp;                        // lamp position, mm, x right, y down, z up
uniform vec3 uTable;                       // around the sheet: the well's colour, sRGB
uniform float uLampRadius, uDownDim, uIntensity, uAmbient, uRelief, uView, uShadows, uHasHeight;
out vec4 o;

const float PI = 3.14159265;

vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

float lodFor(vec2 texSize) {
  // pixels on screen per texel -> mip level for minification
  return max(0.0, log2(uMMPerPx / uTexelMM));
}

float D_GGX(float NdotH, float a) { float a2 = a * a; float d = NdotH * NdotH * (a2 - 1.0) + 1.0; return a2 / (PI * d * d); }
float V_SmithGGX(float NdotL, float NdotV, float a) {
  float a2 = a * a;
  float gv = NdotL * sqrt(NdotV * NdotV * (1.0 - a2) + a2);
  float gl = NdotV * sqrt(NdotL * NdotL * (1.0 - a2) + a2);
  return 0.5 / max(gv + gl, 1e-5);
}
float D_Charlie(float NdotH, float r) { float inv = 1.0 / r; float s2 = 1.0 - NdotH * NdotH; return (2.0 + inv) * pow(max(s2, 0.0), inv * 0.5) / (2.0 * PI); }
float V_Neubelt(float NdotL, float NdotV) { return 1.0 / (4.0 * (NdotL + NdotV - NdotL * NdotV)); }

float heightAt(vec2 uv, float lod) { vec2 h = textureLod(uHeight, uv, lod).rg; return (h.r + h.g) * uRelief; }

void main() {
  vec2 px = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);
  vec2 p = uOrigin + px * uMMPerPx;          // mm on the table, sheet at [0, uSheetMM]
  vec2 uv = p / uSheetMM;
  bool onSheet = all(greaterThanEqual(uv, vec2(0.0))) && all(lessThanEqual(uv, vec2(1.0)));
  float lod = lodFor(uSheetMM);

  vec3 albedo; vec3 n = vec3(0, 0, 1); float gloss = 0.0, ink = 0.0, h = 0.0, hFine = 0.0, hCock = 0.0;
  if (onSheet) {
    albedo = textureLod(uAlbedo, uv, lod).rgb;
    vec4 nn = textureLod(uNormal, uv, lod);
    n = normalize(vec3(nn.xy * uRelief, nn.z));
    gloss = nn.a;
    vec4 hh = textureLod(uHeight, uv, lod);
    ink = hh.a;
    h = (hh.r + hh.g) * uRelief * uHasHeight;
    hFine = hh.r; hCock = hh.g;
  } else {
    // Around the sheet is the page's own well, unlit, so turning the Lamp on changes nothing outside the paper.
    o = vec4(uTable, 1.0);
    return;
  }

  if (uView > 0.5 && onSheet) {
    vec3 c;
    if (uView < 1.5) c = vec3(n.x, -n.y, n.z) * 0.5 + 0.5;            // normal map, OpenGL style (y up)
    else if (uView < 2.5) c = vec3(clamp(0.5 + hCock * 0.35 + hFine * 7.0, 0.0, 1.0)); // height (fine exaggerated)
    else c = toSRGB(albedo);                                             // flat albedo
    o = vec4(c, 1.0);
    return;
  }

  vec3 P = vec3(p, h);
  vec3 Lv = uLamp - P;
  float d2 = dot(Lv, Lv);
  vec3 l = Lv * inversesqrt(d2);
  vec3 v = vec3(0, 0, 1);
  float sinA = clamp(uLampRadius * inversesqrt(d2), 0.0, 0.9);   // lamp's angular radius

  // Sphere-light horizon softening of N.L (cheap wrap by angular size).
  float NdotLraw = dot(n, l);
  float NdotL = clamp((NdotLraw + sinA * 0.5) / (1.0 + sinA * 0.5), 0.0, 1.0);
  float NdotV = max(dot(n, v), 1e-3);
  vec3 hv = normalize(l + v);
  float NdotH = max(dot(n, hv), 0.0);
  float VdotH = max(dot(v, hv), 0.0);

  // Oren-Nayar (qualitative), sigma ~ 0.35 rad for paper fibres.
  float s2 = 0.35 * 0.35;
  float A = 1.0 - 0.5 * s2 / (s2 + 0.33), B = 0.45 * s2 / (s2 + 0.09);
  float sOn = dot(l, v) - NdotLraw * NdotV;
  float tOn = sOn > 0.0 ? max(NdotLraw, NdotV) : 1.0;
  vec3 fd = albedo / PI * (A + B * max(sOn, 0.0) / max(tOn, 1e-3));

  // Specular lobe per surface.
  float paperOnly = onSheet ? (1.0 - gloss) * (1.0 - ink) : 1.0;
  float rough = onSheet ? mix(mix(0.72, 0.42, gloss), 0.32, ink) : 0.6;
  float specW = onSheet ? mix(mix(0.35, 0.9, gloss), 1.0, ink) : 0.3;
  float a = rough * rough;
  float F = 0.04 + 0.96 * pow(1.0 - VdotH, 5.0);
  float fs = D_GGX(NdotH, max(a, sinA * 0.5)) * V_SmithGGX(NdotL, NdotV, a) * F * specW;

  // Sheen from loose cotton fibres (bare and lightly painted paper).
  float sheen = onSheet ? D_Charlie(NdotH, 0.5) * V_Neubelt(max(NdotL, 1e-3), NdotV) * 0.07 * paperOnly : 0.0;

  // Self-shadowing: march the height field toward the lamp.
  float shadow = 1.0;
  if (onSheet && uShadows > 0.5 && uHasHeight > 0.5 && NdotL > 0.0) {
    float horiz = length(Lv.xy);
    vec2 dir = Lv.xy / max(horiz, 1e-4);
    float slope = Lv.z / max(horiz, 1e-4);
    float pen = max(sinA, 0.01);
    for (int i = 1; i <= 24; i++) {
      float fi = float(i);
      float t = uTexelMM * (fi + fi * fi * 0.22);
      if (t > horiz) break;
      vec2 q = (p + dir * t) / uSheetMM;
      float ray = h + t * slope;
      float hq = heightAt(q, max(lod, log2(1.0 + fi * 0.25)));
      shadow = min(shadow, smoothstep(-pen, pen, (ray - hq) / t));
    }
  }

  vec3 lampColor = vec3(1.0, 0.94, 0.86);           // warm-white bulb
  // Raking lamp has a shade aimed sideways: little light falls straight down.
  float shade = mix(uDownDim, 1.0, smoothstep(0.3, 0.97, length(l.xy)));
  vec3 E = lampColor * uIntensity * shade / d2 * NdotL;
  vec3 col = E * (fd + fs + sheen) * shadow * PI;
  col += uAmbient * albedo * (0.6 + 0.4 * n.z);

  o = vec4(toSRGB(aces(col)), 1.0);
}`;
