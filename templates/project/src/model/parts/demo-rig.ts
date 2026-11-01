/**
 * TEMPLATE DEMO module: base plate, upright, motor, gear pair and a crank-rocker with an output arm.
 * The mechanism works in the body x-z plane; shafts run along y. Every dimension comes from the spec,
 * and the linkage pose comes from the same exact solver the engine uses.
 */
import { ArrowHelper, Color, Group, Mesh, Vector3 } from "three";
import { crankPivotXZ, demoFourBar } from "../../engine/demo-linkage";
import { centreDistanceMm, gearRatio } from "../../engine/formulas/drive";
import { solveFourBar } from "../../engine/formulas/linkage";
import { degToRad } from "../../engine/units";
import { project } from "../../spec/project";
import { v } from "../../spec/values";
import { AXIS_X, AXIS_Y, AXIS_Z } from "../frames";
import {
  boxGeometry,
  createBar,
  cylinderGeometry,
  gearGeometry,
  setBar,
  sphereGeometry,
} from "../primitives";
import { cssToken } from "../theme";
import type { ModuleContext, ModuleHandle, ModuleState } from "../types";

// y stations of each layer (mm)
const Y = { upright: -10, gears: -5, crank: 3, coupler: 6, arm: 9 } as const;

export function buildDemoRig({ scene, registry, explode }: ModuleContext): ModuleHandle {
  const [ox, oz] = crankPivotXZ;
  const plateT = v("plateThickness");
  const pinionX = ox - centreDistanceMm(v("gearModule"), v("pinionTeeth"), v("gearTeeth"));
  const rockerX = ox + v("groundLength");
  const ratio = gearRatio(v("pinionTeeth"), v("gearTeeth"));

  /** Point in the mechanism plane: (u, w) relative to the crank pivot, at body y. */
  const P = (u: number, w: number, y: number, target: Vector3): Vector3 => target.set(ox + u, y, oz + w);

  // Frame: plate and upright never move.
  const frame = explode.holder("frame", new Vector3(), scene);
  const plate = new Mesh(
    boxGeometry(v("plateLength"), v("plateWidth"), plateT),
    registry.material("plate", { roughness: 0.8 }),
  );
  plate.position.set(0, 0, plateT / 2);
  frame.add(registry.add(plate, "plate"));

  const uprightX0 = pinionX - 20;
  const uprightX1 = rockerX + 12;
  const uprightH = oz + 15 - plateT;
  const upright = new Mesh(
    boxGeometry(uprightX1 - uprightX0, v("uprightThickness"), uprightH),
    registry.material("upright", { roughness: 0.7 }),
  );
  upright.position.set((uprightX0 + uprightX1) / 2, Y.upright, plateT + uprightH / 2);
  frame.add(registry.add(upright, "upright"));

  const arrow = new ArrowHelper(
    AXIS_X,
    new Vector3(v("plateLength") / 2 + 8, 0, plateT),
    32,
    new Color(cssToken("--accent")),
    9,
    5,
  );
  frame.add(arrow);

  // Fasteners: four screw heads at the upright's feet.
  const fasteners = explode.holder("fasteners", new Vector3(0, 0, 30), scene);
  const screwMat = registry.material("fasteners", { metalness: 0.6, roughness: 0.35 });
  [uprightX0 + 6, uprightX1 - 6].forEach((x, i) => {
    [Y.upright - 5, Y.upright + 5].forEach((y, j) => {
      const head = new Mesh(cylinderGeometry(2.5, 2, 16), screwMat);
      head.quaternion.setFromUnitVectors(AXIS_Y, AXIS_Z);
      head.position.set(x, y, plateT + 1);
      fasteners.add(registry.add(head, "fasteners", i === 0 && j === 0));
    });
  });

  // Motor behind the upright, shaft through it to the pinion.
  const motor = explode.holder("motor", new Vector3(0, -55, 15), scene);
  const motorLength = v("motorLength");
  const motorY0 = Y.upright - v("uprightThickness") / 2 - 1;
  const body = new Mesh(
    cylinderGeometry(v("motorDiameter") / 2, motorLength - 2, 32),
    registry.material("motor", { metalness: 0.4, roughness: 0.4 }),
  );
  body.position.set(pinionX, motorY0 - 2 - (motorLength - 2) / 2, oz);
  const face = new Mesh(
    cylinderGeometry(v("motorDiameter") / 2 - 3, 2, 32),
    registry.material("motor", { color: "#9aa6ad", metalness: 0.6, roughness: 0.3 }),
  );
  face.position.set(pinionX, motorY0 - 1, oz);
  const motorShaft = new Mesh(cylinderGeometry(1, Y.gears - motorY0 + 2, 12), face.material);
  motorShaft.position.set(pinionX, (Y.gears + motorY0) / 2, oz);
  for (const mesh of [body, face, motorShaft]) motor.add(registry.add(mesh, "motor"));

  // Gear pair (extruded along local z, turned so the axis is body y).
  const gears = explode.holder("gears", new Vector3(0, 35, -12), scene);
  const gearMesh = (teeth: number, x: number, partKey: string, metalness: number): Mesh => {
    const pivot = new Group();
    pivot.position.set(x, Y.gears, oz);
    pivot.quaternion.setFromUnitVectors(AXIS_Z, AXIS_Y);
    const mesh = new Mesh(
      gearGeometry(teeth, v("gearModule"), v("gearFace")),
      registry.material(partKey, { metalness, roughness: 0.35 }),
    );
    pivot.add(registry.add(mesh, partKey));
    gears.add(pivot);
    return mesh;
  };
  const crankGear = gearMesh(v("gearTeeth"), ox, "gear", 0.2);
  const pinion = gearMesh(v("pinionTeeth"), pinionX, "pinion", 0.65);

  // Linkage: shafts, crank, coupler, rocker and pins.
  const linkage = explode.holder("linkage", new Vector3(0, 55, 28), scene);
  const steel = registry.material("linkage", { metalness: 0.55, roughness: 0.35 });
  const pinMat = registry.material("linkage", { color: "#c8d0d3", metalness: 0.6, roughness: 0.3 });
  const shaft = (x: number, y0: number, y1: number): void => {
    const mesh = new Mesh(cylinderGeometry(1.5, y1 - y0, 16), pinMat);
    mesh.position.set(x, (y0 + y1) / 2, oz);
    linkage.add(registry.add(mesh, "linkage", false));
  };
  shaft(ox, Y.upright - 2, Y.crank + 2);
  shaft(rockerX, Y.upright - 2, Y.arm + 2);
  const crank = createBar(steel, 1.6);
  const coupler = createBar(steel, 1.3);
  const rocker = createBar(steel, 1.8);
  const pins = [0, 1].map(() => new Mesh(sphereGeometry(2.2), pinMat));
  for (const mesh of [crank, coupler, rocker, ...pins]) linkage.add(registry.add(mesh, "linkage"));

  // Output arm with the payload block at its tip.
  const armHolder = explode.holder("arm", new Vector3(0, 80, 60), scene);
  const arm = createBar(registry.material("arm", { roughness: 0.45 }), 1.6);
  const payload = new Mesh(
    boxGeometry(10, 10, 10),
    registry.material("arm", { color: "#7a3a31", roughness: 0.7 }),
  );
  armHolder.add(registry.add(arm, "arm"), registry.add(payload, "arm"));

  const anchors = {
    armTip: new Vector3(),
    front: new Vector3(v("plateLength") / 2 + 58, 0, plateT),
  };

  // Scratch vectors: update() allocates nothing.
  const s = { o2: new Vector3(), o4: new Vector3(), a: new Vector3(), b: new Vector3(), tip: new Vector3() };
  let lastPose = solveFourBar(demoFourBar, 0);

  return {
    anchors,
    update(state: ModuleState) {
      const cycleHz = state.calc.cycleHz ?? 0;
      const q =
        (2 * Math.PI * cycleHz * state.time) / project.displaySlowdown +
        degToRad(state.controls.crankOffset ?? 0);
      const pose = solveFourBar(demoFourBar, q) ?? lastPose;
      if (!pose) return;
      lastPose = pose;

      setBar(crank, P(0, 0, Y.crank, s.o2), P(pose.a[0], pose.a[1], Y.crank, s.a));
      setBar(coupler, P(pose.a[0], pose.a[1], Y.coupler, s.a), P(pose.b[0], pose.b[1], Y.coupler, s.b));
      setBar(rocker, P(v("groundLength"), 0, Y.crank, s.o4), P(pose.b[0], pose.b[1], Y.crank, s.b));
      pins[0]?.position.copy(P(pose.a[0], pose.a[1], (Y.crank + Y.coupler) / 2, s.a));
      pins[1]?.position.copy(P(pose.b[0], pose.b[1], (Y.crank + Y.coupler) / 2, s.b));

      const armLength = state.calc.outputArmLength ?? v("outputArmLength");
      P(v("groundLength"), 0, Y.arm, s.o4);
      P(
        v("groundLength") + armLength * Math.cos(pose.rockerAngle),
        armLength * Math.sin(pose.rockerAngle),
        Y.arm,
        s.tip,
      );
      setBar(arm, s.o4, s.tip);
      payload.position.copy(s.tip);
      payload.rotation.y = -pose.rockerAngle;
      anchors.armTip.copy(s.tip).add(armHolder.position);

      // Rotation about +y runs x toward -z, so the crank angle q maps to -q; meshing gears counter-rotate.
      crankGear.rotation.z = -q;
      pinion.rotation.z = ratio * q + Math.PI / v("pinionTeeth");
    },
  };
}
