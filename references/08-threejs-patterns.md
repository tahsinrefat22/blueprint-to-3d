# three.js Patterns (Phase 8)

These techniques come from the DFLY reference, modernised. The template already implements the generic ones in `src/model/`. This file explains how to use them, and how to build project modules that reach DFLY's depth.

## Contents
1. Frames and units
2. Building a module
3. Primitives
4. Mechanisms
5. Deforming surfaces
6. Explode groups
7. Labelled grid
8. Picking, selection, labels
9. Performance rules
10. Stage 1 vs detail stages

## 1. Frames and units

- Use **millimetres** throughout, with the body frame stated in the build plan. The default is x forward, y left, z up (`camera.up = +z`).
- For repeated or tilted modules, use a `LocalFrame(origin, e1, e2, e3)` and write geometry in local coordinates. DFLY's wing units used a frame tilted 30° about y (`AX` hinge axis, `WV` up in the stroke plane, `YV` outboard). The constructor rejects left-handed axes, because a mirrored basis silently breaks rotations.
- Mirror left and right with a `side = ±1` factor in the local coordinates, never with duplicated code.
- Keep **station tables** (named positions along an axis, DFLY's `S_`) in the spec. Modules read them.

## 2. Building a module

```ts
export function buildArm({ scene, registry, explode }: ModuleContext): ModuleHandle {
  const holder = explode.holder("arm", new Vector3(0, 80, 40), scene); // explode vector
  const mat = registry.material("upperArm", { metalness: 0.4 });      // tinted by catalogue colour
  const link = createBar(mat, v("upperArmRadius"));
  holder.add(registry.add(link, "upperArm"));                          // pickable + grid representative
  const anchors = { tip: new Vector3() };
  const s = { a: new Vector3(), b: new Vector3() };                    // scratch, reused every frame
  return {
    anchors,
    update(state) {
      // read state.time, state.controls[...], state.calc[...]; position meshes; no allocations
    },
  };
}
```

- Use `registry.add(mesh, key, representative)`. For repeated parts, pass `representative = true` only for the first instance (DFLY's `rep` flag), so the grid shows one of each.
- Mark meshes whose geometry deforms per frame with `mesh.userData.dynamic = true`. The grid then clones their geometry instead of sharing it.
- Put a screen-label point in `anchors`, and reference it in `model/project.ts → tags`.

## 3. Primitives (`primitives.ts`)

- **`createBar(material, radius)` + `setBar(mesh, p1, p2)`:** one shared unit cylinder, stretched between two points each frame. Use it for rods, spars, links, rails, legs and pushrods.
- **`boxGeometry`, `cylinderGeometry`, `sphereGeometry`:** cached by parameters. A cylinder runs along local +y. Rotate it with `quaternion.setFromUnitVectors(AXIS_Y, dir)`.
- **`gearGeometry(teeth, module, face)`:** trapezoidal tooth outline, bore, lightening holes above 20 teeth, extruded along local z. Put the mesh in a pivot `Group` oriented to the shaft axis, and spin the mesh with `rotation.z`. For a page where tooth form matters, add an involute profile function.
- For anything else (brackets, plates with pockets, airfoils), build a `Shape` with holes and use `ExtrudeGeometry`, or use `LatheGeometry` for turned parts. Cache by parameters.
- **Detail that earns its place:** fastener heads, bearing races, PCB components as boxes, connector housings, chamfers on visible edges. Model what a builder would want to see. Skip invisible internals unless the explode view reveals them.

## 4. Mechanisms: solve them, never fake them

- **Linkages:** solve exactly from link lengths in `src/engine/formulas/`, and use the same solver in the model and the calculations. See `linkage.ts`: circle-circle intersection with branch selection, plus a sweep for stroke and velocity ratio.
- **Gear trains:** each gear's angle = input angle × the ratio up to that gear × a sign that alternates per mesh. Offset one gear by half a tooth (`π / z`) so the teeth visually mesh.
- **Belts, screws, cams:** use the kinematic relation (pitch, lead, cam profile) from the engine.
- **Adjustments:** model them as moving a pivot. DFLY rotated the crank pivot about the intermediate shaft for stroke offset, with a 1.70 ratio.
- **Phase and timing controls:** expose them as `viewerControls` (DFLY: fore-hind phase, stroke offsets, split-cycle yaw).
- **Display speed:** animate real rates divided by `project.displaySlowdown`. The speed note shows the factor and the real rate.

## 5. Deforming surfaces

DFLY's wing membranes:
1. Define the planform as a function (root taper → constant chord → elliptical tip). Build a `ShapeGeometry` from sampled points.
2. Store each vertex's planform coordinates `(r, chord)` once.
3. Each frame, map each vertex through the current local basis: spar direction (flap angle) and chord direction (pitch angle). Write the results into the existing position attribute and set `needsUpdate`.
4. Don't recompute bounding volumes every frame. Do it only before picking, or set a generous static bounding sphere once.

## 6. Explode groups (`explode.ts`)

- Define groups **outside-in** in `model/project.ts`: what a person would remove first gets `order: 1`. The frame gets `order: 99` and never moves.
- Each group's caption is a sentence a reader learns from. It names the parts, gives key numbers, and says what's open. For example, DFLY: "Battery out: 2S 300 mAh, 18.4 g, on its slide 33 mm below the hinges…".
- Each holder has its own explode vector, pointing away from the assembly along the direction the part would actually come out. Include a vertical component, so separation reads from the 3/4 view.

## 7. Labelled grid (`grid.ts`)

It's generic. It clones representatives with their world matrices baked in, scales each one to fit its cell, chooses the column count for the viewport, and fits the camera from the FOV. Labels show name, count × mass, the main file and "+N more". You only need to:
- register representatives correctly
- keep `parts.files` meaningful
- choose `gridCentre` near the assembly

## 8. Picking, selection, labels

- Picking uses a 5 px click-vs-drag threshold. Hover shows the part name, and a click selects it: the part's materials are highlighted, the info panel opens, and its legend chip is pressed.
- The info panels are rendered at build time from the catalogue (`Viewer.astro`), so there's no `innerHTML` at runtime. They sit **below the part legend** in the side panel (see `09-page-sections.md`, "Viewer side panel order").
- Screen tags (`labels.ts`) hide when behind the camera or outside the viewport.
- **Camera views and panning:** `views` in `model/project.ts` holds the 3/4 view and six axis views, front (+x), rear (−x), left (+y), right (−y), top (+z) and bottom (−z), all `viewDistance` from the target. Top and bottom lean 0.1° off vertical, because a camera looking exactly along `camera.up` is degenerate for OrbitControls. Every project keeps all seven buttons. If the body frame differs, map the six views to the model's own front, left and up. Panning is set explicitly in `scene.ts` (`enablePan`, `screenSpacePanning`). **Ctrl (or ⌘ / Shift) + left-drag pans instead of rotating**, as do right-drag and a two-finger drag, and the view moves the way the pointer travels. A view button resets the pan, because it flies the target back to `cameraTarget`. Say so in the page lede.
- **Zoom range:** `zoom` in `model/project.ts` sets the allowed camera distance (`minDistance`, `maxDistance`, mm) and the `step` factor per button press. OrbitControls enforces the range for the wheel and pinch. The **−** / **+** buttons (bottom left of the stage) fly the camera in or out by `step` inside that range, disable themselves at each end, and show a readout where 100 % is the 3/4 view distance. Set the range from the model's size for every project: close enough to read the smallest detail without entering parts, far enough to see the whole model. `tests/viewer-config.test.ts` fails if a camera preset starts outside it. The labelled grid temporarily widens `maxDistance` so the whole grid fits, and restores it on exit.
- **Full screen:** a "Full screen" button in the top-right corner of the stage puts the stage (canvas, view buttons, labels, speed note) into browser full screen with the Fullscreen API. Esc or "Exit full screen" returns. The viewport gets `data-fullscreen="true"` and fills the screen (`data-[fullscreen=true]:h-dvh!`). The existing `ResizeObserver` re-sizes the renderer, so nothing else changes. Where the Fullscreen API is missing (iPhone Safari) or the browser refuses the request, the stage falls back to filling the browser window (`data-window-fullscreen="true"`: fixed, inset 0, page scroll locked), closed by the button or Esc. Already wired in `model/index.ts` and `Viewer.astro`; keep it in every project.

## 9. Performance rules

- The render loop is on-demand (`model/loop.ts`, driven from `model/index.ts`). It runs while playing, easing, flying or damping, and stops when idle or off-screen. Any new interaction must call `invalidate()`, which is `loop.request()`.
- **Exactly one frame may be pending, ever.** Never schedule render frames with `requestAnimationFrame` outside `loop.ts`. OrbitControls fires `"change"` from inside `controls.update()` during the tick. If the tick also re-scheduled itself directly, each frame would queue two more: frames double every frame while dragging, never die off while the mechanism plays, the tab freezes and the animation crawls. `loop.ts` guards against this, and `tests/loop.test.ts` proves it. Keep both.
- No `new` inside `update()`. Put scratch vectors at module or closure level.
- Share geometry through the cache. Use one material per part and visual variant, registered through the registry.
- Pixel ratio is capped at 2. Lighting is PMREM `RoomEnvironment` plus one key light; add no extra lights without a reason.
- Keep triangle counts sensible: 12–32 segments for cylinders, depending on size on screen.

## 10. Stage 1 vs detail stages

- **Stage 1 (envelopes):** every catalogue part as a correctly sized and placed simple volume. Use boxes and cylinders, sized from datasheet dimensions, at the build-plan positions. Mechanisms already move using the real solver. The goal is to verify layout, mass, CG, clearances and explode order before spending effort on detail. Say so on the page (DFLY: "drawn at envelope level, not detailed yet").
- **Detail stages:** one subsystem per stage. Replace envelopes with real geometry (profiles, holes, fasteners, gear teeth, PCBs), add the remaining motion, refine materials (metalness and roughness by material: anodised aluminium, POM, carbon, PCB green), and update captions and descriptions. Run the checks and screenshots after each stage.
