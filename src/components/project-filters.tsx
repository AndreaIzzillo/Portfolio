"use client";

import {
  animate,
  m,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { useLanguage } from "@/components/language-provider";
import { ProjectFilterOptics } from "@/components/project-filter-optics";
import { filterGlyphs } from "@/lib/project-filter-glyphs";
import { projectFilters, type ProjectFilter } from "@/lib/project-filters";

type LensDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  pressedIndex: number;
  left: number;
  segmentWidth: number;
  preview: number | null;
};

const settleSpring = { type: "spring", stiffness: 390, damping: 32 } as const;
const hoveredScale = 1.22;
const pressedScale = 1.38;

function lensPosition(clientX: number, left: number, segmentWidth: number) {
  const index = (clientX - left) / segmentWidth - 0.5;
  return Math.max(0, Math.min(projectFilters.length - 1, index));
}

export function ProjectFilters({
  value,
  count,
  onChange,
}: {
  value: ProjectFilter;
  count: number;
  onChange: (filter: ProjectFilter) => void;
}) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const group = useRef<HTMLDivElement>(null);
  const selected = projectFilters.indexOf(value);
  const position = useMotionValue(selected);
  const x = useTransform(position, (index) => `${index * 100}%`);
  const interactionScale = useMotionValue(1);
  const hoverScale = useMotionValue(1);
  const scale = useTransform(() => Math.max(interactionScale.get(), hoverScale.get()));
  const captionLift = useTransform(scale, (value) => (1 - value) * 30);
  const drag = useRef<LensDrag | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [refractionActive, setRefractionActive] = useState(false);
  const highlighted = preview ?? selected;

  useEffect(() => {
    return () => {
      position.stop();
      interactionScale.stop();
    };
  }, [position, interactionScale]);

  useEffect(() => {
    if (reducedMotion) {
      hoverScale.jump(1);
      return;
    }

    const target = isPresent && hovered === selected ? hoveredScale : 1;
    if (hoverScale.get() === target) return;
    const playback = animate(hoverScale, target, settleSpring);
    return () => playback.stop();
  }, [hovered, hoverScale, isPresent, reducedMotion, selected]);

  function select(index: number, focus = false) {
    if (reducedMotion) {
      position.jump(index);
      interactionScale.jump(1);
    } else {
      animate(position, index, settleSpring);
      if (index !== selected) {
        animate(interactionScale, [null, pressedScale, 1], {
          duration: 0.46,
          times: [0, 0.26, 1],
          ease: ["easeOut", "easeInOut"],
        });
      } else {
        animate(interactionScale, 1, settleSpring);
      }
    }

    if (index !== selected) onChange(projectFilters[index]!);
    if (focus) {
      group.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus({
        preventScroll: true,
      });
    }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!isPresent || !event.isPrimary || event.button !== 0 || drag.current || !group.current) {
      return;
    }

    const { left, width } = group.current.getBoundingClientRect();
    if (width === 0) return;

    const button = event.target instanceof Element ? event.target.closest("button") : null;
    (button ?? event.currentTarget).setPointerCapture(event.pointerId);
    const segmentWidth = width / projectFilters.length;
    const pressedIndex = Math.round(lensPosition(event.clientX, left, segmentWidth));
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      pressedIndex,
      left,
      segmentWidth,
      preview: null,
    };
    if (pressedIndex === selected && !reducedMotion) {
      animate(interactionScale, pressedScale, settleSpring);
    }
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (gesture?.pointerId !== event.pointerId) return;
    if (gesture.preview === null) {
      const horizontal = Math.abs(event.clientX - gesture.startX);
      const vertical = Math.abs(event.clientY - gesture.startY);
      if (horizontal < 4 || horizontal <= vertical) return;
      position.stop();
      if (!reducedMotion) animate(interactionScale, pressedScale, settleSpring);
    }

    const next = lensPosition(event.clientX, gesture.left, gesture.segmentWidth);
    position.set(next);
    const nearest = Math.round(next);
    if (nearest !== gesture.preview) {
      gesture.preview = nearest;
      setPreview(nearest);
    }
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = drag.current;
    if (gesture?.pointerId !== event.pointerId) return;
    drag.current = null;
    setPreview(null);

    if (!isPresent) return;
    select(gesture.preview ?? (cancelled ? selected : gesture.pressedIndex), !cancelled);
  }

  return (
    <m.div
      className="project-filters"
      data-refraction={refractionActive ? "webgl" : "css"}
      inert={!isPresent}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={(event) => finishDrag(event, true)}
      onLostPointerCapture={(event) => finishDrag(event, true)}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={group}
        className="project-filters__track"
        style={{ "--project-filter-count": projectFilters.length } as CSSProperties}
        role="radiogroup"
        aria-label={t.projectFilters}
        data-dragging={preview !== null}
        onKeyDown={(event) => {
          let next: number;
          switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
              next = (selected + 1) % projectFilters.length;
              break;
            case "ArrowLeft":
            case "ArrowUp":
              next = (selected + projectFilters.length - 1) % projectFilters.length;
              break;
            case "Home":
              next = 0;
              break;
            case "End":
              next = projectFilters.length - 1;
              break;
            default:
              return;
          }
          event.preventDefault();
          select(next, true);
        }}
      >
        <m.span className="project-filters__slider" style={{ x }} aria-hidden="true">
          <m.span className="project-filters__lens" style={{ scale }} />
          <m.span className="project-filters__caption" style={{ y: captionLift }}>
            {t.projectCategories[projectFilters[highlighted]!]}
          </m.span>
        </m.span>
        <ProjectFilterOptics
          position={position}
          scale={scale}
          trackRef={group}
          onRefractionChange={setRefractionActive}
        />
        {projectFilters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            role="radio"
            aria-checked={value === filter}
            aria-controls="project-bubbles"
            aria-label={t.projectCategories[filter]}
            title={t.projectCategories[filter]}
            tabIndex={value === filter ? 0 : -1}
            className="project-filters__option"
            data-highlighted={index === highlighted}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setHovered(index);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setHovered(null);
            }}
            onClick={(event) => {
              if (event.detail === 0 && index !== selected) select(index);
            }}
          >
            <span className="project-filters__glyph" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={filterGlyphs[filter]} />
              </svg>
            </span>
          </button>
        ))}
      </div>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {t.projectCount(count)}
      </span>
    </m.div>
  );
}
