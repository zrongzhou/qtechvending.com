'use client';

import { useEffect, useRef } from 'react';

export interface StarfieldProps {
  /** Extra classes for the wrapping container. */
  className?: string;
  /** Target star count (density-aware: reduced on small/low-DPR screens). */
  starCount?: number;
  /** Twinkle / drift speed multiplier. */
  speed?: number;
  /** Enable 3-layer parallax depth (far/mid/near). */
  depth?: boolean;
  /** Enable sine twinkle on star opacity. */
  twinkle?: boolean;
  /** External reduced-motion override; when omitted, read from matchMedia. */
  reduced?: boolean;
}

interface Star {
  x: number; // 0..1
  y: number; // 0..1
  r: number;
  layer: number; // 0 far, 1 mid, 2 near
  baseAlpha: number;
  phase: number;
  drift: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Night-sky starfield rendered on a <canvas>. Stars are distributed across three
 * depth layers and gently twinkle (sine) and drift. The near layer gets a bright
 * white core + cyan halo so the sky feels alive and obviously animated. A faint
 * indigo nebula gradient sits behind the stars for depth. The animation is capped
 * at ~30fps to stay cheap on low-end devices, and when reduced-motion is requested
 * a single static frame is drawn (no rAF loop).
 */
export default function Starfield({
  className = '',
  starCount = 100,
  speed = 0.3,
  depth = true,
  twinkle = true,
  reduced,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isReduced = reduced ?? prefersReducedMotion();

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Aggressive, clearly visible brightness so stars read against the ink sky.
    const layerAlpha = [0.5, 0.85, 1];
    // Big near stars (layer 2 radius ~7px) so they are obviously not dust specks.
    const layerRadius = [2.5, 4.5, 7];
    // Stronger drift so movement is perceptible.
    const layerDrift = [0.25, 0.5, 0.8];

    // Cached nebula gradient (recomputed on resize).
    let nebula: CanvasGradient | null = null;
    function buildNebula() {
      if (!ctx) return;
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        0,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.8,
      );
      // Center transparent → edge faint indigo bloom (galaxy-band ambience).
      g.addColorStop(0, 'rgba(99, 102, 241, 0)');
      g.addColorStop(0.55, 'rgba(99, 102, 241, 0.015)');
      g.addColorStop(1, 'rgba(99, 102, 241, 0.04)');
      nebula = g;
    }

    const stars: Star[] = [];
    const count = Math.max(
      20,
      Math.min(starCount, Math.floor((width * height) / 2500)),
    );
    for (let i = 0; i < count; i += 1) {
      const layer = depth ? Math.floor(Math.random() * 3) : 1;
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: layerRadius[layer] * (0.75 + Math.random() * 0.7),
        layer,
        baseAlpha: layerAlpha[layer],
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * layerDrift[layer],
      });
    }

    function resize() {
      if (!wrap || !canvas || !ctx) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNebula();
    }

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Faint indigo nebula backdrop.
      if (nebula) {
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, width, height);
      }

      for (const s of stars) {
        const driftX = isReduced ? 0 : s.drift * Math.sin(t * 0.0002 + s.phase) * 0.5;
        const px = (s.x + driftX) * width;
        const py = s.y * height;
        // Aggressive twinkle: fade from near-black to full brightness (amp 0.65).
        const tw = twinkle && !isReduced ? 0.35 + 0.65 * Math.sin(t * 0.001 * speed + s.phase) : 1;
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * tw));

        // Base cyan star.
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 246, 250, ${alpha})`;
        ctx.fill();

        // Near stars get a bright white core + a large soft cyan halo so the
        // brighter stars "sparkle" (white core) surrounded by a colored glow.
        if (s.layer === 2) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 224, 208, ${alpha * 0.3})`;
          ctx.fill();
        }
      }
    }

    resize();
    let raf = 0;
    let last = 0;
    const FRAME = 1000 / 30; // 30fps cap
    function loop(t: number) {
      if (t - last >= FRAME) {
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    }

    if (isReduced) {
      draw(0); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [starCount, speed, depth, twinkle, reduced]);

  return (
    <div ref={wrapRef} className={`starfield ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
