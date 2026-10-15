"use client";

import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}

export function usePageVisible() {
  return useSyncExternalStore(
    subscribe,
    () => !document.hidden,
    () => true,
  );
}
