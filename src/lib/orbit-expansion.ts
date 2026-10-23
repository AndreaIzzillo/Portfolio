export type OrbitExpansion = "closed" | "open" | "closing";
export type OrbitExpansionAction = "open" | "close" | "finishClosing" | "closeImmediately";

export function orbitExpansionReducer(
  state: OrbitExpansion,
  action: OrbitExpansionAction,
): OrbitExpansion {
  switch (action) {
    case "open":
      return "open";
    case "close":
      return state === "open" ? "closing" : state;
    case "finishClosing":
      return state === "closing" ? "closed" : state;
    case "closeImmediately":
      return "closed";
  }
}
