type Point = { x: number; y: number };
type Measure = (point: Point | null) => () => void;
const subscribers = new Set<Measure>();
let frame = 0;
let point: Point | null = null;

function flush() {
  frame = 0;
  // Read every anchor before writing any spring, avoiding read/write interleaving.
  const updates = Array.from(subscribers, (measure) => measure(point));
  updates.forEach((update) => update());
}

function move(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  point = { x: event.clientX, y: event.clientY };
  if (!frame) frame = requestAnimationFrame(flush);
}

function reset() {
  point = null;
  cancelAnimationFrame(frame);
  flush();
}

export function subscribeMagneticPointer(measure: Measure) {
  if (subscribers.size === 0) {
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    window.addEventListener("scroll", reset, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", reset);
  }
  subscribers.add(measure);
  return () => {
    subscribers.delete(measure);
    if (subscribers.size !== 0) return;
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("blur", reset);
    window.removeEventListener("resize", reset);
    window.removeEventListener("scroll", reset, true);
    document.documentElement.removeEventListener("pointerleave", reset);
    document.removeEventListener("visibilitychange", reset);
  };
}
