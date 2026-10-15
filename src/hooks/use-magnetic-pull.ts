"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useSpring } from "motion/react";

import { subscribeMagneticPointer } from "@/lib/magnetic-pointer";

const MAGNETIC_REACH = 120;
const MAXIMUM_PULL = 9;
const SPRING_CONFIG = { stiffness: 65, damping: 19, mass: 0.9 };

export function useMagneticPull<T extends HTMLElement>(active = true) {
  const anchorRef = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, SPRING_CONFIG);
  const y = useSpring(0, SPRING_CONFIG);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let unsubscribe: (() => void) | undefined;

    const sync = () => {
      unsubscribe?.();
      unsubscribe = undefined;
      if (!active) {
        // Freeze at the rendered position while a modal obscures the scene.
        x.stop();
        y.stop();
        return;
      }
      x.jump(0);
      y.jump(0);
      if (reducedMotion || !finePointer.matches) return;

      unsubscribe = subscribeMagneticPointer((point) => {
        const anchor = anchorRef.current;
        if (!point || !anchor)
          return () => {
            x.set(0);
            y.set(0);
          };
        const rect = anchor.getBoundingClientRect();
        const deltaX = point.x - (rect.left + rect.width / 2);
        const deltaY = point.y - (rect.top + rect.height / 2);
        const distance = Math.hypot(deltaX, deltaY);
        const radius = rect.width / 2;
        const proximity = Math.max(0, 1 - Math.max(0, distance - radius) / MAGNETIC_REACH);
        const falloff = proximity * proximity * (3 - 2 * proximity);
        const pull = (MAXIMUM_PULL * falloff) / Math.max(1, radius, distance);
        return () => {
          x.set(deltaX * pull);
          y.set(deltaY * pull);
        };
      });
    };

    sync();
    finePointer.addEventListener("change", sync);
    return () => {
      unsubscribe?.();
      finePointer.removeEventListener("change", sync);
    };
  }, [active, reducedMotion, x, y]);

  return { anchorRef, reducedMotion, x, y };
}
