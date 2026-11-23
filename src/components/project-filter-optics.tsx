"use client";

import { cancelFrame, frame, type MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";

import { createFilterRefraction } from "@/lib/project-filter-refraction";

export function ProjectFilterOptics({
  position,
  scale,
  trackRef,
  onRefractionChange,
}: {
  position: MotionValue<number>;
  scale: MotionValue<number>;
  trackRef: RefObject<HTMLDivElement | null>;
  onRefractionChange: (active: boolean) => void;
}) {
  const outputRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const output = outputRef.current;
    const track = trackRef.current;
    if (!output || !track) return;

    const surface = createFilterRefraction(output);
    if (!surface) return;

    let active = false;
    const render = () => {
      if (surface.draw(position.get(), scale.get()) && !active) {
        active = true;
        onRefractionChange(true);
      }
    };
    const schedule = () => {
      frame.postRender(render);
    };
    const resize = () => {
      const { width, height } = track.getBoundingClientRect();
      surface.resize(width, height);
      schedule();
    };
    const fallback = () => {
      active = false;
      onRefractionChange(false);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(track);
    resize();
    const stopPosition = position.on("change", schedule);
    const stopScale = scale.on("change", schedule);
    output.addEventListener("webglcontextlost", fallback);

    return () => {
      cancelFrame(render);
      observer.disconnect();
      stopPosition();
      stopScale();
      output.removeEventListener("webglcontextlost", fallback);
      surface.destroy();
    };
  }, [onRefractionChange, position, scale, trackRef]);

  return <canvas ref={outputRef} className="project-filters__refraction" aria-hidden="true" />;
}
