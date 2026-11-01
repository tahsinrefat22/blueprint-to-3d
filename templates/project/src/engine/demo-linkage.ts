/**
 * The demo rig's linkage and sweep, built once from the spec and shared by the engine graph,
 * the clearance checks and the 3D model. TEMPLATE DEMO: replace with the project's mechanisms.
 */
import { v } from "../spec/values";
import { type FourBar, rockerSweep } from "./formulas/linkage";

export const demoFourBar: FourBar = {
  crank: v("crankLength"),
  coupler: v("couplerLength"),
  rocker: v("rockerLength"),
  ground: v("groundLength"),
};

export const demoSweep = rockerSweep(demoFourBar);

/** Crank pivot (O2) in the body x-z plane. */
export const crankPivotXZ = [v("crankPivotX"), v("shaftHeight")] as const;
