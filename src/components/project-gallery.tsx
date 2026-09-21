"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { useLanguage } from "@/components/language-provider";
import type { ProjectImage } from "@/data/projects";
import type { NonEmptyArray } from "@/lib/arrays";

type ProjectGalleryProps = {
  images: NonEmptyArray<ProjectImage>;
};

export function ProjectGallery({ images }: ProjectGalleryProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex] ?? images[0];

  function selectRelativeImage(direction: number) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <div className="project-gallery" aria-label={t.gallery}>
      <div className="project-gallery__halo" aria-hidden="true" />
      <button
        type="button"
        className="project-gallery__image"
        aria-label={
          hasMultipleImages ? t.imagePosition(activeIndex + 1, images.length) : activeImage.alt
        }
        onClick={() => selectRelativeImage(1)}
        disabled={!hasMultipleImages}
        onKeyDown={(event) => {
          if (!hasMultipleImages || !["ArrowLeft", "ArrowRight"].includes(event.key)) {
            return;
          }

          event.preventDefault();
          selectRelativeImage(event.key === "ArrowLeft" ? -1 : 1);
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={activeIndex}
            className="project-gallery__frame"
            initial={{
              opacity: 0,
              scale: reducedMotion ? 1 : 1.06,
              filter: reducedMotion ? "none" : "blur(8px)",
            }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: reducedMotion ? 1 : 0.96,
              filter: reducedMotion ? "none" : "blur(8px)",
            }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              sizes="(max-width: 700px) 72vw, 340px"
              className="project-gallery__asset"
            />
          </motion.span>
        </AnimatePresence>

        <span className="project-gallery__gloss" aria-hidden="true" />
        {hasMultipleImages && (
          <span className="project-gallery__hint">
            {t.nextImage} <span aria-hidden="true">↗</span>
          </span>
        )}
      </button>

      {hasMultipleImages && (
        <div className="project-gallery__navigation">
          <button
            type="button"
            className="glass-control"
            aria-label={t.previousImage}
            onClick={() => selectRelativeImage(-1)}
          >
            ←
          </button>

          <div className="project-gallery__dots">
            {images.map((image, index) => (
              <button
                key={image.alt}
                type="button"
                aria-label={t.showImage(index + 1)}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <button
            type="button"
            className="glass-control"
            aria-label={t.nextImage}
            onClick={() => selectRelativeImage(1)}
          >
            →
          </button>
        </div>
      )}

      <p className="project-gallery__count" aria-live="polite" aria-atomic="true">
        {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </p>
    </div>
  );
}
