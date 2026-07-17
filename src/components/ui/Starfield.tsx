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
 * depth layers and gently twinkle (sine) and drift. The animation is capped at
 * ~30fps to stay cheap on low-end devices, and when reduced-motion is requested
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

    // Brightened base alphas so stars read clearly against the ink background.
    const layerAlpha = [0.55, 0.82, 1];
    const layerRadius = [0.7, 1.2, 2.0];
    const layerDrift = [0.15, 0.35, 0.6];

    const stars: Star[] = [];
    const count = Math.max(
      20,
      Math.min(starCount, Math.floor((width * height) / 4000)),
    );
    for (let i = 0; i < count; i += 1) {
      const layer = depth ? Math.floor(Math.random() * 3) : 1;
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: layerRadius[layer] * (0.7 + Math.random() * 0.6),
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
    }

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const driftX = isReduced ? 0 : s.drift * Math.sin(t * 0.0002 + s.phase) * 0.5;
        const px = (s.x + driftX) * width;
        const py = s.y * height;
        const tw = twinkle && !isReduced ? 0.55 + 0.45 * Math.sin(t * 0.001 * speed + s.phase) : 1;
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * tw));
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 246, 250, ${alpha})`;
        ctx.fill();
        // Soft glow halo for near stars only (brighter so the sky feels alive).
        if (s.layer === 2) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 224, 208, ${alpha * 0.28})`;
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
