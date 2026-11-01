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

export const views = {
  iso: new Vector3(240, 285, 175),
  front: new Vector3(520, 0, 60),
  side: new Vector3(10, 520, 60),
  top: new Vector3(10, 0.01, 560),
} as const;

export type ViewName = keyof typeof views;

export const ground = { size: 500, divisions: 20, z: 0 } as const;

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
