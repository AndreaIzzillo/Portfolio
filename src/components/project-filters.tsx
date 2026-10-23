"use client";

import { m, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { useLanguage } from "@/components/language-provider";
import { projectFilters, type ProjectFilter } from "@/lib/project-filters";

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
  const group = useRef<HTMLDivElement>(null);
  const selected = projectFilters.indexOf(value);

  return (
    <m.div
      className="project-filters"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={group}
        className="project-filters__track"
        role="radiogroup"
        aria-label={t.projectFilters}
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
          onChange(projectFilters[next]!);
          group.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({
            preventScroll: true,
          });
        }}
      >
        <span
          className="project-filters__slider"
          style={{ transform: `translateX(${selected * 100}%)` }}
          aria-hidden="true"
        />
        {projectFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            role="radio"
            aria-checked={value === filter}
            aria-controls="project-bubbles"
            tabIndex={value === filter ? 0 : -1}
            className="project-filters__option"
            onClick={() => onChange(filter)}
          >
            {t.projectCategories[filter]}
          </button>
        ))}
      </div>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {t.projectCount(count)}
      </span>
    </m.div>
  );
}
