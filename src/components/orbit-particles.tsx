"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { animationSettings, canvasPixelRatio } from "@/lib/animation-settings";
import { createParticleSprite } from "@/lib/particle-sprite";
import { createOrbitParticles } from "@/lib/orbit-particle-model";
import type { ProjectOffset } from "@/lib/orbit-layout";

const COLORS = [
  "91, 174, 160",
  "110, 158, 206",
  "170, 141, 201",
  "200, 155, 126",
  "106, 178, 192",
] as const;
const TAU = Math.PI * 2;

export function OrbitParticles({
  open,
  active,
  width,
  height,
  projectOffsets,
}: {
  open: boolean;
  active: boolean;
  width: number;
  height: number;
  projectOffsets: readonly ProjectOffset[];
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const elapsed = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    if (!element || !width || !height || !active) return;
    const surface = element;
    const context = element.getContext("2d");
    if (!context) return;

    const ratio = canvasPixelRatio(width, height, window.devicePixelRatio);
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const portrait = element.parentElement?.querySelector<HTMLElement>(
      ".project-orbit__center .portrait-bubble",
    );
    const projectRadius = Math.min(116, width * 0.22, window.innerHeight * 0.22) / 2;
    const particles = createOrbitParticles(projectOffsets.length, width <= 640);
    const sprites = particles.map((particle) =>
      createParticleSprite(
        particle.radius,
        COLORS[particle.group % COLORS.length]!,
        particle.sparkle,
        ratio,
      ),
    );
    const targets = projectOffsets.map(() => ({ x: 0, y: 0, bend: 0, nx: 0, ny: 0 }));
    let canvasBounds = surface.getBoundingClientRect();
    let boundsDirty = false;
    const markBoundsDirty = () => {
      boundsDirty = true;
    };
    window.addEventListener("scroll", markBoundsDirty, { passive: true, capture: true });
    window.addEventListener("resize", markBoundsDirty, { passive: true });

    let frame = 0;
    let lastTime = 0;
    let visible = true;

    function draw(now: number) {
      if (!context) return;
      if (lastTime && now - lastTime < 1000 / animationSettings.particleFps - 1) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      elapsed.current += dt;
      const time = reducedMotion ? 0 : elapsed.current;
      const targetProgress = open ? 1 : 0;
      progress.current = reducedMotion
        ? targetProgress
        : progress.current + (targetProgress - progress.current) * (1 - Math.exp(-dt * 3.4));
      const p = progress.current;
      const burst = Math.sin(p * Math.PI);
      // Read the rendered circle, including float, magnetic pull and hover scale.
      // Convert viewport coordinates to canvas coordinates (also when scrolled).
      if (boundsDirty) {
        canvasBounds = surface.getBoundingClientRect();
        boundsDirty = false;
      }
      const portraitBounds = portrait?.getBoundingClientRect();
      const cx = portraitBounds
        ? portraitBounds.left + portraitBounds.width / 2 - canvasBounds.left
        : width / 2;
      const cy = portraitBounds
        ? portraitBounds.top + portraitBounds.height / 2 - canvasBounds.top
        : height / 2;
      const coreRadius = (portraitBounds?.width ?? 170) / 2;
      // Moving the source must not displace the destinations around the projects.
      projectOffsets.forEach((offset, group) => {
        const target = targets[group]!;
        target.x = width / 2 + offset.x - cx;
        target.y = height / 2 + offset.y - cy;
        const length = Math.max(1, Math.hypot(target.x, target.y));
        target.bend = (group % 2 ? -1 : 1) * Math.min(75, length * 0.24);
        target.nx = -target.y / length;
        target.ny = target.x / length;
      });
      context.clearRect(0, 0, width, height);

      // Hairline paths remain after the burst, with beads travelling along them.
      targets.forEach((target, group) => {
        const { bend, nx, ny } = target;
        context.beginPath();
        context.moveTo(cx, cy);
        context.quadraticCurveTo(
          cx + target.x * 0.5 + nx * bend,
          cy + target.y * 0.5 + ny * bend,
          cx + target.x,
          cy + target.y,
        );
        context.strokeStyle = `rgba(${COLORS[group % COLORS.length]}, ${p * 0.18})`;
        context.lineWidth = 0.8;
        context.stroke();
      });

      // A soft expanding pressure wave punctuates the opening without a flash.
      if (burst > 0.02 && !reducedMotion) {
        context.beginPath();
        context.arc(cx, cy, coreRadius + 12 + p * 105, 0, TAU);
        context.strokeStyle = `rgba(140, 188, 197, ${burst * 0.22})`;
        context.lineWidth = 1;
        context.stroke();
      }

      particles.forEach((particle, index) => {
        const target = targets[particle.group];
        if (!target) return;
        const angle = particle.phase + time * (0.12 + particle.seed * 0.09);
        const orbit =
          coreRadius + 13 + particle.seed * 34 + Math.sin(time * 0.7 + particle.phase) * 6;
        const startX = Math.cos(angle) * orbit;
        const startY = Math.sin(angle) * orbit * 0.86;
        let endX: number;
        let endY: number;

        if (particle.kind === "path") {
          const travel = (particle.seed + time * 0.075) % 1;
          const curve = 2 * travel * (1 - travel) * target.bend;
          endX = target.x * travel + target.nx * curve;
          endY = target.y * travel + target.ny * curve;
        } else {
          const halo =
            projectRadius +
            12 +
            particle.seed * 28 +
            Math.sin(time * (0.35 + particle.seed * 0.3) + particle.phase) * 6;
          endX = target.x + Math.cos(angle * 1.2) * halo;
          endY = target.y + Math.sin(angle * 1.2) * halo;
        }

        const swirl = burst * (22 + particle.seed * 55);
        const x = cx + startX * (1 - p) + endX * p + Math.cos(angle + p * 2) * swirl;
        const y = cy + startY * (1 - p) + endY * p + Math.sin(angle + p * 2) * swirl;
        const alpha = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(time * 1.4 + particle.phase));
        const color = COLORS[particle.group % COLORS.length] ?? COLORS[0];

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
        if (burst > 0.08 && !reducedMotion) {
          const point = particle.trail.length >= 5 ? particle.trail.shift()! : { x, y };
          point.x = x;
          point.y = y;
          particle.trail.push(point);
        } else if (particle.trail.length) {
          particle.trail.length = 0;
        }

        const sprite = sprites[index];
        if (sprite) {
          context.globalAlpha = alpha;
          context.drawImage(
            sprite.canvas,
            x - sprite.size / 2,
            y - sprite.size / 2,
            sprite.size,
            sprite.size,
          );
          context.globalAlpha = 1;
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
      window.removeEventListener("scroll", markBoundsDirty, true);
      window.removeEventListener("resize", markBoundsDirty);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [open, active, width, height, reducedMotion, projectOffsets]);

  return <canvas ref={canvas} className="orbit-particles" aria-hidden="true" />;
}
