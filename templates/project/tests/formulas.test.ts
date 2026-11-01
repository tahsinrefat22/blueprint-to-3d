/**
 * Every formula against a hand calculation or a published worked example.
 * In a project: one describe() per formula file, citing the source of each expected value.
 */
import { describe, expect, test } from "bun:test";
import {
  centreDistanceMm,
  gearRatio,
  gravityTorqueNmm,
  inputTorqueNmm,
  loadFraction,
  outputSpeedRpm,
} from "../src/engine/formulas/drive";
import { crankTorqueFromRocker, grashof, rockerSweep, solveFourBar } from "../src/engine/formulas/linkage";
import { capsuleGap, segmentDistance } from "../src/engine/geometry";
import { rpmToHz, STANDARD_GRAVITY, weightN } from "../src/engine/units";

describe("units", () => {
  test("weight of 1 kg is standard gravity", () => {
    expect(weightN(1000)).toBeCloseTo(STANDARD_GRAVITY, 10);
  });
  test("3000 rpm is 50 Hz", () => {
    expect(rpmToHz(3000)).toBe(50);
  });
});

describe("drive", () => {
  test("10T driving 40T is a 4:1 reduction", () => {
    expect(gearRatio(10, 40)).toBe(4);
    expect(outputSpeedRpm(3000, 4)).toBe(750);
  });
  test("module 1, 10T + 40T: centre distance 25 mm", () => {
    expect(centreDistanceMm(1, 10, 40)).toBe(25);
  });
  test("50 g at 60 mm: 0.05 × 9.80665 × 60 = 29.41995 N·mm", () => {
    expect(gravityTorqueNmm(50, 60)).toBeCloseTo(29.41995, 6);
  });
  test("100 N·mm out of a 4:1, 90 % stage needs 27.78 N·mm in", () => {
    expect(inputTorqueNmm(100, 4, 0.9)).toBeCloseTo(27.7778, 4);
    expect(loadFraction(15, 60)).toBe(0.25);
  });
});

describe("four-bar", () => {
  const fb = { crank: 10, coupler: 40, rocker: 25, ground: 38 };

  test("Grashof crank-rocker: 10 + 40 <= 25 + 38, crank shortest", () => {
    expect(grashof(fb)).toEqual({ grashof: true, crankRocker: true });
    expect(grashof({ ...fb, crank: 30 }).crankRocker).toBe(false);
  });

  test("hand calc at q = 0: B = (41.411, 24.766)", () => {
    // d = 28, along = (40² − 25² + 28²) / (2·28) = 31.411, h = √(40² − along²) = 24.766
    const pose = solveFourBar(fb, 0);
    expect(pose).not.toBeNull();
    expect(pose?.b[0]).toBeCloseTo(41.411, 3);
    expect(pose?.b[1]).toBeCloseTo(24.766, 3);
  });

  test("link lengths are preserved over a full turn (closure)", () => {
    for (let i = 0; i < 360; i += 7) {
      const pose = solveFourBar(fb, (i * Math.PI) / 180);
      if (!pose) throw new Error(`no pose at ${i}°`);
      const [ax, ay] = pose.a;
      const [bx, by] = pose.b;
      expect(Math.hypot(ax, ay)).toBeCloseTo(fb.crank, 9);
      expect(Math.hypot(bx - ax, by - ay)).toBeCloseTo(fb.coupler, 9);
      expect(Math.hypot(bx - fb.ground, by)).toBeCloseTo(fb.rocker, 9);
    }
  });

  test("sweep: stroke within (0, π), velocity ratio positive", () => {
    const sweep = rockerSweep(fb);
    expect(sweep.stroke).toBeGreaterThan(0);
    expect(sweep.stroke).toBeLessThan(Math.PI);
    expect(sweep.maxVelocityRatio).toBeGreaterThan(0);
  });

  test("non-closing linkage is rejected", () => {
    expect(() => rockerSweep({ crank: 30, coupler: 10, rocker: 10, ground: 50 })).toThrow();
  });

  test("virtual work: crank torque = rocker torque × ratio", () => {
    expect(crankTorqueFromRocker(20, 0.5)).toBe(10);
  });
});

describe("geometry", () => {
  test("parallel segments 1 mm apart", () => {
    expect(segmentDistance([0, 0, 0], [10, 0, 0], [0, 1, 0], [10, 1, 0])).toBeCloseTo(1, 12);
  });
  test("crossing segments touch", () => {
    expect(segmentDistance([-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0])).toBeCloseTo(0, 12);
  });
  test("skew segments: distance along z", () => {
    expect(segmentDistance([-1, 0, 0], [1, 0, 0], [0, -1, 2], [0, 1, 2])).toBeCloseTo(2, 12);
  });
  test("capsule gap subtracts radii", () => {
    expect(capsuleGap([[0, 0, 0], [10, 0, 0], 0.5], [[0, 3, 0], [10, 3, 0], 1])).toBeCloseTo(1.5, 12);
  });
});
