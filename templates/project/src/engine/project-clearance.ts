/**
 * Clearance checks swept over the full range of motion. Run by scripts/check-clearance.ts.
 * Each check returns the gap (mm) at a motion parameter t in [0, 1). Negative = collision.
 * TEMPLATE DEMO: replace with the project's moving-part pairs.
 */
import { v } from "../spec/values";
import { crankPivotXZ, demoFourBar } from "./demo-linkage";
import { solveFourBar } from "./formulas/linkage";

export interface ClearanceCheck {
  readonly id: string;
  readonly label: string;
  readonly minGapMm: number;
  readonly samples: number;
  readonly gapAt: (t: number) => number;
}

const plateTop = v("plateThickness");
const [ox, oz] = crankPivotXZ;

/** Lowest point of the moving linkage (crank pin, rocker pin, arm tip) at crank fraction t. */
function lowestZ(t: number, armLength: number): number {
  const pose = solveFourBar(demoFourBar, t * 2 * Math.PI);
  if (!pose) return Number.NEGATIVE_INFINITY;
  const tipZ = oz + armLength * Math.sin(pose.rockerAngle);
  return Math.min(oz + pose.a[1], oz + pose.b[1], tipZ);
}

export const clearanceChecks: readonly ClearanceCheck[] = [
  {
    id: "linkage-plate",
    label: "Linkage and output arm clear the base plate",
    minGapMm: 5,
    samples: 720,
    gapAt: (t) => lowestZ(t, v("outputArmLength")) - plateTop,
  },
  {
    id: "arm-motor",
    label: "Output arm tip stays forward of the motor",
    minGapMm: 5,
    samples: 720,
    gapAt: (t) => {
      const pose = solveFourBar(demoFourBar, t * 2 * Math.PI);
      if (!pose) return Number.NEGATIVE_INFINITY;
      const tipX = ox + v("groundLength") + v("outputArmLength") * Math.cos(pose.rockerAngle);
      const motorFront =
        ox - (v("gearModule") * (v("pinionTeeth") + v("gearTeeth"))) / 2 + v("motorDiameter") / 2;
      return tipX - motorFront;
    },
  },
];
