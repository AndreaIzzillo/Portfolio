"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const fadeDuration = 0.65;

export function ProjectBackdrop({ src, closing }: { src: string; closing: boolean }) {
  const reducedMotion = useReducedMotion();
  const [loadedSource, setLoadedSource] = useState<string>();
  const duration = reducedMotion ? 0 : fadeDuration;

  useEffect(() => {
    if (closing) return;

    let active = true;
    const image = new Image();
    image.src = src;
    void image.decode().then(
      () => {
        if (active) setLoadedSource(src);
      },
      () => {
        // Keep the last decoded backdrop if the asset cannot be loaded.
      },
    );
    return () => {
      active = false;
    };
  }, [src, closing]);

  return (
    <div className="project-backdrop" aria-hidden="true" data-closing={closing}>
      <AnimatePresence>
        {loadedSource && (
          <m.div
            key={loadedSource}
            className="project-backdrop__image"
            style={{
              backgroundImage: `linear-gradient(#e8f3f42e, #e8f3f42e), url("${loadedSource}")`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
