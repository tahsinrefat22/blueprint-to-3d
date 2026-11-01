/**
 * Mounts the interactive viewer into the markup rendered by components/Viewer.astro.
 * DOM contract: elements are found by data attributes inside `root` (see Viewer.astro).
 *
 * The render loop is on demand: it runs while the mechanism plays, something eases, the camera
 * flies or the controls damp, and stops otherwise (and while the viewer is off-screen).
 */
import { Color } from "three";
import { evaluate, formatValue } from "../engine/graph";
import { projectGraph } from "../engine/project-graph";
import { CALC_EVENT } from "../events";
import { partByKey, project, values, viewerControls } from "../spec";
import { CameraRig } from "./camera";
import { ExplodeController } from "./explode";
import { GridExplode, type GridLabel } from "./grid";
import { ScreenLabels } from "./labels";
import { attachPicking } from "./picking";
import { disposeGeometryCache } from "./primitives";
import {
  buildModules,
  cameraTarget,
  explodeGroups,
  gridCentre,
  ground,
  tags,
  type ViewName,
  views,
} from "./project";
import { PartRegistry } from "./registry";
import { createStage, webglAvailable } from "./scene";
import { cssToken, prefersReducedMotion } from "./theme";

const TAG_CLASS =
  "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-line bg-panel px-1.5 font-mono text-[11px] text-ink";
const TAG_ACCENT_CLASS = `${TAG_CLASS} border-accent text-accent`;

function q<T extends Element>(root: ParentNode, selector: string): T | null {
  return root.querySelector<T>(selector);
}

function gridLabel(partKey: string): GridLabel {
  const part = partByKey(partKey);
  if (!part) return { title: partKey, subtitle: "", file: "", more: 0 };
  const mass = values[part.massKey as keyof typeof values];
  const count = part.instances.length;
  const each = mass ? `${formatValue(mass.value, 1)} g` : "";
  return {
    title: part.name,
    subtitle: count > 1 ? `×${count} · ${each} each` : each,
    file: part.files[0] ?? "",
    more: part.files.length - 1,
  };
}

