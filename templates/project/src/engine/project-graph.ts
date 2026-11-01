/**
 * The project's calculation graph: what the calculation panel lets the user change, and what it
 * recomputes. TEMPLATE DEMO: payload → torque chain → motor load, plus mass and CG.
 * Replace in Phase 7 with the graph from docs/06-engineering-model.md.
 */
import { parts } from "../spec/parts";
import type { Vec3 } from "../spec/schema";
import { v, values } from "../spec/values";
import { demoSweep } from "./demo-linkage";
import { gearRatio, gravityTorqueNmm, inputTorqueNmm, loadFraction, outputSpeedRpm } from "./formulas/drive";
import { crankTorqueFromRocker } from "./formulas/linkage";
import type { CalcGraph } from "./graph";
import { centreOfGravity, massRows, pointMasses, totalMassG } from "./mass";
import { radToDeg, rpmToHz } from "./units";

const partsMassG = totalMassG(massRows(parts, values));

export const projectGraph = {
  inputs: [
    {
      id: "payloadMass",
      label: "Payload at arm tip",
      unit: "g",
      min: 0,
      max: 300,
      step: 5,
      initial: v("payloadMass"),
      valueKey: "payloadMass",
    },
    {
      id: "outputArmLength",
      label: "Output arm length",
      unit: "mm",
      min: 30,
      max: 120,
      step: 1,
      initial: v("outputArmLength"),
      valueKey: "outputArmLength",
      help: "Rescales the arm in the 3D model.",
    },
    {
      id: "motorSpeed",
      label: "Motor speed",
      unit: "rpm",
      min: 500,
      max: 6000,
      step: 100,
      initial: v("motorSpeed"),
      valueKey: "motorSpeed",
    },
    {
      id: "motorStallTorque",
      label: "Motor stall torque",
      unit: "N·mm",
      min: 10,
      max: 200,
      step: 1,
      initial: v("motorStallTorque"),
      valueKey: "motorStallTorque",
    },
  ],
  nodes: [
    {
      id: "partsMass",
      label: "Mass (parts)",
      unit: "g",
      deps: [],
      compute: () => partsMassG,
      digits: 1,
      limit: { max: v("massTarget"), label: "Design mass target (massTarget)" },
      help: "Sum of the part catalogue (src/spec/parts.ts).",
    },
    {
      id: "loadedMass",
      label: "Mass with payload",
      unit: "g",
      deps: ["partsMass", "payloadMass"],
      compute: (get) => get("partsMass") + get("payloadMass"),
      digits: 1,
    },
    {
      id: "gearRatio",
      label: "Gear ratio",
      unit: ":1",
      deps: [],
      compute: () => gearRatio(v("pinionTeeth"), v("gearTeeth")),
      digits: 2,
      help: "z_gear / z_pinion",
    },
    {
      id: "crankRpm",
      label: "Crank speed",
      unit: "rpm",
      deps: ["motorSpeed", "gearRatio"],
      compute: (get) => outputSpeedRpm(get("motorSpeed"), get("gearRatio")),
      digits: 0,
    },
    {
      id: "cycleHz",
      label: "Cycle rate",
      unit: "Hz",
      deps: ["crankRpm"],
      compute: (get) => rpmToHz(get("crankRpm")),
      digits: 2,
    },
    {
      id: "strokeDeg",
      label: "Output stroke",
      unit: "°",
      deps: [],
      compute: () => radToDeg(demoSweep.stroke),
      digits: 1,
      help: "Rocker swing over a full crank turn (exact four-bar solve).",
    },
    {
      id: "velocityRatio",
      label: "Peak velocity ratio",
      unit: "-",
      deps: [],
      compute: () => demoSweep.maxVelocityRatio,
      digits: 3,
      help: "max |dφ/dq| over a crank turn.",
    },
    {
      id: "payloadTorque",
      label: "Payload torque at rocker",
      unit: "N·mm",
      deps: ["payloadMass", "outputArmLength"],
      compute: (get) => gravityTorqueNmm(get("payloadMass"), get("outputArmLength")),
      digits: 1,
      help: "m·g·L, arm horizontal (worst case).",
    },
    {
      id: "crankTorque",
      label: "Peak crank torque",
      unit: "N·mm",
      deps: ["payloadTorque", "velocityRatio"],
      compute: (get) => crankTorqueFromRocker(get("payloadTorque"), get("velocityRatio")),
      digits: 1,
      help: "Virtual work: T_crank = T_rocker · dφ/dq.",
    },
    {
      id: "motorTorque",
      label: "Motor torque needed",
      unit: "N·mm",
      deps: ["crankTorque", "gearRatio"],
      compute: (get) => inputTorqueNmm(get("crankTorque"), get("gearRatio"), v("gearEfficiency")),
      digits: 2,
    },
    {
      id: "motorLoad",
      label: "Motor load",
      unit: "of stall",
      deps: ["motorTorque", "motorStallTorque"],
      compute: (get) => loadFraction(get("motorTorque"), get("motorStallTorque")),
      digits: 2,
      limit: { max: v("motorLoadLimit"), label: "Running-torque limit (motorLoadLimit)" },
    },
    {
      id: "cgHeight",
      label: "CG height",
      unit: "mm",
      deps: ["payloadMass", "outputArmLength"],
      compute: (get) => {
        const pivotX = v("crankPivotX") + v("groundLength");
        const tip: Vec3 = [
          pivotX + get("outputArmLength") * Math.cos(demoSweep.midAngle),
          9,
          v("shaftHeight") + get("outputArmLength") * Math.sin(demoSweep.midAngle),
        ];
        const points = [...pointMasses(parts, values), { massG: get("payloadMass"), at: tip }];
        return centreOfGravity(points)[2];
      },
      digits: 1,
      help: "Payload placed at the arm tip at mid-stroke.",
    },
  ],
} as const satisfies CalcGraph;
