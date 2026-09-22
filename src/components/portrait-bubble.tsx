"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";
import type { CSSProperties, MouseEventHandler } from "react";

import { useLanguage } from "@/components/language-provider";
import { useMagneticPull } from "@/hooks/use-magnetic-pull";
import portrait from "../../public/images/portrait.jpg";

type BubbleProps = {
  image: StaticImageData | string;
  imagePosition?: string;
  imageZoom?: number;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  project?: boolean;
  index?: number;
  expanded?: boolean;
  selected?: boolean;
  controls?: string;
};

export function PortraitBubble({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <FloatingBubble
      image={portrait}
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
  label,
  onClick,
  project = false,
  index = 0,
  expanded,
  selected,
  controls,
}: BubbleProps) {
  const { t } = useLanguage();
  const { anchorRef, reducedMotion, x, y } = useMagneticPull<HTMLDivElement>();

  return (
    <div ref={anchorRef} className={`portrait-anchor${project ? " portrait-anchor--project" : ""}`}>
      <motion.div
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
            <Image
              src={image}
              alt={project ? "" : t.portrait}
              fill
              sizes={project ? "min(116px, 22vw, 22svh)" : "min(170px, 32vw, 32svh)"}
              preload={!project}
              className="portrait-bubble__image"
              style={{ objectPosition: imagePosition, transform: `scale(${imageZoom})` }}
              draggable={false}
            />
            <span className="portrait-bubble__rim" aria-hidden="true" />
            <span className="portrait-bubble__reflection" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
