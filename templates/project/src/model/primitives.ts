/**
 * Shared, cached geometry and the bar primitive. Geometry is keyed by its parameters and reused by
 * every mesh that needs it; dispose the cache once on teardown.
 */
import {
  BoxGeometry,
  type BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  type Material,
  Mesh,
  Path,
  Shape,
  SphereGeometry,
  Vector3,
} from "three";
import { AXIS_Y } from "./frames";

const cache = new Map<string, BufferGeometry>();

export function cachedGeometry(key: string, make: () => BufferGeometry): BufferGeometry {
  let geometry = cache.get(key);
  if (!geometry) {
    geometry = make();
    cache.set(key, geometry);
  }
  return geometry;
}

export function disposeGeometryCache(): void {
  for (const geometry of cache.values()) geometry.dispose();
  cache.clear();
}

export const boxGeometry = (dx: number, dy: number, dz: number): BufferGeometry =>
  cachedGeometry(`box:${dx}:${dy}:${dz}`, () => new BoxGeometry(dx, dy, dz));

/** Cylinder along local +y (three.js convention). */
export const cylinderGeometry = (radius: number, length: number, segments = 24): BufferGeometry =>
  cachedGeometry(
    `cyl:${radius}:${length}:${segments}`,
    () => new CylinderGeometry(radius, radius, length, segments),
  );

export const sphereGeometry = (radius: number): BufferGeometry =>
  cachedGeometry(`sph:${radius}`, () => new SphereGeometry(radius, 16, 12));

const unitCylinder = (): BufferGeometry =>
  cachedGeometry("unit-cyl", () => new CylinderGeometry(1, 1, 1, 16));

/** A rod of fixed radius whose ends are set each frame with setBar(). */
export function createBar(material: Material, radius: number): Mesh {
  const mesh = new Mesh(unitCylinder(), material);
  mesh.userData.radius = radius;
  return mesh;
}

const _d = new Vector3();

/** Stretches and orients a bar between p1 and p2. Allocation-free. */
export function setBar(mesh: Mesh, p1: Vector3, p2: Vector3): void {
  _d.subVectors(p2, p1);
  const length = Math.max(_d.length(), 1e-6);
  mesh.position.copy(p1).addScaledVector(_d, 0.5);
  mesh.quaternion.setFromUnitVectors(AXIS_Y, _d.multiplyScalar(1 / length));
  const r = (mesh.userData.radius as number | undefined) ?? 1;
  mesh.scale.set(r, length, r);
}

/**
 * Spur gear blank: trapezoidal teeth between root and tip circles, a bore, and lightening holes on
 * large gears. Extruded along local +z and centred on z = 0. Visual approximation of the tooth form;
 * swap in an involute profile when tooth shape matters for the page.
 */
export function gearGeometry(teeth: number, moduleMm: number, faceMm: number): BufferGeometry {
  return cachedGeometry(`gear:${teeth}:${moduleMm}:${faceMm}`, () => {
    const pitchR = (moduleMm * teeth) / 2;
    const tipR = pitchR + moduleMm;
    const rootR = pitchR - 1.25 * moduleMm;
    const pitch = (2 * Math.PI) / teeth;
    const shape = new Shape();
    for (let i = 0; i < teeth; i++) {
      const a = i * pitch;
      const points: [number, number][] = [
        [rootR, a],
        [tipR, a + pitch * 0.22],
        [tipR, a + pitch * 0.48],
        [rootR, a + pitch * 0.7],
      ];
      points.forEach(([r, angle], j) => {
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0 && j === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
    }
    const bore = new Path();
    bore.absarc(0, 0, Math.max(0.75, rootR * 0.15), 0, Math.PI * 2, true);
    shape.holes.push(bore);
    if (teeth > 20) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        const hole = new Path();
        hole.absarc(
          rootR * 0.55 * Math.cos(a),
          rootR * 0.55 * Math.sin(a),
          rootR * 0.17,
          0,
          Math.PI * 2,
          true,
        );
        shape.holes.push(hole);
      }
    }
    const geometry = new ExtrudeGeometry(shape, { depth: faceMm, bevelEnabled: false, curveSegments: 6 });
    geometry.translate(0, 0, -faceMm / 2);
    return geometry;
  });
}
