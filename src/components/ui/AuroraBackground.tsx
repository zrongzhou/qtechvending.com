'use client';

import { useEffect, useRef, useState } from 'react';

export interface AuroraBackgroundProps {
  /** Extra classes for the wrapping container. */
  className?: string;
  /** Gradient stop colors [cyan, purple, pink, green] — used to seed a palette. */
  colors?: string[];
  /** External reduced-motion override; when omitted, read from matchMedia. */
  reduced?: boolean;
}

interface Ribbon {
  x: number; // horizontal center (0..1)
  width: number; // ribbon width (0.08–0.18 of canvas width)
  height: number; // ribbon height (0.4–0.65 of canvas height)
  baseY: number; // bottom anchor (0.5–0.85 of canvas height)
  phase: number; // animation offset
  speed: number; // sway speed (0.0003–0.001)
  sway: number; // sway amplitude in fraction of width (0.03–0.06)
  colorSet: string[]; // [bottom, mid, top]
  baseBrightness: number; // 0.3–0.7
  pulseSpeed: number; // brightness oscillation speed
  rayCount: number; // 8–16 vertical rays
}

interface Particle {
  x: number; // 0..1
  y: number; // 0..1
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Convert a #rrggbb hex string to an rgba() string with the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const PALETTES: string[][] = [
  ['#34d399', '#22d3ee', '#a78bfa'], // green → cyan → purple
  ['#f472b6', '#a855f7', '#6366f1'], // pink → purple → indigo
  ['#22d3ee', '#34d399', '#84cc16'], // cyan → green → lime
  ['#22d3ee', '#a855f7', '#f472b6', '#fbbf24'], // full spectrum
];

/**
 * Aurora (northern-lights) background rendered on a <canvas>.
 *
 * V34 — real dancing light. Instead of the previous SVG + heavy-blur "curtains"
 * (which washed out to invisibility), this draws organic bezier ribbons of
 * light that:
 *  - Rise tall from the lower sky (40–65% of the band height)
 *  - Carry vertical RAY striations (thin beams within each ribbon)
 *  - SLOWLY sway side-to-side like curtains in a breeze
 *  - PULSE in brightness over seconds
 *  - SHIFT colour along their length (green → cyan → purple etc.)
 *  - Glow and bleed into the surrounding dark via additive ('lighter') blending
 * Plus a few ambient drifting particles for atmosphere.
 *
 * 25fps cap (aurora doesn't need more). Under reduced-motion a single static
 * frame is drawn. Props interface is unchanged so CtaSection needs no edits.
 */
