/**
 * On-demand render loop. At most ONE animation frame is ever pending: request() is a no-op while a
 * frame is queued, and the loop re-requests through the same guard. Never schedule render frames
 * with requestAnimationFrame anywhere else: a second scheduling path (for example a controls
 * "change" listener firing during the tick) queues duplicate frames that multiply every frame,
 * freezing the tab and starving the animation clock. (A one-off rAF that only waits for layout and
 * then calls request() is fine.)
 */

/** Advances the scene by dt seconds and renders. Returns true while something is still moving. */
export type Tick = (dt: number) => boolean;

export interface FrameLoop {
  /** Ask for a frame (cheap and idempotent; call it after any change that needs a redraw). */
  request(): void;
  /** Pause while off-screen; resuming requests a frame. */
  setActive(active: boolean): void;
  dispose(): void;
}

/** Longest step fed to the tick, so a stalled tab doesn't jump the animation forward. */
const MAX_DT = 0.05;

export function createFrameLoop(
  tick: Tick,
  schedule: (callback: (now: number) => void) => number = (callback) => requestAnimationFrame(callback),
  cancel: (id: number) => void = (id) => cancelAnimationFrame(id),
): FrameLoop {
  let pending = 0;
  let last = 0;
  let active = true;

  const request = (): void => {
    if (pending === 0 && active) pending = schedule(run);
  };

  function run(now: number): void {
    pending = 0;
    const dt = last ? Math.min(MAX_DT, (now - last) / 1000) : 0;
    last = now;
    if (tick(dt)) request();
    // Idle: restart the clock on the next frame, unless the tick itself requested one.
    else if (pending === 0) last = 0;
  }

  return {
    request,
    setActive(next) {
      active = next;
      if (active) request();
      else if (pending !== 0) {
        cancel(pending);
        pending = 0;
        last = 0;
      }
    },
    dispose() {
      if (pending !== 0) cancel(pending);
      pending = 0;
      active = false;
    },
  };
}
