import type { Sourced } from "./schema";

/**
 * THE design values. Every dimension, mass, rating and setting the model, engine and page use.
 * Units: mm, g, N, N·mm, rpm, W, V, A, °C unless the `unit` field says otherwise.
 *
 * TEMPLATE DEMO: a geared crank-rocker rig, used to show every system working.
 * Every value is `assumed` and cites S00. Replace all of it in Phase 7.
 */
const demo = (value: number, unit: string, note = "template demo value") =>
  ({ value, unit, confidence: "assumed", source: "S00", note }) as const satisfies Sourced;

export const values = {
  // Layout (body frame: x forward, y left, z up; mechanism works in the x-z plane)
  plateLength: demo(140, "mm"),
  plateWidth: demo(80, "mm"),
  plateThickness: demo(4, "mm"),
  uprightThickness: demo(3, "mm"),
  shaftHeight: demo(62, "mm"),
  crankPivotX: demo(0, "mm"),

  // Four-bar (crank-rocker). Grashof: shortest + longest <= sum of the other two.
  crankLength: demo(10, "mm"),
  couplerLength: demo(40, "mm"),
  rockerLength: demo(25, "mm"),
  groundLength: demo(38, "mm"),
  outputArmLength: demo(60, "mm"),

  // Gear stage (motor pinion -> crank gear)
  gearModule: demo(1, "mm"),
  pinionTeeth: demo(10, "teeth"),
  gearTeeth: demo(40, "teeth"),
  gearFace: demo(4, "mm"),

  // Drive
  motorDiameter: demo(24, "mm"),
  motorLength: demo(30, "mm"),
  motorSpeed: demo(3000, "rpm"),
  motorStallTorque: demo(60, "N·mm"),
  gearEfficiency: demo(0.9, "-"),
  motorLoadLimit: demo(0.3, "-", "template demo: keep running torque under this fraction of stall"),

  // Load
  payloadMass: demo(50, "g"),

  // Masses (one instance each)
  massPlate: demo(95, "g"),
  massUpright: demo(28, "g"),
  massMotor: demo(42, "g"),
  massPinion: demo(2, "g"),
  massGear: demo(9, "g"),
  massLinkage: demo(6, "g"),
  massOutputArm: demo(5, "g"),
  massFasteners: demo(8, "g"),
  massTarget: demo(210, "g", "template demo: parts-only mass budget"),
} as const satisfies Record<string, Sourced>;

export type ValueKey = keyof typeof values;

/** Numeric value of a spec entry. */
export const v = (key: ValueKey): number => values[key].value;
