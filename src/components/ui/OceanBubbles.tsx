'use client';

import { useEffect, useRef } from 'react';

/**
 * OceanBubbles — a lightweight, pure-Canvas decorative bubble field that sits
 * behind the content of an "upper ocean" themed section.
 *
 * Design goals (V35):
 *  - 15–35 bubbles rising slowly from the bottom, randomly re-spawning once
 *    they leave the top.
 *  - Radius 4–28px, alpha 0.08–0.35, colours sampled from a light cyan / white
 *    / aqua palette to mimic underwater refraction.
 *  - Rise speed 0.3–1.2 px/frame (sampled at ~30fps cap) with a gentle ±8px
 *    sine sway for life.
 *  - A faint highlight dot at the upper-right of each bubble for a glassy look.
 *  - DPR-scaled rendering, requestAnimationFrame driven, full cleanup on
 *    unmount, and disabled under prefers-reduced-motion.
 *
 * Props:
 *  - className: extra classes (positioning / z-index) for the canvas.
 *  - reduced:   force-disable the animation (e.g. when a parent already knows
 *               the user prefers reduced motion).
 */

interface Bubble {
  x: number;
  y: number;
  r: number;
  alpha: number;
  vy: number; // px per animation frame
  swayPhase: number;
  swaySpeed: number;
  color: string;
}

// Light cyan / white / aqua palette — subtle underwater refraction tones.
const PALETTE = ['#7dd3fc', '#a5f3fc', '#e0f2fe', '#bae6fd', '#67e8f9', '#cffafe'];

const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface OceanBubblesProps {
  className?: string;
  reduced?: boolean;
}

export default function OceanBubbles({ className = '', reduced = false }: OceanBubblesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let bubbles: Bubble[] = [];
    let raf = 0;
    let last = 0;

    // Cap the frame rate at ~30fps — bubbles are a slow, ambient decoration.
    const targetFps = 30;
    const frameInterval = 1000 / targetFps;

    const makeBubble = (initial: boolean): Bubble => {
      const r = rand(4, 28);
      return {
        x: rand(0, width),
        // On first paint distribute across the whole column; on respawn start
        // just below the bottom edge with a little jitter.
        y: initial ? rand(0, height) : height + r + rand(0, 60),
        r,
        alpha: rand(0.08, 0.35),
        vy: rand(0.3, 1.2),
        swayPhase: rand(0, Math.PI * 2),
        swaySpeed: rand(0.004, 0.012),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      };
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.round(rand(15, 35));
      bubbles = Array.from({ length: target }, () => makeBubble(true));
    };

    const drawBubble = (b: Bubble, t: number) => {
      const sway = Math.sin(b.swayPhase + t * b.swaySpeed) * 8; // ±8px
      const cx = b.x + sway;
      const cy = b.y;

      // Body
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = b.alpha;
      ctx.fill();

      // Thin glassy rim
      ctx.globalAlpha = b.alpha * 0.55;
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Highlight dot — upper-right at ~30% offset, radius 20% of bubble.
      ctx.globalAlpha = Math.min(1, b.alpha * 1.4);
      ctx.beginPath();
      ctx.arc(cx + b.r * 0.3, cy - b.r * 0.3, Math.max(0.5, b.r * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.globalAlpha = 1;
    };

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < frameInterval) return;
      last = ts;

      ctx.clearRect(0, 0, width, height);
      for (const b of bubbles) {
        b.y -= b.vy; // rise
        if (b.y + b.r < 0) {
          // Reached the surface — respawn at the bottom.
          Object.assign(b, makeBubble(false));
        }
        drawBubble(b, ts);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${className}`}
    />
  );
}
