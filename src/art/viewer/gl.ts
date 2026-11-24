// Tiny raw-WebGL2 helpers: programs, float render targets, full-screen passes.

export const FS_VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

export class GL {
  gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private cache = new Map<string, WebGLProgram>();

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 not available');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float not available');
    gl.getExtension('OES_texture_float_linear');
    this.gl = gl;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.vao = vao;
  }

  program(fs: string): WebGLProgram {
    const hit = this.cache.get(fs);
    if (hit) return hit;
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        const numbered = src.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n');
        console.error(numbered);
        throw new Error('shader: ' + log);
      }
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl.VERTEX_SHADER, FS_VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    this.cache.set(fs, p);
    return p;
  }

  texture(w: number, h: number, opts: { internal?: number; format?: number; type?: number; filter?: number; mips?: boolean } = {}): WebGLTexture {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    const internal = opts.internal ?? gl.RGBA16F;
    if (opts.mips) {
      const levels = Math.floor(Math.log2(Math.max(w, h))) + 1;
      gl.texStorage2D(gl.TEXTURE_2D, levels, internal, w, h);
    } else {
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, w, h);
    }
    const f = opts.filter ?? gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opts.mips ? gl.LINEAR_MIPMAP_LINEAR : f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  imageTexture(img: TexImageSource & { width: number; height: number }, srgb = true): WebGLTexture {
    const gl = this.gl;
    const t = this.texture(img.width, img.height, { internal: srgb ? gl.SRGB8_ALPHA8 : gl.RGBA8, mips: true });
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    return t;
  }

  target(w: number, h: number, opts: { internal?: number; mips?: boolean } = {}): Target {
    const gl = this.gl;
    const tex = this.texture(w, h, opts);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const st = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (st !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete ' + st);
    return { tex, fbo, w, h };
  }

  /** Runs a full-screen pass. Uniform values: number, number[], or {tex} for samplers. */
  pass(fs: string, out: Target | null, uniforms: Record<string, number | number[] | Float32Array | { tex: WebGLTexture }>, viewport?: [number, number]) {
    const gl = this.gl;
    const p = this.program(fs);
    gl.useProgram(p);
    gl.bindVertexArray(this.vao);
    let unit = 0;
    for (const [name, v] of Object.entries(uniforms)) {
      const loc = gl.getUniformLocation(p, name);
      if (loc === null) continue;
      if (typeof v === 'number') gl.uniform1f(loc, v);
      else if (v instanceof Float32Array) {
        if (v.length === 12) gl.uniformMatrix4x3fv(loc, false, v);
        else if (v.length === 9) gl.uniformMatrix3fv(loc, false, v);
      } else if (Array.isArray(v)) {
        if (v.length === 2) gl.uniform2fv(loc, v);
        else if (v.length === 3) gl.uniform3fv(loc, v);
        else if (v.length === 4) gl.uniform4fv(loc, v);
      } else {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.uniform1i(loc, unit);
        unit++;
      }
    }
    if (out) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, out.fbo);
      gl.viewport(0, 0, out.w, out.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, viewport![0], viewport![1]);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  free(t: Target) {
    this.gl.deleteFramebuffer(t.fbo);
    this.gl.deleteTexture(t.tex);
  }

  mipmaps(t: WebGLTexture) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
}
