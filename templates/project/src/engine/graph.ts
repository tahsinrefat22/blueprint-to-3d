/**
 * Generic dependency-graph evaluator for the calculation panel. Project-agnostic: the project's
 * inputs and nodes live in project-graph.ts.
 *
 * Each node's `compute` receives a getter. Reading an id that is not in `deps` throws, so the
 * declared dependencies (used for "what does this change affect?") can never drift from the code.
 */

export type Get = (id: string) => number;

export interface CalcInput {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly initial: number;
  /** Spec key the initial value comes from (shown with its confidence). */
  readonly valueKey?: string;
  readonly help?: string;
}

export interface Limit {
  readonly min?: number;
  readonly max?: number;
  /** Why the limit exists, and its source (e.g. "winding insulation class, S07"). */
  readonly label: string;
}

export interface CalcNode {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly deps: readonly string[];
  readonly compute: (get: Get) => number;
  readonly digits?: number;
  readonly limit?: Limit;
  /** Formula and source, shown on hover. */
  readonly help?: string;
}

export interface CalcGraph {
  readonly inputs: readonly CalcInput[];
  readonly nodes: readonly CalcNode[];
}

export type Results = Readonly<Record<string, number>>;

/** Topological order (Kahn). Throws on duplicate ids, unknown dependencies or cycles. */
export function orderNodes(graph: CalcGraph): CalcNode[] {
  const ids = new Set<string>();
  for (const item of [...graph.inputs, ...graph.nodes]) {
    if (ids.has(item.id)) throw new Error(`duplicate graph id "${item.id}"`);
    ids.add(item.id);
  }
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const pending = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const node of graph.nodes) {
    let count = 0;
    for (const dep of node.deps) {
      if (!ids.has(dep)) throw new Error(`node "${node.id}" depends on unknown id "${dep}"`);
      if (nodeIds.has(dep)) {
        count++;
        dependents.set(dep, [...(dependents.get(dep) ?? []), node.id]);
      }
    }
    pending.set(node.id, count);
  }
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const queue = graph.nodes.filter((n) => pending.get(n.id) === 0).map((n) => n.id);
  const order: CalcNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    const node = byId.get(id);
    if (node) order.push(node);
    for (const next of dependents.get(id) ?? []) {
      const left = (pending.get(next) ?? 0) - 1;
      pending.set(next, left);
      if (left === 0) queue.push(next);
    }
  }
  if (order.length !== graph.nodes.length) {
    const stuck = graph.nodes.filter((n) => !order.includes(n)).map((n) => n.id);
    throw new Error(`dependency cycle among: ${stuck.join(", ")}`);
  }
  return order;
}

/** Evaluates every node. `overrides` replace input initial values. */
export function evaluate(
  graph: CalcGraph,
  overrides: Readonly<Record<string, number>> = {},
  order: readonly CalcNode[] = orderNodes(graph),
): Results {
  const out: Record<string, number> = {};
  for (const input of graph.inputs) out[input.id] = overrides[input.id] ?? input.initial;
  for (const node of order) {
    const allowed = new Set(node.deps);
    const get: Get = (id) => {
      if (!allowed.has(id)) throw new Error(`node "${node.id}" read "${id}" without declaring it in deps`);
      const value = out[id];
      if (value === undefined) throw new Error(`node "${node.id}" read "${id}" before it was computed`);
      return value;
    };
    out[node.id] = node.compute(get);
  }
  return out;
}

/** Every node that changes when `id` changes, in evaluation order. */
export function downstream(graph: CalcGraph, id: string): string[] {
  const hit = new Set<string>([id]);
  const result: string[] = [];
  for (const node of orderNodes(graph)) {
    if (node.deps.some((d) => hit.has(d))) {
      hit.add(node.id);
      result.push(node.id);
    }
  }
  return result;
}

export type LimitState = "ok" | "near" | "over" | "none";

/** "near" when within `nearFraction` of a bound (default 10 %). */
export function limitState(limit: Limit | undefined, value: number, nearFraction = 0.1): LimitState {
  if (!limit) return "none";
  const { min, max } = limit;
  if ((max !== undefined && value > max) || (min !== undefined && value < min)) return "over";
  if (max !== undefined && value > max * (1 - nearFraction)) return "near";
  if (min !== undefined && value < min * (1 + nearFraction)) return "near";
  return "ok";
}

export function formatValue(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
