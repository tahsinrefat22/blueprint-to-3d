import type { Scene, Vector3 } from "three";
import type { ExplodeController } from "./explode";
import type { PartRegistry } from "./registry";

/** Everything a module needs to build its meshes. */
export interface ModuleContext {
  readonly scene: Scene;
  readonly registry: PartRegistry;
  readonly explode: ExplodeController;
}

/** Per-frame state handed to every module. */
export interface ModuleState {
  /** Seconds of animation time while playing. Divide real rates by project.displaySlowdown. */
  readonly time: number;
  /** Viewer side-panel controls, by id (src/spec/project.ts viewerControls). */
  readonly controls: Readonly<Record<string, number>>;
  /** Latest calculation-panel results, by graph id. */
  readonly calc: Readonly<Record<string, number>>;
}

export interface ModuleHandle {
  update(state: ModuleState): void;
  /** Named world-space points for screen labels (updated in place by `update`). */
  readonly anchors: Readonly<Record<string, Vector3>>;
}
