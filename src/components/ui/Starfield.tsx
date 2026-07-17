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
  twSpeed: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Night-sky starfield rendered on a <canvas>.
 *
 * V33 — modelled on a *real* night sky rather than decorative bubbles:
 *  - 80% of stars are tiny pin-points (radius 0.4–1.2px) creating the "dust"
 *    of the Milky Way; 15% are small visible points; only ~5% are "bright"
 *    near-layer stars with a faint warm-white core + soft blue/gold halo.
 *  - Stars are WHITE / very faint warm-white (never cyan) so the sky reads as
 *    stars, not underwater bubbles.
 *  - A very faint diagonal Milky-Way band and a barely-there nebula sit behind
 *    the field for depth.
 *  - Twinkle is clearly visible (amplitude ~0.55) and each layer drifts at its
 *    own speed. Capped at ~30fps; a single static frame is drawn under
 *    reduced-motion.
 */
export default function Starfield({
  className = '',
  starCount = 520,
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

    // Most stars are dim; only the rare near-layer stars are bright.
    const layerAlpha = [0.25, 0.55, 0.95];
    // Tiny pin-points (far/mid) with only a modest bright star (near).
    const layerRadius = [0.6, 1.4, 3];
    // Gentle drift, scaled by depth.
    const layerDrift = [0.15, 0.35, 0.6];
    // Per-layer twinkle cadence so the sky shimmers unevenly.
    const layerTw = [0.7, 1.0, 1.5];

    // Cached nebula gradient (recomputed on resize) — MUCH more subtle than V32.
    let nebula: CanvasGradient | null = null;
    function buildNebula() {
      if (!ctx) return;
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        0,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.85,
      );
      g.addColorStop(0, 'rgba(99, 102, 241, 0)');
      g.addColorStop(0.6, 'rgba(99, 102, 241, 0.008)');
      g.addColorStop(1, 'rgba(99, 102, 241, 0.022)');
      nebula = g;
    }

    // Faint diagonal Milky-Way band — a soft white/blue strip across the
    // centre, NOT a radial blob.
    function drawMilkyWay() {
      if (!ctx) return;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      const bandW = Math.max(width, height) * 0.55;
      const g = ctx.createLinearGradient(-bandW / 2, 0, bandW / 2, 0);
      g.addColorStop(0, 'rgba(255, 255, 255, 0)');
      g.addColorStop(0.5, 'rgba(180, 200, 255, 0.05)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-bandW / 2, -height * 0.17, bandW, height * 0.34);
      ctx.restore();
    }

    const stars: Star[] = [];
    const count = Math.max(
      40,
      Math.min(starCount, Math.floor((width * height) / 1800)),
    );
    for (let i = 0; i < count; i += 1) {
      // Weight the distribution: ~80% far dust, ~15% mid, ~5% bright near.
      const rnd = Math.random();
      const layer = depth ? (rnd < 0.8 ? 0 : rnd < 0.95 ? 1 : 2) : 1;
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: layerRadius[layer] * (0.7 + Math.random() * 0.5),
        layer,
        baseAlpha: layerAlpha[layer],
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * layerDrift[layer],
        twSpeed: layerTw[layer],
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

      // Very faint nebula backdrop.
      if (nebula) {
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, width, height);
      }
      // Faint Milky-Way band.
      drawMilkyWay();

      for (const s of stars) {
        const driftX = isReduced ? 0 : s.drift * Math.sin(t * 0.0002 + s.phase) * 0.5;
        const px = (s.x + driftX) * width;
        const py = s.y * height;
        // Visible twinkle: amplitude ~0.55, per-layer speed.
        const tw =
          twinkle && !isReduced
            ? 0.35 + 0.55 * Math.sin(t * 0.001 * speed * s.twSpeed + s.phase)
            : 1;
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * tw));

        // Stars are white / faint warm-white — never cyan.
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Bright near-layer stars: warm-white core + a tiny soft blue/gold halo.
        if (s.layer === 2) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 210, 255, ${alpha * 0.12})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, s.r * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 235, ${alpha * 0.9})`;
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
