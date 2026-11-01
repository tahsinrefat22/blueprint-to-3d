import { describe, expect, test } from "bun:test";
import { createFrameLoop } from "../src/model/loop";

/** A fake requestAnimationFrame: callbacks queue up and run when flush() is called. */
function fakeFrames() {
  let nextId = 1;
  let queue: { id: number; callback: (now: number) => void }[] = [];
  let now = 0;
  return {
    schedule: (callback: (now: number) => void) => {
      const id = nextId++;
      queue.push({ id, callback });
      return id;
    },
    cancel: (id: number) => {
      queue = queue.filter((f) => f.id !== id);
    },
    pending: () => queue.length,
    flush: () => {
      now += 16;
      const due = queue;
      queue = [];
      for (const f of due) f.callback(now);
    },
  };
}

describe("frame loop", () => {
  test("a request made during the tick never queues a second frame", () => {
    const frames = fakeFrames();
    // Mimics OrbitControls dispatching "change" (which requests a frame) inside the tick.
    const loop = createFrameLoop(
      () => {
        loop.request();
        return true;
      },
      frames.schedule,
      frames.cancel,
    );
    loop.request();
    for (let i = 0; i < 60; i++) {
      expect(frames.pending()).toBe(1);
      frames.flush();
    }
    expect(frames.pending()).toBe(1);
  });

  test("repeated requests while one is pending are ignored", () => {
    const frames = fakeFrames();
    const loop = createFrameLoop(() => false, frames.schedule, frames.cancel);
    for (let i = 0; i < 10; i++) loop.request();
    expect(frames.pending()).toBe(1);
  });

  test("stops when idle and passes real elapsed time while busy", () => {
    const frames = fakeFrames();
    const steps: number[] = [];
    let busyFrames = 3;
    const loop = createFrameLoop(
      (dt) => {
        steps.push(dt);
        return --busyFrames > 0;
      },
      frames.schedule,
      frames.cancel,
    );
    loop.request();
    for (let i = 0; i < 5; i++) frames.flush();
    expect(steps).toEqual([0, 0.016, 0.016]);
    expect(frames.pending()).toBe(0);
  });

  test("inactive loops schedule nothing and resume on reactivation", () => {
    const frames = fakeFrames();
    const loop = createFrameLoop(() => true, frames.schedule, frames.cancel);
    loop.request();
    loop.setActive(false);
    expect(frames.pending()).toBe(0);
    loop.request();
    expect(frames.pending()).toBe(0);
    loop.setActive(true);
    expect(frames.pending()).toBe(1);
  });
});
