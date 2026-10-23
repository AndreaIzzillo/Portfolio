"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export type BubbleOrigin = { x: number; y: number };

export function BubbleDialog({
  id,
  labelledBy,
  describedBy,
  className = "",
  origin,
  closing,
  onRequestClose,
  onDismiss,
  onEntered,
  children,
}: {
  id: string;
  labelledBy: string;
  describedBy?: string;
  className?: string;
  origin: BubbleOrigin;
  closing: boolean;
  onRequestClose: () => void;
  onDismiss: () => void;
  onEntered?: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
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

  // A complete transform can run natively, without rebuilding x/y/scale in JS each frame.
  const expanded = { opacity: 1, transform: "translate3d(0px, 0px, 0px) scale(1)" };
  const collapsed = {
    opacity: 0,
    transform: reduceMotion
      ? expanded.transform
      : `translate3d(${origin.x}px, ${origin.y}px, 0px) scale(0.12)`,
  };

  return (
    <dialog
      id={id}
      ref={dialog}
      className="project-detail-dialog"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      data-closing={closing}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
    >
      <m.article
        className={`project-detail ${className}`.trim()}
        initial={collapsed}
        animate={closing ? collapsed : expanded}
        transition={{
          duration: reduceMotion ? 0 : closing ? 0.35 : 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={() => {
          if (closing) onDismiss();
          else onEntered?.();
        }}
        inert={closing}
      >
        {children}
      </m.article>
    </dialog>
  );
}
