/** HTML labels pinned to 3D anchors (wing tips, nose arrow…), hidden when behind the camera. */
import { type Camera, Vector3 } from "three";

interface Label {
  readonly el: HTMLElement;
  readonly anchor: Vector3;
}

const _p = new Vector3();

export class ScreenLabels {
  private readonly labels: Label[] = [];
  private visible = true;

  constructor(private readonly host: HTMLElement) {}

  /** `anchor` is read every frame, so pass a vector that the module updates in place. */
  add(text: string, anchor: Vector3, className: string): HTMLElement {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = text;
    this.host.appendChild(el);
    this.labels.push({ el, anchor });
    return el;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) for (const { el } of this.labels) el.hidden = true;
  }

  update(camera: Camera, width: number, height: number): void {
    if (!this.visible) return;
    for (const { el, anchor } of this.labels) {
      _p.copy(anchor).project(camera);
      // Behind the camera, or outside the viewport (narrow screens): hide rather than overflow.
      if (_p.z > 1 || Math.abs(_p.x) > 0.92 || Math.abs(_p.y) > 0.95) {
        el.hidden = true;
        continue;
      }
      el.hidden = false;
      el.style.left = `${((_p.x + 1) / 2) * width}px`;
      el.style.top = `${((1 - _p.y) / 2) * height}px`;
    }
  }

  dispose(): void {
    for (const { el } of this.labels) el.remove();
    this.labels.length = 0;
  }
}
