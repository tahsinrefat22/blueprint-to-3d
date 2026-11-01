import { describe, expect, test } from "bun:test";
import { type CalcGraph, downstream, evaluate, limitState, orderNodes } from "../src/engine/graph";
import { projectGraph } from "../src/engine/project-graph";

const tiny: CalcGraph = {
  inputs: [{ id: "x", label: "x", unit: "", min: 0, max: 10, step: 1, initial: 2 }],
  nodes: [
    { id: "b", label: "b", unit: "", deps: ["a"], compute: (get) => get("a") + 1 },
    { id: "a", label: "a", unit: "", deps: ["x"], compute: (get) => get("x") * 10 },
  ],
};

describe("graph engine", () => {
  test("orders nodes by dependency", () => {
    expect(orderNodes(tiny).map((n) => n.id)).toEqual(["a", "b"]);
  });
  test("evaluates with overrides", () => {
    expect(evaluate(tiny).b).toBe(21);
    expect(evaluate(tiny, { x: 3 }).b).toBe(31);
  });
  test("downstream of an input", () => {
    expect(downstream(tiny, "x")).toEqual(["a", "b"]);
  });
  test("rejects cycles, unknown deps and undeclared reads", () => {
    const node = { label: "", unit: "", compute: () => 0 };
    expect(() =>
      orderNodes({
        inputs: [],
        nodes: [
          { ...node, id: "p", deps: ["q"] },
          { ...node, id: "q", deps: ["p"] },
        ],
      }),
    ).toThrow(/cycle/);
    expect(() => orderNodes({ inputs: [], nodes: [{ ...node, id: "p", deps: ["nope"] }] })).toThrow(
      /unknown/,
    );
    const sneaky: CalcGraph = {
      inputs: tiny.inputs,
      nodes: [{ id: "s", label: "", unit: "", deps: [], compute: (get) => get("x") }],
    };
    expect(() => evaluate(sneaky)).toThrow(/without declaring/);
  });
  test("limit states", () => {
    expect(limitState({ max: 100, label: "" }, 50)).toBe("ok");
    expect(limitState({ max: 100, label: "" }, 95)).toBe("near");
    expect(limitState({ max: 100, label: "" }, 101)).toBe("over");
    expect(limitState({ min: 1.2, label: "" }, 1.25)).toBe("near");
    expect(limitState(undefined, 5)).toBe("none");
  });
});

describe("project graph", () => {
  test("evaluates to finite numbers with declared dependencies only", () => {
    const results = evaluate(projectGraph);
    for (const node of projectGraph.nodes) expect(Number.isFinite(results[node.id])).toBe(true);
  });
  test("evaluates at every input's min and max", () => {
    for (const input of projectGraph.inputs) {
      for (const value of [input.min, input.max]) {
        const results = evaluate(projectGraph, { [input.id]: value });
        for (const node of projectGraph.nodes) expect(Number.isFinite(results[node.id])).toBe(true);
      }
    }
  });
  test("inputs start inside their slider range", () => {
    for (const input of projectGraph.inputs) {
      expect(input.initial).toBeGreaterThanOrEqual(input.min);
      expect(input.initial).toBeLessThanOrEqual(input.max);
    }
  });
});
