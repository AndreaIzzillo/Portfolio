import type { ProjectOffset } from "@/lib/orbit-layout";

export type ParticleDestination = { id: number; offset: ProjectOffset | null };

type ParticleTransition = {
  id: number;
  x: number;
  y: number;
  opacity: number;
  fromX: number;
  fromY: number;
  fromOpacity: number;
  toX: number;
  toY: number;
  visible: boolean;
  elapsed: number;
};

const DURATION = 0.7;

export function reconcileParticleTransitions(
  previous: readonly ParticleTransition[],
  destinations: readonly ParticleDestination[],
): ParticleTransition[] {
  const byId = new Map(previous.map((target) => [target.id, target]));
  return destinations.map(({ id, offset }) => {
    const existing = byId.get(id);
    const x = offset?.x ?? existing?.toX ?? 0;
    const y = offset?.y ?? existing?.toY ?? 0;
    const visible = offset !== null;
    if (existing) {
      if (existing.toX !== x || existing.toY !== y || existing.visible !== visible) {
        existing.fromX = existing.x;
        existing.fromY = existing.y;
        existing.fromOpacity = existing.opacity;
        existing.toX = x;
        existing.toY = y;
        existing.visible = visible;
        existing.elapsed = 0;
      }
      return existing;
    }
    const opacity = previous.length === 0 && visible ? 1 : 0;
    return {
      id,
      x,
      y,
      opacity,
      fromX: x,
      fromY: y,
      fromOpacity: opacity,
      toX: x,
      toY: y,
      visible,
      elapsed: 0,
    };
  });
}

export function advanceParticleTransitions(
  targets: readonly ParticleTransition[],
  dt: number,
  reducedMotion: boolean,
) {
  for (const target of targets) {
    target.elapsed = reducedMotion ? DURATION : Math.min(DURATION, target.elapsed + dt);
    const progress = 1 - (1 - target.elapsed / DURATION) ** 3;
    target.x = target.fromX + (target.toX - target.fromX) * progress;
    target.y = target.fromY + (target.toY - target.fromY) * progress;
    target.opacity = target.fromOpacity + (Number(target.visible) - target.fromOpacity) * progress;
  }
}
