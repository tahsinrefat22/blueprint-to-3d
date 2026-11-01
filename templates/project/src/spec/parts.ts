import type { Part } from "./schema";
import { type ValueKey, v } from "./values";

/**
 * Part catalogue, as DFLY's INFO table: drives the legend, picking, highlighting, info panel,
 * grid labels and the mass budget. Order here is the legend order.
 * Instance centroids are in the body frame (mm) and feed the CG calculation.
 */
const shaftZ = v("shaftHeight");
const gearCentre = (v("gearModule") * (v("pinionTeeth") + v("gearTeeth"))) / 2;

const files = ["src/spec/values.ts", "docs/02-analysis.md"];

export const parts = [
  {
    key: "plate",
    name: "Base plate",
    massKey: "massPlate",
    instances: [[0, 0, v("plateThickness") / 2]],
    status: "open",
    color: "#9aa7ad",
    description: "Template demo. Flat base that carries the upright and is the reference for the body frame.",
    files,
  },
  {
    key: "upright",
    name: "Upright",
    massKey: "massUpright",
    instances: [[0, -10, shaftZ / 2]],
    status: "open",
    color: "#bfc9cc",
    description: "Template demo. Vertical plate that holds the motor, crank and rocker shafts.",
    files,
  },
  {
    key: "motor",
    name: "Motor",
    massKey: "massMotor",
    instances: [[-gearCentre, -28, shaftZ]],
    status: "open",
    color: "#56626a",
    description: "Template demo. Drives the pinion. Speed and stall torque feed the calculation panel.",
    files: [...files, "src/engine/formulas/drive.ts"],
  },
  {
    key: "pinion",
    name: "Pinion",
    massKey: "massPinion",
    instances: [[-gearCentre, -5, shaftZ]],
    status: "open",
    color: "#c9a227",
    description: "Template demo. Small gear on the motor shaft.",
    files: [...files, "src/engine/formulas/drive.ts"],
  },
  {
    key: "gear",
    name: "Crank gear",
    massKey: "massGear",
    instances: [[0, -5, shaftZ]],
    status: "open",
    color: "#e6dcc3",
    description: "Template demo. Large gear on the crank shaft; reduces motor speed by the tooth ratio.",
    files: [...files, "src/engine/formulas/drive.ts"],
  },
  {
    key: "linkage",
    name: "Crank-rocker linkage",
    massKey: "massLinkage",
    instances: [[v("groundLength") / 2, 6, shaftZ + 12]],
    status: "open",
    color: "#3d5a9c",
    description:
      "Template demo. Crank, coupler and rocker solved as a real four-bar: the output swings, it is not faked.",
    files: [...files, "src/engine/formulas/linkage.ts"],
  },
  {
    key: "arm",
    name: "Output arm",
    massKey: "massOutputArm",
    instances: [[v("groundLength"), 9, shaftZ + 25]],
    status: "open",
    color: "#b54a3c",
    description: "Template demo. Rigidly fixed to the rocker; carries the payload at its tip.",
    files,
  },
  {
    key: "fasteners",
    name: "Fasteners",
    massKey: "massFasteners",
    instances: [[0, -10, shaftZ / 2]],
    status: "open",
    color: "#8a8f94",
    description: "Template demo. Screws, nuts and pins, lumped.",
    files,
  },
] as const satisfies readonly (Part & { massKey: ValueKey })[];

export type PartKey = (typeof parts)[number]["key"];

export const partByKey = (key: string): Part | undefined => parts.find((p) => p.key === key);
