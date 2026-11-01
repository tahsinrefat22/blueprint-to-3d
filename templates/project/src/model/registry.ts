/**
 * Part registry: materials per part (for highlighting), every pickable mesh, and the representative
 * meshes per part used by the labelled grid (one instance of a repeated part, as DFLY's `rep` flag).
 */
import { type Color, type Mesh, MeshStandardMaterial, type MeshStandardMaterialParameters } from "three";
import { parts } from "../spec/parts";

const colorByKey = new Map<string, string>(parts.map((p) => [p.key, p.color]));

export class PartRegistry {
  readonly pickables: Mesh[] = [];
  private readonly reps = new Map<string, Mesh[]>();
  private readonly materials = new Map<string, MeshStandardMaterial[]>();

  /** A material tinted with the part's catalogue colour unless `overrides.color` is given. */
  material(partKey: string, overrides: MeshStandardMaterialParameters = {}): MeshStandardMaterial {
    const color = colorByKey.get(partKey);
    if (!color) throw new Error(`unknown part "${partKey}": add it to src/spec/parts.ts`);
    const material = new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15, ...overrides });
    const list = this.materials.get(partKey) ?? [];
    list.push(material);
    this.materials.set(partKey, list);
    return material;
  }

  /** Registers a mesh for picking; `representative` meshes also appear in the labelled grid. */
  add(mesh: Mesh, partKey: string, representative = true): Mesh {
    mesh.userData.part = partKey;
    this.pickables.push(mesh);
    if (representative) {
      const list = this.reps.get(partKey) ?? [];
      list.push(mesh);
      this.reps.set(partKey, list);
    }
    return mesh;
  }

  representatives(partKey: string): readonly Mesh[] {
    return this.reps.get(partKey) ?? [];
  }

  /** Part keys that have grid representatives, in catalogue order. */
  gridKeys(): string[] {
    return parts.map((p) => p.key).filter((key) => (this.reps.get(key)?.length ?? 0) > 0);
  }

  highlight(partKey: string | null, accent: Color): void {
    for (const [key, list] of this.materials) {
      for (const material of list) {
        if (key === partKey) material.emissive.copy(accent).multiplyScalar(0.5);
        else material.emissive.setRGB(0, 0, 0);
      }
    }
  }

  dispose(): void {
    for (const list of this.materials.values()) for (const material of list) material.dispose();
    this.materials.clear();
    this.reps.clear();
    this.pickables.length = 0;
  }
}
