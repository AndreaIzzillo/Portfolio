export type OrbitParticle = {
  group: number;
  kind: "path" | "halo";
  seed: number;
  phase: number;
  radius: number;
  sparkle: boolean;
  trail: { x: number; y: number }[];
};

// Deterministic variation keeps particles stable across opening and resizing.
function noise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function createOrbitParticles(projectCount: number, compact: boolean): OrbitParticle[] {
  if (projectCount <= 0) return [];

  // Share the canvas budget evenly, retaining both effects for every project.
  const perProject = Math.max(3, Math.min(compact ? 25 : 45, Math.floor(360 / projectCount)));
  const pathCount = Math.ceil(perProject / 3);

  return Array.from({ length: projectCount }, (_, group) =>
    Array.from({ length: perProject }, (_, index): OrbitParticle => {
      const seed = group * 1000 + index;
      const isPath = index < pathCount;
      return {
        group,
        kind: isPath ? "path" : "halo",
        // Independent radial and angular variation avoids evenly spaced rings.
        seed: noise(seed + 1),
        phase: noise(seed + 101) * Math.PI * 2,
        radius: 0.8 + noise(seed + 201) * 1.8,
        sparkle: index % 13 === 0,
        trail: [],
      };
    }),
  ).flat();
}
