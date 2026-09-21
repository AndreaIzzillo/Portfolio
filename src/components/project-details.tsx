"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ProjectGallery } from "@/components/project-gallery";

export type BubbleOrigin = { x: number; y: number };

export function ProjectDetails({
  project,
  origin,
  onDismiss,
}: {
  project: Project;
  origin: BubbleOrigin;
  onDismiss: () => void;
}) {
  const { t } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  const collapsed = reduceMotion
    ? { opacity: 0, x: 0, y: 0, scale: 1, borderRadius: "40px" }
    : { opacity: 0, x: origin.x, y: origin.y, scale: 0.12, borderRadius: "50%" };

  return (
    <dialog
      id={`project-${project.id}-details`}
      ref={dialog}
      className="project-detail-dialog"
      aria-labelledby="project-detail-title"
      aria-describedby="project-detail-subtitle"
      data-closing={closing}
      onCancel={(event) => {
        event.preventDefault();
        setClosing(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) setClosing(true);
      }}
    >
      <motion.article
        className="project-detail"
        initial={collapsed}
        animate={closing ? collapsed : { opacity: 1, x: 0, y: 0, scale: 1, borderRadius: "40px" }}
        transition={{
          duration: reduceMotion ? 0 : closing ? 0.35 : 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={() => {
          if (closing) onDismiss();
        }}
        inert={closing}
      >
        <LanguageToggle inDialog />
        <button
          type="button"
          className="glass-control project-detail__close"
          aria-label={t.closeProject}
          onClick={() => setClosing(true)}
          autoFocus
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <ProjectGallery images={project.images} />

        <div className="project-detail__content">
          <span className="project-detail__eyebrow">
            {t.project} {String(project.id).padStart(2, "0")}
          </span>
          <h2 id="project-detail-title">{project.title}</h2>
          <p id="project-detail-subtitle" className="project-detail__subtitle">
            {project.subtitle}
          </p>
          <div className="project-detail__divider" aria-hidden="true" />
          <p className="project-detail__description">{project.description}</p>
          {(project.repoUrl || project.demoUrl) && (
            <div className="project-detail__actions">
              {project.repoUrl && (
                <a
                  className="glass-link"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.code} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> ({t.newTab})</span>
                </a>
              )}
              {project.demoUrl && (
                <a
                  className="glass-link glass-link--demo"
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">▷</span> {t.demo}
                  <span className="sr-only"> (YouTube, {t.newTab})</span>
                </a>
              )}
            </div>
          )}
        </div>
      </motion.article>
    </dialog>
  );
}
