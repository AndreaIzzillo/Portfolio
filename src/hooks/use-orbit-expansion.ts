"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, type RefObject } from "react";

import {
  orbitExpansionReducer,
  type OrbitExpansion,
  type OrbitExpansionAction,
} from "@/lib/orbit-expansion";

export function useOrbitExpansion({
  center,
  sceneHeight,
  viewportHeight,
  reducedMotion,
  hasProjects,
}: {
  center: RefObject<HTMLDivElement | null>;
  sceneHeight: number;
  viewportHeight: number;
  reducedMotion: boolean | null;
  hasProjects: boolean;
}) {
  const [phase, dispatch] = useReducer(orbitExpansionReducer, "closed");
  const anchor = useRef<{ y: number; phase: OrbitExpansion } | null>(null);
  const animation = useRef<Animation | null>(null);
  const geometry = useRef<{
    height: number;
    viewportHeight: number;
    viewportWidth: number;
    scrollY: number;
    phase: OrbitExpansion;
  } | null>(null);

  function transition(action: OrbitExpansionAction) {
    const next = orbitExpansionReducer(phase, action);
    if (next === phase) return;
    const bounds = center.current?.getBoundingClientRect();
    anchor.current = bounds ? { y: bounds.top + bounds.height / 2, phase: next } : null;
    animation.current?.cancel();
    animation.current = null;
    dispatch(action);
  }

  useLayoutEffect(() => {
    const previous = anchor.current;
    anchor.current = null;
    const element = center.current;
    if (!element) return;
    const lastGeometry = geometry.current;
    const currentGeometry = {
      height: element.parentElement?.getBoundingClientRect().height ?? sceneHeight,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      scrollY: window.scrollY,
      phase,
    };
    geometry.current = currentGeometry;

    if (!previous) {
      if (phase !== "closed" && lastGeometry?.phase === phase) {
        const shift =
          (currentGeometry.height -
            lastGeometry.height -
            currentGeometry.viewportHeight +
            lastGeometry.viewportHeight) /
          2;
        if (Math.abs(shift) > 0.5) {
          window.scrollTo({
            top: Math.max(0, lastGeometry.scrollY + shift),
            left: window.scrollX,
            behavior: "instant",
          });
          currentGeometry.scrollY = window.scrollY;
        }
      }
      return;
    }
    if (previous.phase !== phase) return;

    const bounds = element.getBoundingClientRect();
    const delta = bounds.top + bounds.height / 2 - previous.y;
    if (Math.abs(delta) > 0.5) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + delta),
        left: window.scrollX,
        behavior: "instant",
      });
    }
    currentGeometry.scrollY = window.scrollY;

    // A collapsed page cannot keep its old scroll offset; finish the portrait's return with a transform.
    const adjusted = element.getBoundingClientRect();
    const remaining = previous.y - adjusted.top - adjusted.height / 2;
    if (!reducedMotion && Math.abs(remaining) > 0.5) {
      animation.current = element.animate(
        [{ transform: `translateY(${remaining}px)` }, { transform: "translateY(0px)" }],
        { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
  }, [phase, sceneHeight, viewportHeight, center, reducedMotion]);

  useEffect(() => {
    const rememberScroll = () => {
      const previous = geometry.current;
      if (
        previous &&
        previous.viewportHeight === window.innerHeight &&
        previous.viewportWidth === window.innerWidth
      ) {
        previous.scrollY = window.scrollY;
      }
    };
    window.addEventListener("scroll", rememberScroll, { passive: true });
    return () => window.removeEventListener("scroll", rememberScroll);
  }, []);

  useEffect(() => () => animation.current?.cancel(), []);

  return {
    open: phase === "open",
    expanded: phase !== "closed",
    closing: phase === "closing",
    openProjects: () => transition("open"),
    closeProjects: () => transition(reducedMotion || !hasProjects ? "closeImmediately" : "close"),
    finishClosing: () => transition("finishClosing"),
  };
}