export default function AuroraBackground({
  className = '',
  colors,
  reduced,
}: AuroraBackgroundProps) {
  const [isReduced, setIsReduced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Incorporate any caller-provided colors as an extra palette so the prop stays
  // meaningful (used as the first ribbon's colour set when supplied).
  const palettes = colors && colors.length >= 3 ? [colors, ...PALETTES] : PALETTES;

  useEffect(() => {
    if (reduced !== undefined) {
      setIsReduced(reduced);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = reduced ?? prefersReducedMotion();

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Build the ribbon field (normalized coords — resize-safe).
    const ribbonCount = 5 + Math.floor(Math.random() * 3); // 5–7
    const ribbons: Ribbon[] = [];
    for (let i = 0; i < ribbonCount; i += 1) {
      const colorSet = palettes[Math.floor(Math.random() * palettes.length)];
      ribbons.push({
        // Spread across the width, weighted toward the centre so the light
        // fills 60–70% of the CTA area's central-upper portion.
        x: 0.18 + (i / Math.max(1, ribbonCount - 1)) * 0.64 + (Math.random() - 0.5) * 0.06,
        width: 0.08 + Math.random() * 0.1, // 0.08–0.18
        height: 0.4 + Math.random() * 0.25, // 0.4–0.65
        baseY: 0.5 + Math.random() * 0.35, // 0.5–0.85
        phase: Math.random() * Math.PI * 2,
        speed: 0.0003 + Math.random() * 0.0007, // 0.0003–0.001
        sway: 0.03 + Math.random() * 0.03, // 0.03–0.06
        colorSet,
        baseBrightness: 0.3 + Math.random() * 0.4, // 0.3–0.7
        pulseSpeed: 0.0004 + Math.random() * 0.0006,
        rayCount: 8 + Math.floor(Math.random() * 9), // 8–16
      });
    }

    // Ambient drifting particles.
    const particles: Particle[] = [];
    const particleCount = 15 + Math.floor(Math.random() * 6); // 15–20
    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: Math.random(),
        y: Math.random() * 0.75,
        vx: (Math.random() - 0.5) * 0.00006,
        vy: -0.00003 - Math.random() * 0.00005,
        alpha: 0.1 + Math.random() * 0.2, // 0.1–0.3
        size: 0.6 + Math.random() * 0.8,
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

    function drawRibbon(r: Ribbon, time: number) {
      if (!ctx) return;
      const swayX = Math.sin(time * r.speed + r.phase) * r.sway * width;
      const cx = r.x * width + swayX;
      const topY = (r.baseY - r.height) * height;
      const botY = r.baseY * height;
      const halfBottom = r.width * width * 0.5;
      const halfTop = r.width * width * 0.3; // narrower at the top

      // Organic side waves for a curtain-like silhouette.
      const waveL = Math.sin(time * 0.0006 + r.phase) * r.width * width * 0.14;
      const waveR = Math.sin(time * 0.0007 + r.phase + 1.3) * r.width * width * 0.14;
      const waveTL = Math.sin(time * 0.0005 + r.phase + 2.1) * r.width * width * 0.12;
      const waveTR = Math.sin(time * 0.00055 + r.phase + 3.4) * r.width * width * 0.12;

      const blx = cx - halfBottom + waveL;
      const brx = cx + halfBottom + waveR;
      const tlx = cx - halfTop + waveTL;
      const trx = cx + halfTop + waveTR;

      const brightness = Math.max(
        0.12,
        Math.min(1, r.baseBrightness + 0.25 * Math.sin(time * r.pulseSpeed + r.phase)),
      );

      // --- Ribbon body (filled, vertical gradient) ---
      const grad = ctx.createLinearGradient(0, botY, 0, topY);
      grad.addColorStop(0, r.colorSet[0]); // bottom
      grad.addColorStop(0.5, r.colorSet[1] ?? r.colorSet[0]); // mid
      grad.addColorStop(1, r.colorSet[2] ?? r.colorSet[1] ?? r.colorSet[0]); // top

      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = brightness;
      ctx.beginPath();
      ctx.moveTo(blx, botY);
      ctx.bezierCurveTo(
        blx - swayX * 0.3,
        botY - (botY - topY) * 0.35,
        tlx + swayX * 0.2,
        topY + (botY - topY) * 0.4,
        tlx,
        topY,
      );
      ctx.lineTo(trx, topY);
      ctx.bezierCurveTo(
        trx - swayX * 0.2,
        topY + (botY - topY) * 0.4,
        brx + swayX * 0.3,
        botY - (botY - topY) * 0.35,
        brx,
        botY,
      );
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // --- Vertical ray striations ---
      ctx.globalAlpha = Math.min(1, brightness * 0.4);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = r.colorSet[1] ?? r.colorSet[0];
      for (let ri = 0; ri < r.rayCount; ri += 1) {
        const frac = r.rayCount === 1 ? 0.5 : ri / (r.rayCount - 1);
        const baseX = tlx + (trx - tlx) * frac;
        ctx.beginPath();
        let started = false;
        for (let yy = topY; yy <= botY; yy += 6) {
          const off = Math.sin(yy * 0.03 + time * 0.0012 + r.phase + frac * 3) * 5;
          const xx = baseX + off;
          if (!started) {
            ctx.moveTo(xx, yy);
            started = true;
          } else {
            ctx.lineTo(xx, yy);
          }
        }
        ctx.stroke();
      }

      // --- Soft glow halo under the ribbon ---
      const gy = (topY + botY) / 2;
      const glowR = r.width * width * 1.3;
      const glowGrad = ctx.createRadialGradient(cx, gy, glowR * 0.1, cx, gy, glowR);
      glowGrad.addColorStop(0, hexToRgba(r.colorSet[0], 0.16 * brightness));
      glowGrad.addColorStop(1, hexToRgba(r.colorSet[0], 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, gy, glowR, (botY - topY) / 2 + 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw(time: number) {
      if (!ctx) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);

      for (const r of ribbons) drawRibbon(r, time);

      // Ambient drifting particles (subtle).
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -0.05) p.y = 1.05;
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 230, 255, 1)';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    resize();
    let raf = 0;
    let last = 0;
    const FRAME = 1000 / 25; // 25fps cap
    function loop(tt: number) {
      if (tt - last >= FRAME) {
        last = tt;
        draw(tt);
      }
      raf = requestAnimationFrame(loop);
    }

    if (reduce) {
      draw(0); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReduced, reduced]);

  return (
    <div ref={wrapRef} className={`aurora ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
