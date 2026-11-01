import { describe, expect, test } from "bun:test";
import { cameraTarget, views, zoom } from "../src/model/project";

describe("viewer config", () => {
  test("zoom range is valid", () => {
    expect(zoom.minDistance).toBeGreaterThan(0);
    expect(zoom.maxDistance).toBeGreaterThan(zoom.minDistance);
    expect(zoom.step).toBeGreaterThan(1);
  });
  test("every camera preset starts inside the zoom range", () => {
    for (const [name, position] of Object.entries(views)) {
      const distance = position.distanceTo(cameraTarget);
      if (distance < zoom.minDistance || distance > zoom.maxDistance) {
        throw new Error(
          `view "${name}" is ${distance.toFixed(0)} mm from the target, outside the zoom range`,
        );
      }
    }
  });
});
