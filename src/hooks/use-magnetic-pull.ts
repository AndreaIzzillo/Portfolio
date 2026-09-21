"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useSpring } from "motion/react";

const MAGNETIC_REACH = 120;
const MAXIMUM_PULL = 9;
const SPRING_CONFIG = { stiffness: 65, damping: 19, mass: 0.9 };

export function useMagneticPull<T extends HTMLElement>() {
  const anchorRef = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, SPRING_CONFIG);
  const y = useSpring(0, SPRING_CONFIG);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const reset = () => {
      x.set(0);
      y.set(0);
    };

    if (reducedMotion) {
      x.jump(0);
      y.jump(0);
      return;
    }

    const attract = (event: PointerEvent) => {
      const anchor = anchorRef.current;
      if (!finePointer.matches || event.pointerType !== "mouse" || !anchor) {
        reset();
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const deltaX = event.clientX - (rect.left + rect.width / 2);
      const deltaY = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      const radius = rect.width / 2;
      const proximity = Math.max(0, 1 - Math.max(0, distance - radius) / MAGNETIC_REACH);
      const falloff = proximity * proximity * (3 - 2 * proximity);
      const pull = (MAXIMUM_PULL * falloff) / Math.max(radius, distance);

      x.set(deltaX * pull);
      y.set(deltaY * pull);
    };

    window.addEventListener("pointermove", attract, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    document.documentElement.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", reset);
    finePointer.addEventListener("change", reset);

    return () => {
      window.removeEventListener("pointermove", attract);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", reset);
      finePointer.removeEventListener("change", reset);
    };
  }, [reducedMotion, x, y]);

  return { anchorRef, reducedMotion, x, y };
}
