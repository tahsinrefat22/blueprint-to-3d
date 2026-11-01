/**
 * Renderer, camera, controls, image-based lighting and the ground grid. The render loop itself
 * lives in index.ts (on-demand: it only runs while something moves).
 */
import {
  Color,
  DirectionalLight,
  GridHelper,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  type Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { cssToken, onThemeChange } from "./theme";

export interface StageOptions {
  readonly target: Vector3;
  readonly position: Vector3;
  /** Ground grid: size (mm), divisions, and the z height of the ground plane. */
  readonly ground: { readonly size: number; readonly divisions: number; readonly z: number };
  /** Allowed camera distance to the target (mm); OrbitControls enforces it for wheel and pinch. */
  readonly zoom: { readonly minDistance: number; readonly maxDistance: number };
}

export interface Stage {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly controls: OrbitControls;
  setGroundVisible(visible: boolean): void;
  /** Re-reads the host size. Returns [width, height]. */
  resize(): readonly [number, number];
  onResize(callback: () => void): void;
  dispose(): void;
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function createStage(host: HTMLElement, options: StageOptions): Stage {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.domElement.classList.add("block", "size-full", "cursor-grab", "active:cursor-grabbing");
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive 3D model: drag to orbit, scroll to zoom, click a part",
  );
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.75;
  const key = new DirectionalLight(0xffffff, 1.2);
  key.position.set(250, 180, 500);
  scene.add(key);

  const camera = new PerspectiveCamera(32, 1, 1, 8000);
  camera.up.set(0, 0, 1);
  camera.position.copy(options.position);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(options.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.minDistance = options.zoom.minDistance;
  controls.maxDistance = options.zoom.maxDistance;
  controls.update();

  let grid: GridHelper | null = null;
  let groundVisible = true;
  const buildGround = (): void => {
    if (grid) {
      scene.remove(grid);
      grid.dispose();
    }
    const color = new Color(cssToken("--line"));
    grid = new GridHelper(options.ground.size, options.ground.divisions, color, color);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = options.ground.z;
    const material = grid.material as { transparent: boolean; opacity: number };
    material.transparent = true;
    material.opacity = 0.55;
    grid.visible = groundVisible;
    scene.add(grid);
  };
  buildGround();

  const resizeCallbacks: (() => void)[] = [];
  const resize = (): readonly [number, number] => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    return [width, height];
  };
  const observer = new ResizeObserver(() => {
    resize();
    for (const callback of resizeCallbacks) callback();
  });
  observer.observe(host);
  resize();

  const offTheme = onThemeChange(() => {
    buildGround();
    for (const callback of resizeCallbacks) callback();
  });

  return {
    renderer,
    scene,
    camera,
    controls,
    setGroundVisible: (visible) => {
      groundVisible = visible;
      if (grid) grid.visible = visible;
    },
    resize,
    onResize: (callback) => resizeCallbacks.push(callback),
    dispose: () => {
      observer.disconnect();
      offTheme();
      controls.dispose();
      grid?.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
