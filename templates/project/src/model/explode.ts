/**
 * Ordered take-apart. Groups come off outside-in (order 1 first); each holder moves along its own
 * explode vector, eased toward its target. Groups with order > steps (e.g. the frame) never move.
 */
import { Group, type Object3D, type Vector3 } from "three";

export interface ExplodeGroupDef {
  readonly key: string;
  readonly order: number;
  readonly caption: string;
}

interface GroupState {
  readonly def: ExplodeGroupDef;
  readonly holders: Group[];
  e: number;
  target: number;
}

export class ExplodeController {
  readonly steps: number;
  private readonly groups = new Map<string, GroupState>();
  private step = 0;
  private all = false;

  constructor(defs: readonly ExplodeGroupDef[]) {
    for (const def of defs) this.groups.set(def.key, { def, holders: [], e: 0, target: 0 });
    this.steps = defs.filter((d) => d.order < 99).length;
  }

  /** A transform group under `parent` that slides by `offset` when its explode group comes off. */
  holder(groupKey: string, offset: Vector3, parent: Object3D): Group {
    const state = this.groups.get(groupKey);
    if (!state) throw new Error(`unknown explode group "${groupKey}"`);
    const holder = new Group();
    holder.userData.offset = offset.clone();
    parent.add(holder);
    state.holders.push(holder);
    return holder;
  }

  get current(): number {
    return this.all ? this.steps : this.step;
  }

  get exploded(): boolean {
    return this.all;
  }

  setStep(step: number): void {
    this.all = false;
    this.step = Math.max(0, Math.min(this.steps, step));
    this.retarget();
  }

  setAll(all: boolean): void {
    this.all = all;
    if (!all) this.step = 0;
    this.retarget();
  }

  /** Caption for the current step (null when assembled or fully exploded). */
  caption(): string | null {
    if (this.all || this.step === 0) return null;
    for (const state of this.groups.values()) if (state.def.order === this.step) return state.def.caption;
    return null;
  }

  /** Jumps every group to its target with no easing (e.g. before snapshotting parts for the grid). */
  snap(): void {
    for (const state of this.groups.values()) {
      state.e = state.target;
      this.place(state);
    }
  }

  setVisible(visible: boolean): void {
    for (const state of this.groups.values()) for (const h of state.holders) h.visible = visible;
  }

  /** Advances easing; returns true while anything is still moving. */
  update(dt: number, reduceMotion: boolean): boolean {
    const rate = Math.min(1, dt * (reduceMotion ? 20 : 5));
    let moving = false;
    for (const state of this.groups.values()) {
      const delta = state.target - state.e;
      if (Math.abs(delta) < 1e-4) {
        if (state.e !== state.target) {
          state.e = state.target;
          this.place(state);
        }
        continue;
      }
      state.e += delta * rate;
      this.place(state);
      moving = true;
    }
    return moving;
  }

  private place(state: GroupState): void {
    for (const holder of state.holders) {
      holder.position.copy(holder.userData.offset as Vector3).multiplyScalar(state.e);
    }
  }

  private retarget(): void {
    for (const state of this.groups.values()) {
      const { order } = state.def;
      state.target = order < 99 && (this.all || order <= this.step) ? 1 : 0;
    }
  }
}