export function mountViewer(root: HTMLElement): () => void {
  const host = q<HTMLElement>(root, "[data-viewport]");
  if (!host) throw new Error("Viewer: [data-viewport] missing");
  if (!webglAvailable()) {
    const fallback = q<HTMLElement>(root, "[data-fallback]");
    if (fallback) fallback.hidden = false;
    return () => {};
  }

  const reduce = prefersReducedMotion();
  const stage = createStage(host, { target: cameraTarget, position: views.iso, ground });
  const { scene, camera, controls, renderer } = stage;
  const registry = new PartRegistry();
  const explode = new ExplodeController(explodeGroups);
  const modules = buildModules({ scene, registry, explode });
  const rig = new CameraRig(camera, controls);
  const grid = new GridExplode(scene, host, registry, gridLabel, gridCentre);
  const labels = new ScreenLabels(host);
  for (const tag of tags) {
    const anchor = modules.map((m) => m.anchors[tag.anchor]).find((a) => a !== undefined);
    if (anchor) labels.add(tag.text, anchor, tag.accent ? TAG_ACCENT_CLASS : TAG_CLASS);
  }

  const state = {
    playing: false,
    time: 0,
    controls: Object.fromEntries(viewerControls.map((c) => [c.id, c.initial])) as Record<string, number>,
    calc: evaluate(projectGraph),
    selected: null as string | null,
  };

  const speedNote = q<HTMLElement>(root, "[data-speed-note]");

  // ---------- render loop ----------
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let width = host.clientWidth;
  let height = host.clientHeight;

  const frame = (now: number): void => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (state.playing) state.time += dt;
    const moduleState = { time: state.time, controls: state.controls, calc: state.calc };
    for (const module of modules) module.update(moduleState);

    let busy = state.playing;
    busy = explode.update(dt, reduce) || busy;
    const gridState = grid.update(dt, camera, width, height, reduce);
    busy = gridState.moving || busy;
    explode.setVisible(!gridState.hideVehicle);
    stage.setGroundVisible(!gridState.hideVehicle);
    labels.setVisible(!grid.present);
    if (speedNote) speedNote.hidden = grid.present;
    busy = rig.update(dt) || busy;
    busy = controls.update(dt) || busy;

    renderer.render(scene, camera);
    labels.update(camera, width, height);

    if (busy && onScreen) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const invalidate = (): void => {
    if (!raf && onScreen) raf = requestAnimationFrame(frame);
  };
  controls.addEventListener("change", invalidate);
  stage.onResize(() => {
    width = host.clientWidth;
    height = host.clientHeight;
    invalidate();
  });
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
    if (onScreen) invalidate();
  });
  visibility.observe(host);

  // ---------- play / speed note ----------
  const playBtn = q<HTMLButtonElement>(root, "[data-play]");
  const setPlaying = (playing: boolean): void => {
    state.playing = playing;
    if (playBtn) {
      playBtn.textContent = playing ? "Pause" : "Play";
      playBtn.setAttribute("aria-pressed", String(playing));
    }
    invalidate();
  };
  const updateSpeedNote = (): void => {
    if (!speedNote) return;
    const hz = state.calc.cycleHz;
    speedNote.textContent =
      hz === undefined ? "" : `Shown ${project.displaySlowdown}× slower than real (${formatValue(hz, 1)} Hz)`;
  };
  playBtn?.addEventListener("click", () => setPlaying(!state.playing));
  updateSpeedNote();

  // ---------- mechanism controls ----------
  const controlInputs = viewerControls.map((c) => {
    const input = q<HTMLInputElement>(root, `[data-control="${c.id}"]`);
    const out = q<HTMLElement>(root, `[data-control-out="${c.id}"]`);
    const sync = (): void => {
      if (!input) return;
      state.controls[c.id] = Number(input.value);
      if (out) out.textContent = `${input.value}${c.unit}`;
      invalidate();
    };
    input?.addEventListener("input", sync);
    return { def: c, input, sync };
  });
  q<HTMLButtonElement>(root, "[data-reset]")?.addEventListener("click", () => {
    for (const { def, input, sync } of controlInputs) {
      if (input) input.value = String(def.initial);
      sync();
    }
  });

  // ---------- selection, legend, info panel, tooltip ----------
  const accent = new Color();
  const tip = q<HTMLElement>(root, "[data-tip]");
  const select = (partKey: string | null): void => {
    state.selected = partKey;
    accent.set(cssToken("--accent"));
    registry.highlight(partKey, accent);
    for (const btn of root.querySelectorAll<HTMLButtonElement>("[data-legend-part]")) {
      btn.setAttribute("aria-pressed", String(btn.dataset.legendPart === partKey));
    }
    for (const panel of root.querySelectorAll<HTMLElement>("[data-info-part]")) {
      panel.hidden = panel.dataset.infoPart !== partKey;
    }
    const empty = q<HTMLElement>(root, "[data-info-empty]");
    if (empty) empty.hidden = partKey !== null;
    invalidate();
  };
  for (const btn of root.querySelectorAll<HTMLButtonElement>("[data-legend-part]")) {
    btn.addEventListener("click", () => {
      const key = btn.dataset.legendPart ?? null;
      select(state.selected === key ? null : key);
    });
  }
  const detachPicking = attachPicking(
    renderer.domElement,
    camera,
    () => (grid.present ? grid.pickTargets() : registry.pickables),
    {
      onHover: (key, x, y) => {
        if (!tip) return;
        const part = key ? partByKey(key) : undefined;
        tip.hidden = !part;
        if (part) {
          tip.textContent = part.name;
          tip.style.left = `${x}px`;
          tip.style.top = `${y}px`;
        }
      },
      onSelect: select,
    },
  );

  // ---------- take apart ----------
  const stepCount = q<HTMLElement>(root, "[data-step-count]");
  const stepCaption = q<HTMLElement>(root, "[data-step-caption]");
  const allBtn = q<HTMLButtonElement>(root, "[data-explode-all]");
  const gridBtn = q<HTMLButtonElement>(root, "[data-explode-grid]");
  const updateSteps = (): void => {
    if (stepCount) stepCount.textContent = `${explode.current} / ${explode.steps}`;
    if (allBtn) allBtn.textContent = explode.exploded ? "Reassemble" : "Explode all";
    if (gridBtn) {
      gridBtn.textContent = grid.active ? "Reassemble" : "Explode with labels";
      gridBtn.setAttribute("aria-pressed", String(grid.active));
    }
    if (!stepCaption) return;
    if (grid.active) {
      stepCaption.textContent =
        "Every part laid out in a grid, each scaled to fit its cell (real sizes are in the details). Click a part for every file.";
    } else if (explode.exploded) {
      stepCaption.textContent =
        "Everything pulled apart along its own direction. Press Reassemble to put it back.";
    } else {
      stepCaption.textContent =
        explode.caption() ?? "Fully assembled. Press Remove next to take it apart one layer at a time.";
    }
  };
  const flyToView = (view: ViewName): void => rig.flyTo(views[view], cameraTarget, 0.7, reduce);
  const exitGrid = (): void => {
    if (!grid.active) return;
    grid.exit();
    host.dataset.grid = "false";
    flyToView("iso");
  };
  const enterGrid = (): void => {
    explode.setStep(0);
    explode.snap();
    host.dataset.grid = "true";
    // Wait one frame so the taller grid-mode viewport is laid out before measuring.
    requestAnimationFrame(() => {
      [width, height] = stage.resize();
      grid.enter();
      const pose = grid.fit(camera);
      rig.flyTo(pose.position, pose.target, 1.1, reduce);
      updateSteps();
      invalidate();
    });
  };
  q<HTMLButtonElement>(root, "[data-step-next]")?.addEventListener("click", () => {
    exitGrid();
    explode.setStep(explode.current + 1);
    updateSteps();
    invalidate();
  });
  q<HTMLButtonElement>(root, "[data-step-prev]")?.addEventListener("click", () => {
    exitGrid();
    explode.setStep(explode.current - 1);
    updateSteps();
    invalidate();
  });
  allBtn?.addEventListener("click", () => {
    exitGrid();
    explode.setAll(!explode.exploded);
    updateSteps();
    invalidate();
  });
  gridBtn?.addEventListener("click", () => {
    if (grid.active) exitGrid();
    else enterGrid();
    updateSteps();
    invalidate();
  });
  for (const btn of root.querySelectorAll<HTMLButtonElement>("[data-view]")) {
    btn.addEventListener("click", () => {
      exitGrid();
      updateSteps();
      flyToView((btn.dataset.view ?? "iso") as ViewName);
      invalidate();
    });
  }

  // ---------- calculation panel ----------
  const onCalc = (ev: Event): void => {
    state.calc = (ev as CustomEvent<Record<string, number>>).detail;
    updateSpeedNote();
    invalidate();
  };
  document.addEventListener(CALC_EVENT, onCalc);

  updateSteps();
  if (!reduce) setPlaying(true);
  invalidate();

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener(CALC_EVENT, onCalc);
    visibility.disconnect();
    detachPicking();
    grid.teardown();
    labels.dispose();
    registry.dispose();
    disposeGeometryCache();
    stage.dispose();
  };
}
