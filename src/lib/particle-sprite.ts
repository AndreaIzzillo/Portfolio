// Rasterize each particle once, preserving its halo, core and optional sparkle.
// The animation loop only composites the cached bitmap with a changing opacity.
export function createParticleSprite(
  radius: number,
  color: string,
  sparkle: boolean,
  ratio: number,
) {
  const extent = Math.max(radius * 4, sparkle ? 5 : 0) + 1;
  const size = Math.ceil(extent * 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(size * ratio);
  canvas.height = Math.ceil(size * ratio);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.scale(canvas.width / size, canvas.height / size);
  const center = size / 2;
  const glow = context.createRadialGradient(center, center, 0, center, center, radius * 4);
  glow.addColorStop(0, `rgba(${color}, 0.32)`);
  glow.addColorStop(1, `rgba(${color}, 0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, size, size);
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.fillStyle = `rgb(${color})`;
  context.fill();
  if (sparkle) {
    context.beginPath();
    context.moveTo(center - 4, center);
    context.lineTo(center + 4, center);
    context.moveTo(center, center - 4);
    context.lineTo(center, center + 4);
    context.strokeStyle = `rgba(${color}, 0.55)`;
    context.lineWidth = 0.6;
    context.stroke();
  }
  return { canvas, size };
}
