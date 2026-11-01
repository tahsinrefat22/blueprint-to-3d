/**
 * Raycast picking. A press that moves less than 5 px is a click (select); more is an orbit drag.
 * Hover reports the part under a mouse pointer for the tooltip.
 */
import { type Camera, type Object3D, Raycaster, Vector2 } from "three";

export interface PickHandlers {
  onHover(partKey: string | null, x: number, y: number): void;
  onSelect(partKey: string | null): void;
}

const CLICK_SLOP_PX = 5;

export function attachPicking(
  canvas: HTMLCanvasElement,
  camera: Camera,
  targets: () => readonly Object3D[],
  handlers: PickHandlers,
): () => void {
  const ray = new Raycaster();
  const ndc = new Vector2();
  let down: { x: number; y: number } | null = null;

  const pick = (ev: PointerEvent): string | null => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(targets() as Object3D[], false).find((h) => h.object.visible);
    return (hit?.object.userData.part as string | undefined) ?? null;
  };

  const onMove = (ev: PointerEvent): void => {
    if (ev.pointerType !== "mouse" || ev.buttons !== 0) return;
    const rect = canvas.getBoundingClientRect();
    handlers.onHover(pick(ev), ev.clientX - rect.left, ev.clientY - rect.top);
  };
  const onLeave = (): void => handlers.onHover(null, 0, 0);
  const onDown = (ev: PointerEvent): void => {
    down = { x: ev.clientX, y: ev.clientY };
  };
  const onUp = (ev: PointerEvent): void => {
    if (!down) return;
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (moved < CLICK_SLOP_PX) handlers.onSelect(pick(ev));
  };

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  return () => {
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerup", onUp);
  };
}
