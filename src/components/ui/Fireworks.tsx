'use client';

import { useEffect, useState } from 'react';

export interface FireworksProps {
  /** Number of fireworks (bursts) on screen. */
  count?: number;
  /** Extra classes for the fixed wrapper. */
  className?: string;
}

// V49.5: warmer, premium firework palette (gold / orange / pink / cyan / lilac).
const COLORS = ['#FFD27D', '#FF9E5E', '#FF8FB1', '#7DEFFF', '#C9A7FF', '#FFC36B', '#A0E8C0', '#B5A8FF'];

interface Particle {
  /** Horizontal travel distance from the burst center (px, negative = left). */
  dx: number;
  /** Vertical travel distance from the burst center (px, positive = down). */
  dy: number;
  /** Spark colour (hex). */
  c: string;
  /** Diameter of the spark head (px). */
  size: number;
  /** Travel angle (deg) — used to orient the streak along its flight path. */
  ang: number;
  /** Small per-particle delay jitter (s) so the ring doesn't move as one disc. */
  pd: number;
}

interface Burst {
  left: number;
  top: number;
  color: string;
  /** Diameter of the central ignition flash (px). */
  coreSize: number;
  particles: Particle[];
  /** Full animation cycle length (s). */
  cycle: number;
  /** Delay before this burst ignites (s). */
  delay: number;
}

/**
 * Fireworks (V49.5) — a lightweight, dependency-free decorative layer. Each
 * burst is a small container holding ONE soft core flash + many tiny radial
 * sparks. Every spark travels OUTWARD from the center along its own angle,
 * arcs, then droops with gravity and fades — a genuine, clearly-animated
 * firework explosion (the V49.4 box-shadow single-element approach read as
 * static circles in the live build). Positions, colours, sizes and timings
 * are randomised once on mount. The whole layer is `pointer-events-none
 * absolute inset-0 z-5` so it sits above card backgrounds, and it stays
 * visible under `prefers-reduced-motion` (see globals.css).
 */
function generateBursts(count: number): Burst[] {
  const arr: Burst[] = [];
  for (let b = 0; b < count; b += 1) {
    const left = 8 + Math.random() * 84; // 8–92 %
    const top = 8 + Math.random() * 52; // 8–60 % (upper sky)
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    // V49.7: fewer, larger, more deliberate sparks — a real explosion, not a
    // powder puff. 12–18 head sparks per burst (was 22–33), with strong size
    // variance (3–14px) and a larger angular jitter so the ring reads organic.
    const n = 12 + Math.floor(Math.random() * 7); // 12–18 sparks
    const radius = 90 + Math.random() * 140; // 90–230 px real spread
    const particles: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      // Even angular distribution + LARGER jitter so it isn't a perfect ring.
      const ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.8;
      const r = radius * (0.5 + Math.random() * 0.6); // varied depth
      const dx = Math.cos(ang) * r;
      const dy = Math.sin(ang) * r - radius * 0.22; // stronger upward bias
      const c = Math.random() > 0.25 ? baseColor : '#FFFFFF';
      particles.push({
        dx: +dx.toFixed(1),
        dy: +dy.toFixed(1),
        c,
        size: +(3 + Math.random() * 11).toFixed(1), // 3–14px head (real variance)
        ang: +((ang * 180) / Math.PI).toFixed(1), // travel angle in deg
        pd: +(Math.random() * 0.3).toFixed(2),
      });
    }
    arr.push({
      left,
      top,
      color: baseColor,
      coreSize: +(24 + Math.random() * 14).toFixed(1), // 24–38px flash (tighter)
      particles,
      cycle: +(4.5 + Math.random() * 2.5).toFixed(2), // 4.5–7s cycle
      delay: +(b * (1.0 + Math.random() * 1.5)).toFixed(2),
    });
  }
  return arr;
}

export default function Fireworks({ count = 5, className = '' }: FireworksProps) {
  // Bursts are generated after mount (not during render) so the server-rendered
  // HTML and the client's first render both output an empty container — no
  // hydration mismatch. The random fireworks appear right after mount.
  const [bursts, setBursts] = useState<Burst[]>([]);
  useEffect(() => {
    setBursts(generateBursts(count));
  }, [count]);

  return (
    <div className={`fireworks ${className}`} aria-hidden="true">
      {bursts.map((burst, bi) => (
        <div
          key={bi}
          className="firework"
          style={{ left: `${burst.left}%`, top: `${burst.top}%` }}
        >
          <span
            className="firework__core"
            style={
              {
                '--core': `${burst.coreSize}px`,
                '--cycle': `${burst.cycle}s`,
                animationDelay: `${burst.delay}s`,
              } as React.CSSProperties
            }
          />
          {burst.particles.map((p, pi) => (
            <span
              key={pi}
              className="firework__p"
              style={
                {
                  '--c': p.c,
                  '--size': `${p.size}px`,
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  '--ang': `${p.ang}deg`,
                  '--cycle': `${burst.cycle}s`,
                  animationDelay: `${burst.delay + p.pd}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
