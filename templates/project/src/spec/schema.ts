/**
 * Spec schemas. Every number in the project lives in src/spec and carries its provenance.
 * The provenance check (scripts/check-provenance.ts) and tests/spec.test.ts validate against these.
 */
import { z } from "zod";

export const confidenceSchema = z.enum(["datasheet", "measured", "calculated", "estimated", "assumed"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const sourceKindSchema = z.enum(["url", "datasheet", "paper", "standard", "user", "template"]);

/** A source actually opened during research. `template` marks demo placeholders that must be replaced. */
export const sourceSchema = z.object({
  id: z.string().regex(/^S\d{2,}$/, "source ids look like S01"),
  kind: sourceKindSchema,
  title: z.string().min(1),
  url: z.url().optional(),
  accessed: z.iso.date().optional(),
  note: z.string().optional(),
});
export type Source = z.infer<typeof sourceSchema>;

/**
 * Where a value comes from:
 * - "S01"           a source in sources.ts
 * - "D-03"          a decision record in decisions.ts
 * - "calc:<nodeId>" a node of the engine graph (src/engine/project-graph.ts)
 */
export const sourceRefSchema = z
  .string()
  .regex(/^(S\d{2,}|D-\d{2,}|calc:[A-Za-z][\w]*)$/, "use S01, D-01 or calc:<nodeId>");

export const sourcedSchema = z
  .object({
    // z.number() already rejects NaN and ±Infinity in zod 4.
    value: z.number(),
    unit: z.string(),
    confidence: confidenceSchema,
    source: sourceRefSchema,
    /** Required for estimated and assumed values: the reasoning, or what would resolve it. */
    note: z.string().optional(),
    /** Keep a published tolerance or range instead of rounding the uncertainty away. */
    range: z.tuple([z.number(), z.number()]).optional(),
  })
  .refine((v) => !(v.confidence === "estimated" || v.confidence === "assumed") || !!v.note, {
    message: "estimated and assumed values need a note explaining the reasoning",
  });
export type Sourced = z.infer<typeof sourcedSchema>;

export const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof vec3Schema>;

export const statusSchema = z.enum(["settled", "open", "problem", "future"]);
export type Status = z.infer<typeof statusSchema>;

export const partSchema = z.object({
  key: z.string().regex(/^[a-z][a-zA-Z0-9]*$/),
  name: z.string().min(1),
  /** Key into `values` holding the mass of ONE instance, in grams. */
  massKey: z.string(),
  /** Centroid of each instance in the body frame (mm). Count = instances.length. */
  instances: z.array(vec3Schema).min(1),
  status: statusSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: z.string().min(1),
  /** Repo files (docs, decisions, formulas) where this part's numbers live. */
  files: z.array(z.string()).min(1),
  /** Mass-budget rows flagged as reserve (held for later phases) are drawn grey. */
  reserve: z.boolean().optional(),
});
export type Part = z.infer<typeof partSchema>;

export const decisionSchema = z.object({
  id: z.string().regex(/^D-\d{2,}$/),
  title: z.string().min(1),
  status: z.enum(["settled", "open"]),
  summary: z.string().min(1),
  file: z.string(),
  /** Spec value keys this decision covers. Every `assumed` value must be covered by an open decision. */
  covers: z.array(z.string()).optional(),
});
export type Decision = z.infer<typeof decisionSchema>;

export const capabilitySchema = z.object({
  name: z.string(),
  how: z.string(),
  status: z.enum(["expected", "gated", "open", "later", "not-designed"]),
  note: z.string().optional(),
});
export type Capability = z.infer<typeof capabilitySchema>;

export const bomLineSchema = z.object({
  part: z.string(),
  manufacturer: z.string(),
  partNumber: z.string(),
  qty: z.number().int().positive(),
  supplier: z.string(),
  supplierCountry: z.string(),
  url: z.url(),
  unitPrice: z.number().nonnegative(),
  currency: z.string().length(3),
  priceDate: z.iso.date(),
  shipping: z.number().nonnegative().optional(),
  duty: z.number().nonnegative().optional(),
  stock: z.enum(["in-stock", "backorder", "unknown"]),
  backup: z.object({ supplier: z.string(), url: z.url() }).optional(),
  notes: z.string().optional(),
});
export type BomLine = z.infer<typeof bomLineSchema>;
