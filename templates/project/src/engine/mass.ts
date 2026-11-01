/**
 * Mass budget and centre of gravity from the part catalogue.
 * CG = Σ(mᵢ·rᵢ) / Σmᵢ over every instance (point masses at instance centroids).
 */
import type { Confidence, Part, Sourced, Vec3 } from "../spec/schema";

export interface MassRow {
  readonly key: string;
  readonly name: string;
  readonly count: number;
  readonly massEachG: number;
  readonly totalG: number;
  readonly confidence: Confidence;
  readonly reserve: boolean;
}

export interface PointMass {
  readonly massG: number;
  readonly at: Vec3;
}

type ValueTable = Readonly<Record<string, Sourced>>;

function massOf(part: Part, values: ValueTable): Sourced {
  const entry = values[part.massKey];
  if (!entry) throw new Error(`part "${part.key}" massKey "${part.massKey}" is not in the spec`);
  if (entry.unit !== "g") throw new Error(`part "${part.key}" mass must be in g, got "${entry.unit}"`);
  return entry;
}

/** One row per part, heaviest first. */
export function massRows(parts: readonly Part[], values: ValueTable): MassRow[] {
  return parts
    .map((part) => {
      const mass = massOf(part, values);
      return {
        key: part.key,
        name: part.name,
        count: part.instances.length,
        massEachG: mass.value,
        totalG: mass.value * part.instances.length,
        confidence: mass.confidence,
        reserve: part.reserve ?? false,
      };
    })
    .sort((a, b) => b.totalG - a.totalG);
}

export const totalMassG = (rows: readonly MassRow[]): number => rows.reduce((sum, r) => sum + r.totalG, 0);

export function pointMasses(parts: readonly Part[], values: ValueTable): PointMass[] {
  return parts.flatMap((part) => {
    const { value } = massOf(part, values);
    return part.instances.map((at) => ({ massG: value, at }));
  });
}

export function centreOfGravity(points: readonly PointMass[]): Vec3 {
  let m = 0;
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of points) {
    m += p.massG;
    x += p.massG * p.at[0];
    y += p.massG * p.at[1];
    z += p.massG * p.at[2];
  }
  if (m === 0) throw new Error("centre of gravity of zero mass");
  return [x / m, y / m, z / m];
}
