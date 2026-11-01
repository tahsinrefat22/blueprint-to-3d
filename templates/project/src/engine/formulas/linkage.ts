/**
 * Planar four-bar linkage (crank-rocker), solved exactly by circle-circle intersection.
 *
 * Frame: crank pivot O2 at the origin, rocker pivot O4 at (ground, 0). Angles in radians, CCW from +x.
 * Source: TEMPLATE DEMO. In a project, cite the mechanism text or paper you opened (S-id) here,
 * including the Grashof condition and the virtual-work torque relation.
 * Validity: rigid links, frictionless pins, planar motion.
 */

export type Vec2 = readonly [number, number];

export interface FourBar {
  readonly crank: number;
  readonly coupler: number;
  readonly rocker: number;
  readonly ground: number;
}

export interface FourBarPose {
  /** Crank pin (crank–coupler joint). */
  readonly a: Vec2;
  /** Rocker pin (coupler–rocker joint). */
  readonly b: Vec2;
  /** Rocker angle about O4. */
  readonly rockerAngle: number;
}

/** Grashof: s + l <= p + q. A crank-rocker additionally needs the crank to be the shortest link. */
export function grashof(fb: FourBar): { grashof: boolean; crankRocker: boolean } {
  const links = [fb.crank, fb.coupler, fb.rocker, fb.ground].sort((x, y) => x - y);
  const [s = 0, p = 0, q = 0, l = 0] = links;
  const isGrashof = s + l <= p + q;
  return { grashof: isGrashof, crankRocker: isGrashof && fb.crank === s };
}

/**
 * Pose at crank angle `q`. `branch` (+1 / -1) selects the assembly mode.
 * Returns null where the linkage cannot close.
 */
export function solveFourBar(fb: FourBar, q: number, branch: 1 | -1 = 1): FourBarPose | null {
  const ax = fb.crank * Math.cos(q);
  const ay = fb.crank * Math.sin(q);
  const dx = fb.ground - ax;
  const dy = -ay;
  const d = Math.hypot(dx, dy);
  if (d > fb.coupler + fb.rocker || d < Math.abs(fb.coupler - fb.rocker) || d === 0) return null;
  const ux = dx / d;
  const uy = dy / d;
  const along = (fb.coupler * fb.coupler - fb.rocker * fb.rocker + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, fb.coupler * fb.coupler - along * along));
  const bx = ax + along * ux - branch * h * uy;
  const by = ay + along * uy + branch * h * ux;
  return { a: [ax, ay], b: [bx, by], rockerAngle: Math.atan2(by, bx - fb.ground) };
}

export interface RockerSweep {
  readonly minAngle: number;
  readonly maxAngle: number;
  readonly stroke: number;
  /** Mid-stroke rocker angle. */
  readonly midAngle: number;
  /** max |dφ/dq| over a crank turn: the worst-case velocity ratio rocker/crank. */
  readonly maxVelocityRatio: number;
}

/** Samples a full crank turn. Throws if the linkage fails to close anywhere (not a crank-rocker). */
export function rockerSweep(fb: FourBar, samples = 720, branch: 1 | -1 = 1): RockerSweep {
  let minAngle = Number.POSITIVE_INFINITY;
  let maxAngle = Number.NEGATIVE_INFINITY;
  let maxVelocityRatio = 0;
  const dq = (2 * Math.PI) / samples;
  let prev = solveFourBar(fb, 0, branch);
  if (!prev) throw new Error("four-bar does not close at q = 0");
  for (let i = 1; i <= samples; i++) {
    const pose = solveFourBar(fb, i * dq, branch);
    if (!pose) throw new Error(`four-bar does not close at q = ${((i * dq * 180) / Math.PI).toFixed(1)}°`);
    minAngle = Math.min(minAngle, pose.rockerAngle);
    maxAngle = Math.max(maxAngle, pose.rockerAngle);
    maxVelocityRatio = Math.max(maxVelocityRatio, Math.abs(pose.rockerAngle - prev.rockerAngle) / dq);
    prev = pose;
  }
  return {
    minAngle,
    maxAngle,
    stroke: maxAngle - minAngle,
    midAngle: (minAngle + maxAngle) / 2,
    maxVelocityRatio,
  };
}

/**
 * Virtual work, rigid frictionless linkage: T_crank · dq = T_rocker · dφ, so T_crank = T_rocker · (dφ/dq).
 * With the worst-case ratio this gives the peak crank torque for a given rocker torque.
 */
export const crankTorqueFromRocker = (rockerTorque: number, velocityRatio: number): number =>
  rockerTorque * velocityRatio;
