/** Camera presets and smooth fly-to between poses. */
import { type PerspectiveCamera, Vector3 } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

const smoothstep = (x: number): number => x * x * (3 - 2 * x);

export class CameraRig {
  private readonly p0 = new Vector3();
  private readonly p1 = new Vector3();
  private readonly t0 = new Vector3();
  private readonly t1 = new Vector3();
  private t = 1;
  private duration = 1;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly controls: OrbitControls,
  ) {}

  flyTo(position: Vector3, target: Vector3, seconds: number, reduceMotion: boolean): void {
    this.p0.copy(this.camera.position);
    this.t0.copy(this.controls.target);
    this.p1.copy(position);
    this.t1.copy(target);
    this.t = 0;
    this.duration = reduceMotion ? 0.01 : seconds;
  }

  /** Returns true while flying. */
  update(dt: number): boolean {
    if (this.t >= 1) return false;
    this.t = Math.min(1, this.t + dt / this.duration);
    const k = smoothstep(this.t);
    this.camera.position.lerpVectors(this.p0, this.p1, k);
    this.controls.target.lerpVectors(this.t0, this.t1, k);
    return true;
  }
}
