type RelativePosition = readonly [x: number, y: number];
export type ProjectOffset = { x: number; y: number };

const MOBILE_POSITIONS = [
  [-0.25, -0.3],
  [0.25, -0.3],
  [-0.32, 0.28],
  [0, 0.34],
  [0.32, 0.28],
] as const satisfies readonly RelativePosition[];

const DESKTOP_POSITIONS = [
  [-0.27, -0.25],
  [-0.34, 0],
  [-0.27, 0.25],
  [0.27, -0.2],
  [0.27, 0.2],
] as const satisfies readonly RelativePosition[];

export function getProjectOffsets(width: number, height: number): NonEmptyArray<ProjectOffset> {
  const positions = width <= 640 ? MOBILE_POSITIONS : DESKTOP_POSITIONS;

  return requireAtLeastOne(
    positions.map(([x, y]) => ({ x: x * width, y: y * height })),
    "The project layout must contain at least one position.",
  );
}
import { requireAtLeastOne, type NonEmptyArray } from "@/lib/arrays";
