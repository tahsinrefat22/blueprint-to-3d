/**
 * Small geometry helpers for clearance checks (pure, no three.js).
 * Parts are approximated as capsules (segment + radius) or points; gap = distance - radii.
 */
import type { Vec3 } from "../spec/schema";

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

/** Shortest distance between segments p1-q1 and p2-q2 (Ericson, Real-Time Collision Detection, 5.1.9). */
export function segmentDistance(p1: Vec3, q1: Vec3, p2: Vec3, q2: Vec3): number {
  const d1 = sub(q1, p1);
  const d2 = sub(q2, p2);
  const r = sub(p1, p2);
  const a = dot(d1, d1);
  const e = dot(d2, d2);
  const f = dot(d2, r);
  let s: number;
  let t: number;
  if (a <= 1e-12 && e <= 1e-12) {
    s = 0;
    t = 0;
  } else if (a <= 1e-12) {
    s = 0;
    t = clamp01(f / e);
  } else {
    const c = dot(d1, r);
    if (e <= 1e-12) {
      t = 0;
      s = clamp01(-c / a);
    } else {
      const b = dot(d1, d2);
      const denom = a * e - b * b;
      s = denom > 1e-12 ? clamp01((b * f - c * e) / denom) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp01(-c / a);
      } else if (t > 1) {
        t = 1;
        s = clamp01((b - c) / a);
      }
    }
  }
  const c1: Vec3 = [p1[0] + d1[0] * s, p1[1] + d1[1] * s, p1[2] + d1[2] * s];
  const c2: Vec3 = [p2[0] + d2[0] * t, p2[1] + d2[1] * t, p2[2] + d2[2] * t];
  const diff = sub(c1, c2);
  return Math.sqrt(dot(diff, diff));
}

/** Gap between two capsules (segment + radius). Negative means overlap. */
export const capsuleGap = (a: readonly [Vec3, Vec3, number], b: readonly [Vec3, Vec3, number]): number =>
  segmentDistance(a[0], a[1], b[0], b[1]) - a[2] - b[2];
