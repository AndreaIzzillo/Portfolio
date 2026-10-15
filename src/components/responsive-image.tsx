import type { CSSProperties } from "react";

import { imageSource, imageSourceSet, type MediaAsset } from "@/lib/media";

export function ResponsiveImage({
  asset,
  alt,
  sizes,
  className,
  style,
  priority = false,
}: {
  asset: MediaAsset;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}) {
  return (
    // Variants are generated at build time, including for static GitHub Pages hosting.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSource(asset)}
      srcSet={imageSourceSet(asset)}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={className}
      style={style}
    />
  );
}
