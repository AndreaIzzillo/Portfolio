"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ProjectGallery } from "@/components/project-gallery";
import type { Project } from "@/data/projects";

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
                  {t.code}
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.51 11.51 0 0 1 3-.404c1.02.005 2.045.138 3 .404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
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
