import type { Capability, Decision } from "./schema";
import { values } from "./values";

/** Decision records. Mirror of docs/decisions/D-NN-*.md. */
export const decisions = [
  {
    id: "D-00",
    title: "Template demo placeholders",
    status: "open",
    summary:
      "Every demo value is a placeholder. Replace the whole demo with the researched design in Phase 7.",
    file: "docs/07-build-plan.md",
    covers: Object.keys(values),
  },
] as const satisfies readonly Decision[];

export const capabilities = [
  {
    name: "Swing the output arm",
    how: "Motor → 4:1 gear stage → crank-rocker. Arm sweeps through the rocker's stroke.",
    status: "expected",
    note: "Template demo.",
  },
  {
    name: "Lift a payload at the arm tip",
    how: "Required motor torque comes from the four-bar's worst-case velocity ratio and the gear stage.",
    status: "gated",
    note: "Template demo: depends on the motor's real stall torque.",
  },
] as const satisfies readonly Capability[];

export const nextSteps = [
  "Replace the template demo with the researched design (Phase 7).",
  "Stage 1: envelopes for every part; check mass, CG and clearances.",
] as const;
