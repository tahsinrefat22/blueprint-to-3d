/**
 * Coordinate frames. Body frame: millimetres, x forward, y left, z up (camera.up = +z).
 * Repeated or tilted modules get a LocalFrame so their geometry is written in local coordinates
 * (DFLY's U(unit, side, s, u, w) helper), with `side = ±1` for mirroring instead of duplicated code.
 */
import { Matrix4, Quaternion, Vector3 } from "three";

export const AXIS_X = Object.freeze(new Vector3(1, 0, 0));
export const AXIS_Y = Object.freeze(new Vector3(0, 1, 0));
export const AXIS_Z = Object.freeze(new Vector3(0, 0, 1));

const _m = new Matrix4();

export class LocalFrame {
  readonly origin: Vector3;
  readonly e1: Vector3;
  readonly e2: Vector3;
  readonly e3: Vector3;
  /** Rotation taking local (x, y, z) to (e1, e2, e3). */
  readonly quaternion: Quaternion;

  constructor(origin: Vector3, e1: Vector3, e2: Vector3, e3: Vector3) {
    this.origin = origin.clone();
    this.e1 = e1.clone().normalize();
    this.e2 = e2.clone().normalize();
    this.e3 = e3.clone().normalize();
    if (this.e1.clone().cross(this.e2).dot(this.e3) < 0.999) {
      throw new Error("LocalFrame axes must be orthonormal and right-handed (e1 × e2 = e3)");
    }
    this.quaternion = new Quaternion().setFromRotationMatrix(_m.makeBasis(this.e1, this.e2, this.e3));
  }

  /** World point of local (a, b, c), written into `target` (no allocation). */
  point(a: number, b: number, c: number, target: Vector3): Vector3 {
    return target
      .copy(this.origin)
      .addScaledVector(this.e1, a)
      .addScaledVector(this.e2, b)
      .addScaledVector(this.e3, c);
  }

  /** World direction of local (a, b, c), written into `target`. */
  direction(a: number, b: number, c: number, target: Vector3): Vector3 {
    return target
      .set(0, 0, 0)
      .addScaledVector(this.e1, a)
      .addScaledVector(this.e2, b)
      .addScaledVector(this.e3, c);
  }
}
