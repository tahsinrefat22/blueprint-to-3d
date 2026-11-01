import { describe, expect, test } from "bun:test";
import { evaluate } from "../src/engine/graph";
import { massRows, totalMassG } from "../src/engine/mass";
import { projectGraph } from "../src/engine/project-graph";
import {
  bom,
  capabilities,
  decisions,
  keyNumbers,
  parts,
  sources,
  values,
  viewerControls,
} from "../src/spec";
import {
  bomLineSchema,
  capabilitySchema,
  decisionSchema,
  partSchema,
  sourcedSchema,
  sourceSchema,
} from "../src/spec/schema";

describe("spec schema", () => {
  test("every value is a valid Sourced entry", () => {
    for (const [key, entry] of Object.entries(values)) {
      const result = sourcedSchema.safeParse(entry);
      if (!result.success) throw new Error(`${key}: ${result.error.message}`);
    }
  });
  test("sources, parts, decisions, capabilities and BOM parse", () => {
    for (const s of sources) sourceSchema.parse(s);
    for (const p of parts) partSchema.parse(p);
    for (const d of decisions) decisionSchema.parse(d);
    for (const c of capabilities) capabilitySchema.parse(c);
    for (const line of bom) bomLineSchema.parse(line);
  });
  test("ids are unique", () => {
    const unique = (ids: string[]) => expect(new Set(ids).size).toBe(ids.length);
    unique(parts.map((p) => p.key));
    unique(sources.map((s) => s.id));
    unique(decisions.map((d) => d.id));
  });
  test("every BOM line refers to a catalogue part", () => {
    const keys = new Set<string>(parts.map((p) => p.key));
    for (const line of bom) expect(keys.has(line.part)).toBe(true);
  });
});

describe("mass", () => {
  test("budget total equals the sum of instances × unit masses", () => {
    const manual = parts.reduce((sum, p) => sum + values[p.massKey].value * p.instances.length, 0);
    expect(totalMassG(massRows(parts, values))).toBeCloseTo(manual, 9);
  });
  test("graph mass node matches the budget", () => {
    const node = projectGraph.nodes.find((n) => n.id === "partsMass");
    if (node) expect(evaluate(projectGraph).partsMass).toBeCloseTo(totalMassG(massRows(parts, values)), 9);
  });
});

describe("page wiring", () => {
  test("key-number refs resolve", () => {
    const nodeIds = new Set<string>(projectGraph.nodes.map((n) => n.id));
    for (const tile of keyNumbers) {
      const [kind, id = ""] = tile.ref.split(":");
      if (kind === "node") expect(nodeIds.has(id)).toBe(true);
      else expect(id in values).toBe(true);
    }
  });
  test("viewer controls start inside their range", () => {
    for (const c of viewerControls) {
      expect(c.initial).toBeGreaterThanOrEqual(c.min);
      expect(c.initial).toBeLessThanOrEqual(c.max);
    }
  });
});
