"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { usePageVisible } from "@/hooks/use-page-visible";
import { imageSource, mediaUrl, type MediaAsset } from "@/lib/media";
import { ResponsiveImage } from "@/components/responsive-image";

export function LoopingVideo({
  asset,
  alt,
  sizes,
  active = true,
}: {
  asset: MediaAsset;
  alt: string;
  sizes: string;
  active?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const visible = usePageVisible();
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!active || failed || reducedMotion) {
      element.pause();
      return;
    }
    let intersecting = false;
    const sync = () => {
      if (visible && intersecting) {
        void element.play().catch(() => {
          // Autoplay can be blocked by battery/data-saving policies; retain the poster.
        });
      } else {
        element.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(element);
    sync();
    return () => {
      observer.disconnect();
      element.pause();
    };
  }, [active, visible, reducedMotion, failed]);

  if (reducedMotion || failed || !asset.video) {
    return (
      <ResponsiveImage asset={asset} alt={alt} sizes={sizes} className="project-gallery__asset" />
    );
  }

  return (
    <video
      ref={video}
      src={mediaUrl(asset.video)}
      poster={imageSource(asset)}
      width={asset.width}
      height={asset.height}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="none"
      className="project-gallery__asset"
      onError={() => setFailed(true)}
    />
  );
}
