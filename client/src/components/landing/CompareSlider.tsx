"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  before: React.ReactNode;
  after: React.ReactNode;
  initial?: number; // 0–100
  className?: string;
}

/**
 * Before/after compare slider:
 * - Desktop (hover capable): the divider follows the pointer; on leave it snaps
 *   back to centre.
 * - Touch / coarse pointer: drag the handle.
 * - Plays a brief auto-animation on first reveal so viewers notice it's interactive.
 */
export function CompareSlider({ before, after, initial = 50, className }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [percent, setPercent] = React.useState(initial);
  const [hoverCapable, setHoverCapable] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const setFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.max(0, Math.min(100, p)));
  }, []);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => setFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, setFromClientX]);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 700));
      if (cancelled) return;
      const seq = [72, 28, 50];
      for (const target of seq) {
        await new Promise((r) => setTimeout(r, 650));
        if (cancelled) return;
        setPercent(target);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hoverCapable) return;
    setFromClientX(e.clientX);
  };
  const handleMouseLeave = () => {
    if (!hoverCapable) return;
    setPercent(50);
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    if (hoverCapable && e.pointerType === "mouse") return;
    setDragging(true);
    setFromClientX(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      className={cn(
        "relative w-full select-none overflow-hidden rounded-2xl border border-[#E5E5E5] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] shadow-2xl",
        hoverCapable ? "cursor-ew-resize" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* AFTER layer (base) — defines container height */}
      <div className="relative w-full">{after}</div>

      {/* BEFORE layer clipped to the left of the divider */}
      <motion.div
        className="absolute inset-0 w-full"
        style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        animate={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.6 }}
      >
        {before}
      </motion.div>

      {/* Divider line + handle */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 z-20"
        style={{ left: `${percent}%` }}
        animate={{ left: `${percent}%` }}
        transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.6 }}
      >
        <div className="relative h-full">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#16A34A] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] dark:border-[#2D2D2D] bg-white dark:bg-[#0f0f0f] shadow-xl ring-1 ring-[#16A34A]/30">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#080808] dark:text-white"
              >
                <path d="M8 6 L2 12 L8 18" />
                <path d="M16 6 L22 12 L16 18" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
