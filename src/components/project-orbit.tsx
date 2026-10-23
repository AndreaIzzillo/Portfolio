"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { BubbleOrigin } from "@/components/bubble-dialog";
import { CvDetails } from "@/components/cv-details";
import { useLanguage } from "@/components/language-provider";
import { OrbitParticles } from "@/components/orbit-particles";
import { FloatingBubble, PortraitBubble } from "@/components/portrait-bubble";
import { ProjectDetails } from "@/components/project-details";
import { ProjectFilters } from "@/components/project-filters";
import { localizeProject, projects as sourceProjects } from "@/data/projects";
import { usePageVisible } from "@/hooks/use-page-visible";
import { useElementSize } from "@/hooks/use-element-size";
import { useOrbitExpansion } from "@/hooks/use-orbit-expansion";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { getProjectLayout } from "@/lib/orbit-layout";
import { filterProjects, type ProjectFilter } from "@/lib/project-filters";

export function ProjectOrbit() {
  const { language, t } = useLanguage();
  const allProjects = useMemo(
    () => sourceProjects.map((project) => localizeProject(project, language)),
    [language],
  );
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const projects = useMemo(() => filterProjects(allProjects, filter), [allProjects, filter]);
  const [exitHeight, setExitHeight] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [cvOpen, setCvOpen] = useState(false);
  const [detailsClosing, setDetailsClosing] = useState(false);
  const [origin, setOrigin] = useState<BubbleOrigin>({ x: 0, y: 0 });
  const pageVisible = usePageVisible();
  const ambientActive = pageVisible && ((selected === null && !cvOpen) || detailsClosing);
  useEffect(() => {
    document.documentElement.dataset.ambientPaused = String(!ambientActive);
    return () => {
      delete document.documentElement.dataset.ambientPaused;
    };
  }, [ambientActive]);
  const activeProject = allProjects.find((project) => project.id === selected);
  const central = useRef<HTMLDivElement>(null);
  const { ref: scene, width, height } = useElementSize<HTMLDivElement>();
  const viewportHeight = useViewportHeight();
  const reducedMotion = useReducedMotion();
  const layout = useMemo(
    () => getProjectLayout(width, viewportHeight, projects.length),
    [width, viewportHeight, projects.length],
  );
  const positions = layout.offsets;
  const particleDestinations = useMemo(() => {
    const byId = new Map(projects.map((project, index) => [project.id, positions[index]]));
    return allProjects.map((project) => ({ id: project.id, offset: byId.get(project.id) ?? null }));
  }, [allProjects, projects, positions]);
  const sceneHeight = Math.max(layout.height, exitHeight);
  const { open, expanded, closing, openProjects, closeProjects, finishClosing } = useOrbitExpansion(
    {
      center: central,
      sceneHeight,
      viewportHeight,
      reducedMotion,
      hasProjects: positions.length > 0,
    },
  );

  function close() {
    central.current?.querySelector("button")?.focus({ preventScroll: true });
    closeProjects();
    setSelected(null);
  }

  function changeFilter(next: ProjectFilter) {
    if (next === filter) return;
    const nextProjects = filterProjects(allProjects, next);
    const hasExits = projects.some((project) => !nextProjects.includes(project));
    setExitHeight(!reducedMotion && hasExits ? sceneHeight : 0);
    setFilter(next);
  }

  return (
    <div
      ref={scene}
      className="project-orbit"
      style={{ minHeight: expanded ? `max(100dvh, ${sceneHeight}px)` : "100dvh" }}
      data-open={expanded}
      data-closing={closing}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open && selected === null && !cvOpen) {
          event.preventDefault();
          close();
        }
      }}
    >
      <div className="portfolio-toolbar" role="group" aria-label={t.portfolioTools}>
        <button
          type="button"
          className="glass-control portfolio-toolbar__button"
          aria-label={t.showCv}
          title={t.showCv}
          aria-haspopup="dialog"
          aria-controls={cvOpen ? "cv-details" : undefined}
          aria-expanded={cvOpen}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            const rect = event.currentTarget.getBoundingClientRect();
            setOrigin({
              x: rect.left + rect.width / 2 - window.innerWidth / 2,
              y: rect.top + rect.height / 2 - window.innerHeight / 2,
            });
            setDetailsClosing(false);
            setCvOpen(true);
          }}
        >
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
            <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zm0 0v5h5M9 12h6M9 16h4" />
          </svg>
        </button>
        <a
          className="glass-control portfolio-toolbar__button"
          href="https://www.linkedin.com/in/andreaizzillo/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn (${t.newTab})`}
          title="LinkedIn"
        >
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
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a
          className="glass-control portfolio-toolbar__button"
          href="https://github.com/AndreaIzzillo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub (${t.newTab})`}
          title="GitHub"
        >
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
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
      </div>
      <OrbitParticles
        active={ambientActive}
        open={open}
        width={width}
        height={height}
        projectDestinations={particleDestinations}
      />
      <div ref={central} className="project-orbit__center">
        <PortraitBubble
          active={ambientActive}
          expanded={open}
          onClick={() => (open ? close() : openProjects())}
        />
      </div>
      <div id="project-bubbles" role="group" aria-label={t.projects} inert={!open}>
        <AnimatePresence
          onExitComplete={() => {
            setExitHeight(0);
            finishClosing();
          }}
        >
          {open &&
            projects.map((project, index) => {
              const position = positions[index];
              if (!position) return null;

              return (
                <m.div
                  key={project.id}
                  className="project-orbit__slot"
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.24, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
                  exit={{
                    opacity: 0,
                    ...(reducedMotion ? {} : { scale: 0.15, x: 0, y: 0 }),
                    transition: {
                      duration: reducedMotion ? 0 : 0.5,
                      delay: reducedMotion ? 0 : index * 0.035,
                      ease: [0.55, 0, 0.85, 0.4],
                    },
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.7,
                    delay: reducedMotion ? 0 : index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <FloatingBubble
                    active={ambientActive}
                    image={project.cover?.src ?? project.images[0].src}
                    imagePosition={project.cover?.position}
                    imageZoom={project.cover?.zoom}
                    imageZoomOrigin={project.cover?.zoomOrigin}
                    label={`${t.discover} ${project.title}`}
                    projectTitle={project.title}
                    project
                    index={index}
                    selected={selected === project.id}
                    controls={`project-${project.id}-details`}
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setOrigin({
                        x: rect.left + rect.width / 2 - window.innerWidth / 2,
                        y: rect.top + rect.height / 2 - window.innerHeight / 2,
                      });
                      setDetailsClosing(false);
                      setSelected(project.id);
                    }}
                  />
                </m.div>
              );
            })}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {open && !activeProject && !cvOpen && (
          <ProjectFilters value={filter} count={projects.length} onChange={changeFilter} />
        )}
      </AnimatePresence>
      {activeProject && (
        <ProjectDetails
          key={activeProject.id}
          project={activeProject}
          origin={origin}
          closing={detailsClosing}
          onRequestClose={() => setDetailsClosing(true)}
          onDismiss={() => setSelected(null)}
        />
      )}
      {cvOpen && (
        <CvDetails
          origin={origin}
          closing={detailsClosing}
          onRequestClose={() => setDetailsClosing(true)}
          onDismiss={() => setCvOpen(false)}
        />
      )}
    </div>
  );
}
