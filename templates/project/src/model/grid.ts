/**
 * "Explode with labels": every part's representative meshes are cloned (world matrix baked in),
 * centred, scaled to fit a cell and laid out in a grid facing the camera, each with an HTML label
 * (name, count and mass, main file). Clones are disposed on exit.
 *
 * Layout plane: the grid faces +x (viewed from the front, where +y is screen-right); columns run
 * along +y, rows along -z (screen down).
 */
import { Box3, Group, Matrix4, type Mesh, type PerspectiveCamera, type Scene, Vector3 } from "three";
import { AXIS_Y, AXIS_Z } from "./frames";
import type { PartRegistry } from "./registry";

export interface GridLabel {
  readonly title: string;
  readonly subtitle: string;
  readonly file: string;
  readonly more: number;
}

interface Item {
  readonly group: Group;
  readonly from: Vector3;
  readonly to: Vector3;
  readonly scale: number;
  readonly label: HTMLElement;
  readonly anchor: Vector3;
  readonly temporary: Mesh[];
  spin: number;
}

const CELL = 120;
const smoothstep = (x: number): number => x * x * (3 - 2 * x);
const _p = new Vector3();
const _q = new Vector3();

export class GridExplode {
  private items: Item[] = [];
  private pick: Mesh[] = [];
  private e = 0;
  private target = 0;
  private rows = 1;
  private cols = 1;
  private cellH = CELL;

  constructor(
    private readonly scene: Scene,
    private readonly host: HTMLElement,
    private readonly registry: PartRegistry,
    private readonly labelFor: (partKey: string) => GridLabel,
    private readonly centre: Vector3,
  ) {}

  get active(): boolean {
    return this.target === 1;
  }

  get present(): boolean {
    return this.items.length > 0;
  }

  pickTargets(): readonly Mesh[] {
    return this.pick;
  }

