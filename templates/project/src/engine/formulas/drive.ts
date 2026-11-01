/**
 * Gear stage and drive torque.
 * Source: TEMPLATE DEMO. In a project, cite the gear/drive reference you opened (S-id) here.
 * Validity: steady state, constant efficiency, static (or quasi-static) loads.
 */
import { weightN } from "../units";

/** Speed reduction of a simple pair: driven teeth / driving teeth. */
export const gearRatio = (drivingTeeth: number, drivenTeeth: number): number => drivenTeeth / drivingTeeth;

/** Centre distance of a spur pair, mm. */
export const centreDistanceMm = (moduleMm: number, z1: number, z2: number): number =>
  (moduleMm * (z1 + z2)) / 2;

export const outputSpeedRpm = (inputRpm: number, ratio: number): number => inputRpm / ratio;

/** Static torque of a mass held at a horizontal lever arm, N·mm. Worst case: arm horizontal. */
export const gravityTorqueNmm = (massG: number, armMm: number): number => weightN(massG) * armMm;

/** Torque needed at the input of a reduction with efficiency η. */
export const inputTorqueNmm = (outputTorqueNmm: number, ratio: number, efficiency: number): number =>
  outputTorqueNmm / (ratio * efficiency);

/** Running torque as a fraction of stall torque. */
export const loadFraction = (torqueNmm: number, stallTorqueNmm: number): number => torqueNmm / stallTorqueNmm;
