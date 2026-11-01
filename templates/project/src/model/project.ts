/**
 * Project-specific viewer configuration: explode order, camera views, screen labels and the list of
 * modules to build. TEMPLATE DEMO: replace alongside src/spec in Phase 7.
 */
import { Vector3 } from "three";
import type { ExplodeGroupDef } from "./explode";
import { buildDemoRig } from "./parts/demo-rig";
import type { ModuleContext, ModuleHandle } from "./types";

/** Outside-in. order >= 99 never moves (the frame everything else is taken off). */
export const explodeGroups: readonly ExplodeGroupDef[] = [
  {
    key: "arm",
    order: 1,
    caption: "Output arm off: fixed to the rocker, it carries the payload at its tip.",
  },
  {
    key: "linkage",
    order: 2,
    caption: "Crank-rocker linkage and shafts: the crank turns, the rocker swings through its stroke.",
  },
  { key: "gears", order: 3, caption: "Gear stage: the pinion drives the crank gear at the tooth ratio." },
  { key: "motor", order: 4, caption: "Motor out from behind the upright." },
  {
    key: "fasteners",
    order: 5,
    caption: "Fasteners: what remains is the frame, the base plate and the upright.",
  },
  { key: "frame", order: 99, caption: "" },
];

export const cameraTarget = new Vector3(10, 0, 50);

/** Distance (mm) from the target for the six axis views. Must sit inside the zoom range. */
const viewDistance = 520;
/** A camera position `viewDistance` from the target along the body-frame direction (x, y, z). */
const along = (x: number, y: number, z: number): Vector3 =>
  new Vector3(x, y, z).normalize().multiplyScalar(viewDistance).add(cameraTarget);

/**
 * Camera presets. Body frame: x forward, y left, z up. The six axis views come in opposite pairs;
 * top and bottom lean 0.1° off vertical so OrbitControls (camera.up = +z) never sees a degenerate pose.
 */
export const views = {
  iso: new Vector3(240, 285, 175),
  front: along(1, 0, 0),
  rear: along(-1, 0, 0),
  left: along(0, 1, 0),
  right: along(0, -1, 0),
  top: along(0.002, 0, 1),
  bottom: along(0.002, 0, -1),
} as const;

export type ViewName = keyof typeof views;

export const ground = { size: 500, divisions: 20, z: 0 } as const;

/**
 * Zoom range: camera distance to the target (mm), for the wheel and the +/- buttons alike.
 * Pick it from the model's size: minDistance close enough to read the smallest detail without the
 * camera entering parts, maxDistance far enough to see the whole model with margin. `step` is the
 * distance factor per button press. 100 % in the readout is the 3/4 view distance.
 */
export const zoom = { minDistance: 120, maxDistance: 1100, step: 1.25 } as const;

/** Where the labelled grid is laid out (body frame, mm). */
export const gridCentre = new Vector3(0, 0, 40);

/** Screen labels pinned to module anchors. */
export const tags = [
  { text: "Output arm", anchor: "armTip", accent: false },
  { text: "Front (+x)", anchor: "front", accent: true },
] as const;

export function buildModules(ctx: ModuleContext): ModuleHandle[] {
  return [buildDemoRig(ctx)];
}
