// ASD-STE100 Simplified Technical English comments.
// WebGL2 shaders and shader program initialization for 3D Rubik's Cube.

import type { Quaternion, Vec3 } from "./math.ts";

export const VS_SRC = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec3 aColor;

uniform mat4 uViewProj;
uniform mat4 uModel;

out vec3 vNormal;
out vec3 vColor;
out vec3 vWorldPos;

void main() {
  vec4 worldPos = uModel * vec4(aPosition, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = mat3(uModel) * aNormal;
  vColor = aColor;
  gl_Position = uViewProj * worldPos;
}
`;

export const FS_SRC = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vColor;
in vec3 vWorldPos;

uniform vec3 uLightDir;
uniform vec3 uEyePos;

out vec4 fragColor;

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uEyePos - vWorldPos);
  vec3 H = normalize(L + V);

  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 32.0) * 0.25;
  vec3 ambient = vec3(0.22, 0.24, 0.28);

  vec3 col = vColor * (ambient + diff * 0.8) + vec3(spec);
  fragColor = vec4(col, 1.0);
}
`;

export interface GLProgramContext {
  program: WebGLProgram;
  uViewProj: WebGLUniformLocation | null;
  uModel: WebGLUniformLocation | null;
  uLightDir: WebGLUniformLocation | null;
  uEyePos: WebGLUniformLocation | null;
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initGLProgram(gl: WebGL2RenderingContext): GLProgramContext | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_SRC);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  return {
    program,
    uViewProj: gl.getUniformLocation(program, "uViewProj"),
    uModel: gl.getUniformLocation(program, "uModel"),
    uLightDir: gl.getUniformLocation(program, "uLightDir"),
    uEyePos: gl.getUniformLocation(program, "uEyePos"),
  };
}

export function computeModelMatrix(pos: Vec3, q: Quaternion): Float32Array {
  const qw = q.w;
  const qx = q.x;
  const qy = q.y;
  const qz = q.z;

  const m = new Float32Array(16);
  m[0] = 1 - 2 * (qy * qy + qz * qz);
  m[1] = 2 * (qx * qy + qz * qw);
  m[2] = 2 * (qx * qz - qy * qw);

  m[4] = 2 * (qx * qy - qz * qw);
  m[5] = 1 - 2 * (qx * qx + qz * qz);
  m[6] = 2 * (qy * qz + qx * qw);

  m[8] = 2 * (qx * qz + qy * qw);
  m[9] = 2 * (qy * qz - qx * qw);
  m[10] = 1 - 2 * (qx * qx + qy * qy);

  m[12] = pos.x;
  m[13] = pos.y;
  m[14] = pos.z;
  m[15] = 1.0;

  return m;
}
