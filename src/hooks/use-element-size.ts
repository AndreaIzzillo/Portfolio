"use client";

import { useEffect, useRef, useState } from "react";

type ElementSize = {
  width: number;
  height: number;
};

const emptySize: ElementSize = { width: 0, height: 0 };

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>(emptySize);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const { width, height } = entry.contentRect;
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
