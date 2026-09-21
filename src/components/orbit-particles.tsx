"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { getProjectOffsets } from "@/lib/orbit-layout";
import { mapNonEmpty } from "@/lib/arrays";

const colors = [
  "91, 174, 160",
  "110, 158, 206",
  "170, 141, 201",
  "200, 155, 126",
  "106, 178, 192",
] as const;
const tau = Math.PI * 2;

// Stable seeds keep the constellation continuous through open/close and resize.
function noise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function OrbitParticles({
  open,
  width,
  height,
}: {
  open: boolean;
  width: number;
  height: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    if (!element || !width || !height) return;
    const surface = element;
    const context = element.getContext("2d");
    if (!context) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const projectOffsets = getProjectOffsets(width, height);
    const portrait = element.parentElement?.querySelector<HTMLElement>(
      ".project-orbit__center .portrait-bubble",
    );
    const projectRadius = Math.min(116, width * 0.22, window.innerHeight * 0.22) / 2;
    const count = width <= 640 ? 125 : 225;
    const particles = Array.from({ length: count }, (_, index) => ({
      group: index % 5,
      seed: noise(index + 1),
      phase: noise(index + 101) * tau,
      radius: 0.8 + noise(index + 201) * 1.8,
      trail: [] as { x: number; y: number }[],
    }));

    let frame = 0;
    let lastTime = 0;
    let visible = true;

    function draw(now: number) {
      if (!context) return;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      const time = reducedMotion ? 0 : now / 1000;
      const targetProgress = open ? 1 : 0;
      progress.current = reducedMotion
        ? targetProgress
        : progress.current + (targetProgress - progress.current) * (1 - Math.exp(-dt * 3.4));
      const p = progress.current;
      const burst = Math.sin(p * Math.PI);
      // Read the rendered circle, including float, magnetic pull and hover scale.
      // Convert viewport coordinates to canvas coordinates (also when scrolled).
      const canvasBounds = surface.getBoundingClientRect();
      const portraitBounds = portrait?.getBoundingClientRect();
      const cx = portraitBounds
        ? portraitBounds.left + portraitBounds.width / 2 - canvasBounds.left
        : width / 2;
      const cy = portraitBounds
        ? portraitBounds.top + portraitBounds.height / 2 - canvasBounds.top
        : height / 2;
      const coreRadius = (portraitBounds?.width ?? 170) / 2;
      // Moving the source must not displace the destinations around the projects.
      const targets = mapNonEmpty(projectOffsets, (offset) => ({
        x: width / 2 + offset.x - cx,
        y: height / 2 + offset.y - cy,
      }));
      context.clearRect(0, 0, width, height);

      // Hairline paths remain after the burst, with beads travelling along them.
      targets.forEach((target, group) => {
        const length = Math.hypot(target.x, target.y);
        const bend = (group % 2 ? -1 : 1) * Math.min(75, length * 0.24);
        const nx = -target.y / length;
        const ny = target.x / length;
        context.beginPath();
        context.moveTo(cx, cy);
        context.quadraticCurveTo(
          cx + target.x * 0.5 + nx * bend,
          cy + target.y * 0.5 + ny * bend,
          cx + target.x,
          cy + target.y,
        );
        context.strokeStyle = `rgba(${colors[group]}, ${p * 0.18})`;
        context.lineWidth = 0.8;
        context.stroke();
      });

      // A soft expanding pressure wave punctuates the opening without a flash.
      if (burst > 0.02 && !reducedMotion) {
        context.beginPath();
        context.arc(cx, cy, coreRadius + 12 + p * 105, 0, tau);
        context.strokeStyle = `rgba(140, 188, 197, ${burst * 0.22})`;
        context.lineWidth = 1;
        context.stroke();
      }

      particles.forEach((particle, index) => {
        const target = targets[particle.group % targets.length] ?? targets[0];
        const angle = particle.phase + time * (0.12 + particle.seed * 0.09);
        const orbit =
          coreRadius + 13 + particle.seed * 34 + Math.sin(time * 0.7 + particle.phase) * 6;
        const startX = Math.cos(angle) * orbit;
        const startY = Math.sin(angle) * orbit * 0.86;
        let endX: number;
        let endY: number;

        if (index % 3 === 0) {
          const travel = (particle.seed + time * 0.075) % 1;
          const length = Math.hypot(target.x, target.y);
          const bend = (particle.group % 2 ? -1 : 1) * Math.min(75, length * 0.24);
          const curve = 2 * travel * (1 - travel) * bend;
          endX = target.x * travel - (target.y / length) * curve;
          endY = target.y * travel + (target.x / length) * curve;
        } else {
          const halo = projectRadius + 10 + particle.seed * 20;
          endX = target.x + Math.cos(angle * 1.2) * halo;
          endY = target.y + Math.sin(angle * 1.2) * halo;
        }

        const swirl = burst * (22 + particle.seed * 55);
        const x = cx + startX * (1 - p) + endX * p + Math.cos(angle + p * 2) * swirl;
        const y = cy + startY * (1 - p) + endY * p + Math.sin(angle + p * 2) * swirl;
        const alpha = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(time * 1.4 + particle.phase));
        const color = colors[particle.group % colors.length] ?? colors[0];

        // Short trails only during the explosion or reabsorption; no full-screen blur.
        if (burst > 0.08 && particle.trail.length > 1 && !reducedMotion) {
          const [trailStart] = particle.trail;
          if (!trailStart) return;

          context.beginPath();
          context.moveTo(trailStart.x, trailStart.y);
          particle.trail.forEach((point) => context.lineTo(point.x, point.y));
          context.lineTo(x, y);
          context.strokeStyle = `rgba(${color}, ${alpha * burst * 0.4})`;
          context.lineWidth = particle.radius * 0.65;
          context.stroke();
        }
        particle.trail.push({ x, y });
        if (particle.trail.length > 5) particle.trail.shift();

        const glow = context.createRadialGradient(x, y, 0, x, y, particle.radius * 4);
        glow.addColorStop(0, `rgba(${color}, ${alpha * 0.32})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        context.fillStyle = glow;
        context.fillRect(
          x - particle.radius * 4,
          y - particle.radius * 4,
          particle.radius * 8,
          particle.radius * 8,
        );
        context.beginPath();
        context.arc(x, y, particle.radius, 0, tau);
        context.fillStyle = `rgba(${color}, ${alpha})`;
        context.fill();

        if (index % 13 === 0) {
          context.beginPath();
          context.moveTo(x - 4, y);
          context.lineTo(x + 4, y);
          context.moveTo(x, y - 4);
          context.lineTo(x, y + 4);
          context.strokeStyle = `rgba(${color}, ${alpha * 0.55})`;
          context.lineWidth = 0.6;
          context.stroke();
        }
      });

      if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function resume() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(draw);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;

      visible = entry.isIntersecting;
      resume();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", resume);
    resume();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
    };
  }, [open, width, height, reducedMotion]);

  return <canvas ref={canvas} className="orbit-particles" aria-hidden="true" />;
}
