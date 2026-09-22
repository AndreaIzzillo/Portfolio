"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { OrbitParticles } from "@/components/orbit-particles";
import { FloatingBubble, PortraitBubble } from "@/components/portrait-bubble";
import { ProjectDetails, type BubbleOrigin } from "@/components/project-details";
import { localizeProject, projects as sourceProjects } from "@/data/projects";
import { useElementSize } from "@/hooks/use-element-size";
import { getProjectOffsets } from "@/lib/orbit-layout";

export function ProjectOrbit() {
  const { language, t } = useLanguage();
  const projects = useMemo(
    () => sourceProjects.map((project) => localizeProject(project, language)),
    [language],
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [origin, setOrigin] = useState<BubbleOrigin>({ x: 0, y: 0 });
  const activeProject = projects.find((project) => project.id === selected);
  const central = useRef<HTMLDivElement>(null);
  const { ref: scene, width, height } = useElementSize<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const positions = getProjectOffsets(width, height);

  function close() {
    central.current?.querySelector("button")?.focus({ preventScroll: true });
    setOpen(false);
    setSelected(null);
  }

  return (
    <div
      ref={scene}
      className="project-orbit"
      data-open={open}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open && selected === null) {
          event.preventDefault();
          close();
        }
      }}
    >
      <OrbitParticles open={open} width={width} height={height} />
      <div ref={central} className="project-orbit__center">
        <PortraitBubble expanded={open} onClick={() => (open ? close() : setOpen(true))} />
      </div>
      <div id="project-bubbles" role="group" aria-label={t.projects} inert={!open}>
        <AnimatePresence>
          {open &&
            projects.map((project, index) => {
              const position = positions[index] ?? positions[0];

              return (
                <motion.div
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
                    image={project.cover?.src ?? project.images[0].src}
                    imagePosition={project.cover?.position}
                    imageZoom={project.cover?.zoom}
                    label={`${t.discover} ${project.title}`}
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
                      setSelected(project.id);
                    }}
                  />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
      {activeProject && (
        <ProjectDetails
          key={activeProject.id}
          project={activeProject}
          origin={origin}
          onDismiss={() => setSelected(null)}
        />
      )}
    </div>
  );
}
