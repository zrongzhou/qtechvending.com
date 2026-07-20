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
    const n = 30 + Math.floor(Math.random() * 16); // 30–45 sparks (dense)
    const radius = 80 + Math.random() * 130; // 80–210 px real spread
    const particles: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      // Even angular distribution + a little jitter so it isn't a perfect ring.
      const ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.3;
      const r = radius * (0.55 + Math.random() * 0.5); // varied depth
      const dx = Math.cos(ang) * r;
      const dy = Math.sin(ang) * r - radius * 0.18; // slight upward bias
      const c = Math.random() > 0.32 ? baseColor : '#FFFFFF';
      particles.push({
        dx: +dx.toFixed(1),
        dy: +dy.toFixed(1),
        c,
        size: +(3.5 + Math.random() * 4).toFixed(1), // 3.5–7.5px head
        pd: +(Math.random() * 0.25).toFixed(2),
      });
    }
    arr.push({
      left,
      top,
      color: baseColor,
      coreSize: +(34 + Math.random() * 16).toFixed(1), // 34–50px flash
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
