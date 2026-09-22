export type ProjectOffset = { x: number; y: number };

export function getProjectSceneHeight(width: number, count: number): number {
  if (count <= 5) return 560;
  const columns = width <= 640 ? 2 : 3;
  return 160 + Math.ceil(count / (columns * 2)) * 340;
}

/** Distribute the current projects around the portrait, with no fixed slot limit. */
export function getProjectOffsets(width: number, height: number, count: number): ProjectOffset[] {
  if (count <= 0) return [];

  // Larger collections grow vertically instead of squeezing bubbles together.
  if (count > 5) {
    const columns = width <= 640 ? 2 : 3;
    const upperCount = Math.ceil(count / 2);
    return Array.from({ length: count }, (_, index) => {
      const upper = index < upperCount;
      const localIndex = upper ? index : index - upperCount;
      const sideCount = upper ? upperCount : count - upperCount;
      const row = Math.floor(localIndex / columns);
      const rowCount = Math.min(columns, sideCount - row * columns);
      return {
        x: ((localIndex % columns) - (rowCount - 1) / 2) * (width / (columns + 1)),
        y: (upper ? -1 : 1) * (160 + row * 170),
      };
    });
  }

  const radiusX = width * 0.32;
  const radiusY = height * 0.3;
  // Three projects form a triangle: two above the portrait and one below.
  const startAngle = count === 2 ? Math.PI : -Math.PI / 2 - Math.PI / count;

  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (index * Math.PI * 2) / count;
    return { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
  });
}
