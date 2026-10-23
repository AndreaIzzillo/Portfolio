"use client";

import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
}

export function useViewportHeight() {
  return useSyncExternalStore(
    subscribe,
    () => window.innerHeight,
    () => 0,
  );
}
