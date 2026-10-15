// Shared rendering budgets. Keep density and motion independent of display refresh rate.
export const animationSettings = {
  particleFps: 60,
  maxPixelRatio: 2,
  maxCanvasPixels: 4_000_000,
} as const;

export function canvasPixelRatio(width: number, height: number, deviceRatio: number) {
  return Math.min(
    deviceRatio || 1,
    animationSettings.maxPixelRatio,
    Math.sqrt(animationSettings.maxCanvasPixels / Math.max(1, width * height)),
  );
}
