"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { animationSettings, canvasPixelRatio } from "@/lib/animation-settings";
import { createParticleSprite } from "@/lib/particle-sprite";
import { createOrbitParticles } from "@/lib/orbit-particle-model";
import {
  advanceParticleTransitions,
  reconcileParticleTransitions,
  type ParticleDestination,
} from "@/lib/orbit-particle-transitions";

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
  projectDestinations,
}: {
  open: boolean;
  active: boolean;
  width: number;
  height: number;
  projectDestinations: readonly ParticleDestination[];
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const elapsed = useRef(0);
  const transitions = useRef<ReturnType<typeof reconcileParticleTransitions>>([]);
  const resources = useRef<{
    projectCount: number;
    mobile: boolean;
    ratio: number;
    particles: ReturnType<typeof createOrbitParticles>;
    sprites: ReturnType<typeof createParticleSprite>[];
  } | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    if (!element || !width || !height || !active) return;
    const surface = element;
    const context = element.getContext("2d");
    if (!context) return;

    const ratio = canvasPixelRatio(width, height, window.devicePixelRatio);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (element.width !== pixelWidth) element.width = pixelWidth;
    if (element.height !== pixelHeight) element.height = pixelHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const portrait = element.parentElement?.querySelector<HTMLElement>(
      ".project-orbit__center .portrait-bubble",
    );
    const projectRadius = Math.min(116, width * 0.22, window.innerHeight * 0.22) / 2;
    const mobile = width <= 640;
    // A modal only pauses drawing; keep the textures and simulation ready for resuming.
    if (
      !resources.current ||
      resources.current.projectCount !== projectDestinations.length ||
      resources.current.mobile !== mobile ||
      resources.current.ratio !== ratio
    ) {
      const particles = createOrbitParticles(projectDestinations.length, mobile);
      resources.current = {
        projectCount: projectDestinations.length,
        mobile,
        ratio,
        particles,
        sprites: particles.map((particle) =>
          createParticleSprite(
            particle.radius,
            COLORS[particle.group % COLORS.length]!,
            particle.sparkle,
            ratio,
          ),
        ),
      };
    }
    const { particles, sprites } = resources.current;
    transitions.current = reconcileParticleTransitions(transitions.current, projectDestinations);
    const destinations = transitions.current;
    const targets = destinations.map(() => ({ x: 0, y: 0, bend: 0, nx: 0, ny: 0, opacity: 0 }));
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
      advanceParticleTransitions(destinations, dt, Boolean(reducedMotion));
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
      destinations.forEach((offset, group) => {
        const target = targets[group]!;
        target.x = width / 2 + offset.x - cx;
        target.y = height / 2 + offset.y - cy;
        target.opacity = offset.opacity;
        const length = Math.max(1, Math.hypot(target.x, target.y));
        target.bend = (group % 2 ? -1 : 1) * Math.min(75, length * 0.24);
        target.nx = -target.y / length;
        target.ny = target.x / length;
      });
      context.clearRect(0, 0, width, height);

      // Hairline paths remain after the burst, with beads travelling along them.
      targets.forEach((target, group) => {
        const { bend, nx, ny, opacity } = target;
        if (opacity === 0) return;
        context.beginPath();
        context.moveTo(cx, cy);
        context.quadraticCurveTo(
          cx + (target.x * 0.5 + nx * bend) * opacity,
          cy + (target.y * 0.5 + ny * bend) * opacity,
          cx + target.x * opacity,
          cy + target.y * opacity,
        );
        context.strokeStyle = `rgba(${COLORS[group % COLORS.length]}, ${p * opacity * 0.18})`;
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
        const visibility = 1 - p + p * target.opacity;
        if (visibility < 0.001) return;
        const particleProgress = p * target.opacity;
        const particleBurst = Math.sin(particleProgress * Math.PI);
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

        const swirl = particleBurst * (22 + particle.seed * 55);
        const x =
          cx +
          startX * (1 - particleProgress) +
          endX * particleProgress +
          Math.cos(angle + particleProgress * 2) * swirl;
        const y =
          cy +
          startY * (1 - particleProgress) +
          endY * particleProgress +
          Math.sin(angle + particleProgress * 2) * swirl;
        const alpha =
          (0.35 + 0.4 * (0.5 + 0.5 * Math.sin(time * 1.4 + particle.phase))) * visibility;
        const color = COLORS[particle.group % COLORS.length] ?? COLORS[0];

        // Short trails only during the explosion or reabsorption; no full-screen blur.
        if (particleBurst > 0.08 && particle.trail.length > 1 && !reducedMotion) {
          const [trailStart] = particle.trail;
          if (!trailStart) return;

          context.beginPath();
          context.moveTo(trailStart.x, trailStart.y);
          particle.trail.forEach((point) => context.lineTo(point.x, point.y));
          context.lineTo(x, y);
          context.strokeStyle = `rgba(${color}, ${alpha * particleBurst * 0.4})`;
          context.lineWidth = particle.radius * 0.65;
          context.stroke();
        }
        if (particleBurst > 0.08 && !reducedMotion) {
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
  }, [open, active, width, height, reducedMotion, projectDestinations]);

  return <canvas ref={canvas} className="orbit-particles" aria-hidden="true" />;
}
