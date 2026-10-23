"use client";

import { m } from "motion/react";
import { useId, type CSSProperties, type MouseEventHandler } from "react";

import { ResponsiveImage } from "@/components/responsive-image";
import { getMedia, type MediaAsset } from "@/lib/media";
import { useLanguage } from "@/components/language-provider";
import { useMagneticPull } from "@/hooks/use-magnetic-pull";

const portrait = getMedia("portrait.jpg");

type BubbleProps = {
  image: MediaAsset;
  imagePosition?: string;
  imageZoom?: number;
  imageZoomOrigin?: string;
  active?: boolean;
  label: string;
  projectTitle?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  project?: boolean;
  index?: number;
  expanded?: boolean;
  selected?: boolean;
  controls?: string;
};

export function PortraitBubble({
  expanded,
  onClick,
  active,
}: {
  expanded: boolean;
  onClick: () => void;
  active: boolean;
}) {
  const { t } = useLanguage();
  return (
    <FloatingBubble
      image={portrait}
      active={active}
      label={expanded ? t.hideProjects : t.showProjects}
      expanded={expanded}
      controls="project-bubbles"
      onClick={onClick}
    />
  );
}

export function FloatingBubble({
  image,
  imagePosition,
  imageZoom = 1,
  imageZoomOrigin,
  active = true,
  label,
  projectTitle,
  onClick,
  project = false,
  index = 0,
  expanded,
  selected,
  controls,
}: BubbleProps) {
  const { t } = useLanguage();
  const { anchorRef, reducedMotion, x, y } = useMagneticPull<HTMLDivElement>(active);
  const titlePathId = useId();
  // Account for cover cropping, intentional zoom and hover scale on high-DPI displays.
  const sourceScale = Math.max(1, image.width / image.height) * (project ? imageZoom : 1.1) * 1.06;
  const size = project ? 116 : 170;
  const viewportSize = project ? 22 : 32;
  const titleRepetitions = Math.max(2, Math.round(415 / (((projectTitle?.length ?? 0) + 3) * 7)));

  return (
    <div ref={anchorRef} className={`portrait-anchor${project ? " portrait-anchor--project" : ""}`}>
      <m.div
        className="portrait-magnet"
        style={{ x, y, borderRadius: "50%" }}
        whileHover={reducedMotion ? undefined : { scale: 1.06 }}
        transition={{ scale: { type: "spring", stiffness: 180, damping: 20 } }}
      >
        <div
          className="portrait-float"
          style={
            project
              ? ({
                  animationDelay: `${-index * 2.3 - 1}s`,
                  animationDuration: `${12 + index}s`,
                } as CSSProperties)
              : undefined
          }
        >
          <button
            type="button"
            className="portrait-bubble"
            onClick={onClick}
            aria-label={label}
            aria-expanded={project ? selected : expanded}
            aria-controls={controls}
            aria-haspopup={project ? "dialog" : undefined}
          >
            <ResponsiveImage
              asset={image}
              alt={project ? "" : t.portrait}
              sizes={`min(${size * sourceScale}px, ${viewportSize * sourceScale}vw, ${viewportSize * sourceScale}svh)`}
              priority={!project}
              className="portrait-bubble__image"
              style={{
                objectPosition: imagePosition,
                transform: project ? `scale(${imageZoom})` : "translateY(-4%) scale(1.1)",
                transformOrigin: project ? imageZoomOrigin : undefined,
              }}
            />
            <span className="portrait-bubble__rim" aria-hidden="true" />
            <span className="portrait-bubble__reflection" aria-hidden="true" />
          </button>
          {project && projectTitle && (
            <svg
              className="project-bubble-title"
              viewBox="0 0 160 160"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <path id={titlePathId} d="M14 80a66 66 0 1 1 132 0a66 66 0 1 1-132 0" />
              </defs>
              <text textLength="407" lengthAdjust="spacingAndGlyphs">
                <textPath href={`#${titlePathId}`}>
                  {Array.from({ length: titleRepetitions }, () => `${projectTitle} ·`).join(" ")}
                </textPath>
              </text>
            </svg>
          )}
        </div>
      </m.div>
    </div>
  );
}