  /** Builds the grid. Call after the host has its grid-mode size. */
  enter(): void {
    if (this.present) this.teardown();
    this.scene.updateMatrixWorld(true);
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const narrow = width < 520;
    const keys = this.registry.gridKeys();
    this.cellH = CELL * (narrow ? 1.45 : 2.3);
    let best = 0;
    for (let c = 2; c <= 9; c++) {
      const r = Math.ceil(keys.length / c);
      const fit = Math.min(width / (c * CELL), height / (r * this.cellH));
      if (fit > best) {
        best = fit;
        this.cols = c;
      }
    }
    this.rows = Math.ceil(keys.length / this.cols);

    keys.forEach((key, i) => {
      const sources = this.registry.representatives(key);
      const box = new Box3();
      for (const mesh of sources) box.expandByObject(mesh);
      const centre = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());
      const toOrigin = new Matrix4().makeTranslation(-centre.x, -centre.y, -centre.z);
      const group = new Group();
      const temporary: Mesh[] = [];
      for (const mesh of sources) {
        const dynamic = mesh.userData.dynamic === true;
        const clone = mesh.clone(false) as Mesh;
        if (dynamic) {
          clone.geometry = mesh.geometry.clone();
          temporary.push(clone);
        }
        clone.matrixAutoUpdate = false;
        clone.matrix.copy(mesh.matrixWorld).premultiply(toOrigin);
        clone.userData.part = key;
        group.add(clone);
        this.pick.push(clone);
      }
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const cellCentre = this.centre
        .clone()
        .addScaledVector(AXIS_Y, (col - (this.cols - 1) / 2) * CELL)
        .addScaledVector(AXIS_Z, -(row - (this.rows - 1) / 2) * this.cellH);
      const to = cellCentre.clone().addScaledVector(AXIS_Z, this.cellH * (narrow ? 0.2 : 0.24));
      group.position.copy(centre);
      this.scene.add(group);
      this.items.push({
        group,
        from: centre,
        to,
        scale: Math.min((CELL * 0.6) / Math.max(size.x, size.y, size.z, 1), 9),
        label: this.createLabel(this.labelFor(key), narrow),
        anchor: cellCentre.clone().addScaledVector(AXIS_Z, -this.cellH * 0.06),
        temporary,
        spin: i * 0.7,
      });
    });
    this.target = 1;
  }

  exit(): void {
    this.target = 0;
  }

  /** Camera position that fits the whole grid for the camera's FOV and the host aspect. */
  fit(camera: PerspectiveCamera): { position: Vector3; target: Vector3 } {
    const tan = Math.tan(((camera.fov / 2) * Math.PI) / 180);
    const aspect = this.host.clientWidth / Math.max(1, this.host.clientHeight);
    const h = this.rows * this.cellH;
    const w = this.cols * CELL;
    const distance = Math.max(h / 2 / tan, w / 2 / (tan * aspect)) * 1.06;
    return {
      position: this.centre.clone().add(new Vector3(distance + 60, 0, 0)),
      target: this.centre.clone(),
    };
  }

  /**
   * Advances the transition. Returns whether it is still animating and whether the assembled
   * vehicle should be hidden this frame.
   */
  update(
    dt: number,
    camera: PerspectiveCamera,
    width: number,
    height: number,
    reduceMotion: boolean,
  ): { moving: boolean; hideVehicle: boolean } {
    if (!this.present) return { moving: false, hideVehicle: false };
    this.e += (this.target - this.e) * Math.min(1, dt * (reduceMotion ? 20 : 3.2));
    const k = smoothstep(Math.min(1, Math.max(0, this.e)));
    for (const item of this.items) {
      item.group.position.lerpVectors(item.from, item.to, k);
      item.group.scale.setScalar(1 + (item.scale - 1) * k);
      if (!reduceMotion) item.spin += dt * 0.35;
      item.group.rotation.set(0, 0, item.spin * k);
      _p.copy(item.anchor).project(camera);
      if (_p.z > 1) {
        item.label.style.opacity = "0";
        continue;
      }
      item.label.style.left = `${((_p.x + 1) / 2) * width}px`;
      item.label.style.top = `${((1 - _p.y) / 2) * height}px`;
      _q.copy(item.anchor)
        .addScaledVector(AXIS_Y, CELL * 0.47)
        .project(camera);
      item.label.style.width = `${Math.max(64, Math.abs(_q.x - _p.x) * width * 0.92)}px`;
      item.label.style.opacity = String(Math.max(0, (k - 0.5) * 2));
    }
    // Reassembling: drop the clones the moment the assembled vehicle reappears, so they never overlap it.
    if (this.target === 0 && this.e < 0.35) {
      this.teardown();
      return { moving: false, hideVehicle: false };
    }
    const settled = Math.abs(this.target - this.e) < 1e-3;
    const hideVehicle = this.target === 1 ? this.e > 0.02 : true;
    return { moving: !settled || !reduceMotion, hideVehicle };
  }

  teardown(): void {
    for (const item of this.items) {
      for (const mesh of item.temporary) mesh.geometry.dispose();
      this.scene.remove(item.group);
      item.label.remove();
    }
    this.items = [];
    this.pick = [];
    this.e = 0;
    this.target = 0;
  }

  private createLabel(data: GridLabel, narrow: boolean): HTMLElement {
    const el = document.createElement("div");
    el.className =
      "pointer-events-none absolute -translate-x-1/2 rounded-md border border-line bg-panel px-1.5 py-1 text-center leading-tight text-ink";
    const title = document.createElement("b");
    title.className = "block text-xs font-semibold";
    title.textContent = data.title;
    const subtitle = document.createElement("span");
    subtitle.className = "block font-mono text-[10.5px] text-muted";
    subtitle.textContent = data.subtitle;
    el.append(title, subtitle);
    if (!narrow) {
      const file = document.createElement("code");
      file.className = "block font-mono text-[10px] break-all text-accent";
      file.textContent = data.file;
      el.append(file);
      if (data.more > 0) {
        const more = document.createElement("span");
        more.className = "block font-mono text-[10.5px] text-muted";
        more.textContent = `+${data.more} more, click`;
        el.append(more);
      }
    }
    el.style.opacity = "0";
    this.host.appendChild(el);
    return el;
  }
}
