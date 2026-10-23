export type ProjectOffset = { x: number; y: number };
export type ProjectLayout = { height: number; offsets: ProjectOffset[] };

const TAU = Math.PI * 2;
const EDGE_PADDING = 16;
const MOTION_PADDING = 16;
const GAP = 18;
const HOVER_SCALE = 1.06;
const OVAL_WIDTH_RATIO = 0.62;
const MAX_OVAL_WIDTH = 1280;
const MIN_CONTROL_SPACE = 80;
const MAX_CONTROL_SPACE = 144;

function getGeometry(width: number, viewportHeight: number) {
  const projectRadius = Math.min(116, width * 0.22, viewportHeight * 0.22) / 2;
  const portraitRadius = Math.min(170, width * 0.32, viewportHeight * 0.32) / 2;
  const bodyRadius = projectRadius * HOVER_SCALE + MOTION_PADDING;
  // The rotating title extends beyond the image; allow it beside another bubble.
  const titleRadius = (projectRadius + 24) * 0.9 * HOVER_SCALE + MOTION_PADDING;
  const envelope = Math.min(
    Math.max(bodyRadius, titleRadius),
    Math.max(1, width / 2 - EDGE_PADDING - 1),
  );
  return {
    envelope,
    radiusX: Math.min(
      (width * OVAL_WIDTH_RATIO) / 2,
      MAX_OVAL_WIDTH / 2,
      width / 2 - envelope - EDGE_PADDING,
    ),
    controlSpace: Math.max(MIN_CONTROL_SPACE, Math.min(MAX_CONTROL_SPACE, viewportHeight * 0.1)),
    separation: envelope + bodyRadius + GAP,
    portraitSeparation: envelope + portraitRadius * HOVER_SCALE + MOTION_PADDING + GAP,
  };
}

function outsideControl(
  point: ProjectOffset,
  left: number,
  right: number,
  bottom: number,
  radius: number,
) {
  const dx = Math.max(left - point.x, 0, point.x - right);
  const dy = Math.max(-point.y, 0, point.y - bottom);
  return dx * dx + dy * dy >= radius * radius;
}

function placeOnEllipse(
  width: number,
  height: number,
  count: number,
  geometry: ReturnType<typeof getGeometry>,
): ProjectOffset[] | null {
  const { envelope, separation, portraitSeparation, radiusX: rx, controlSpace } = geometry;
  const ry = height / 2 - envelope - EDGE_PADDING - controlSpace;
  const samples: { point: ProjectOffset; distance: number }[] = [];
  const sampleCount = Math.max(720, count * 48);
  let previous = { x: 0, y: -ry };
  let availableLength = 0;

  for (let index = 1; index <= sampleCount; index++) {
    const angle = -Math.PI / 2 + (index * TAU) / sampleCount;
    const point = { x: Math.cos(angle) * rx, y: Math.sin(angle) * ry };
    const length = Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
    const absolute = { x: width / 2 + point.x, y: height / 2 + point.y };
    if (
      Math.hypot(point.x, point.y) < portraitSeparation ||
      !outsideControl(absolute, 0, 96, 164, envelope) ||
      !outsideControl(absolute, width - 96, width, 112, envelope)
    )
      continue;

    availableLength += length;
    samples.push({ point, distance: availableLength });
  }

  if (samples.length < count) return null;
  const step = availableLength / count;
  if (count > 1 && step < separation * 0.75) return null;

  function atDistance(distance: number) {
    let low = 0;
    let high = samples.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (samples[middle]!.distance < distance) low = middle + 1;
      else high = middle;
    }
    return samples[low]!.point;
  }

  let best: ProjectOffset[] | null = null;
  let bestScore = -Infinity;
  // Try a few necklace rotations; no solver or random work runs during animation.
  for (let rotation = 0; rotation < 24; rotation++) {
    const phase = (0.5 + rotation / 24) % 1;
    const offsets: ProjectOffset[] = [];
    let minimumDistance = Infinity;
    let sumX = 0;
    let sumY = 0;
    for (let index = 0; index < count; index++) {
      const variation = Math.sin(index * 2.399963 + 0.7) * 0.055;
      const distance = ((index + phase + variation) * step + availableLength) % availableLength;
      const point = atDistance(distance);
      for (const other of offsets) {
        minimumDistance = Math.min(
          minimumDistance,
          Math.hypot(point.x - other.x, point.y - other.y),
        );
      }
      if (minimumDistance < separation) break;
      offsets.push(point);
      sumX += point.x;
      sumY += point.y;
    }
    if (offsets.length !== count) continue;
    const balance = Math.hypot(sumX / count, sumY / count);
    const score = (count > 1 ? minimumDistance : 0) - balance * 0.5;
    if (score > bestScore) {
      best = offsets;
      bestScore = score;
    }
  }
  return best;
}

/** Keep the necklace central, reserving top and bottom space for portfolio controls. */
export function getProjectLayout(
  width: number,
  viewportHeight: number,
  count: number,
): ProjectLayout {
  if (width <= 2 * (EDGE_PADDING + 1) || viewportHeight <= 0 || count <= 0) {
    return { height: Math.max(560, viewportHeight), offsets: [] };
  }

  const geometry = getGeometry(width, viewportHeight);
  let height = Math.ceil(
    Math.max(
      560,
      viewportHeight,
      (count * geometry.separation) / 2 -
        Math.PI * geometry.radiusX +
        2 * (geometry.envelope + EDGE_PADDING + geometry.controlSpace),
    ),
  );
  let offsets = placeOnEllipse(width, height, count, geometry);
  while (!offsets) {
    height = Math.ceil(height * 1.12 + 24);
    offsets = placeOnEllipse(width, height, count, geometry);
  }
  return { height, offsets };
}
