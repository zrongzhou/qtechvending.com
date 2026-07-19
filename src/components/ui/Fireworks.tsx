'use client';

import { useMemo } from 'react';

export interface FireworksProps {
  /** Number of fireworks (bursts) on screen. */
  count?: number;
  /** Extra classes for the fixed wrapper. */
  className?: string;
}

// Brand palette: gold, cyan, teal, sky, blue, white.
const COLORS = ['#FBBF24', '#22D3EE', '#2DD4BF', '#38BDF8', '#0EA5E9', '#FFFFFF'];

interface Particle {
  tx: number;
  ty: number;
  color: string;
  size: number;
}

interface Burst {
  left: number;
  top: number;
  coreDelay: number;
  cycle: number;
  particles: Particle[];
}

/**
 * Fireworks (V47) — a lightweight, dependency-free decorative layer for the
 * product pages. Pure CSS keyframes drive each burst: a central flash plus a
 * ring of particles that explode outward and fade. Positions, colours, sizes
 * and timings are randomised once on mount. The whole layer is
 * `pointer-events-none fixed inset-0 z-0` so it sits behind page content, and
 * it is hidden under `prefers-reduced-motion` (see globals.css).
 */
export default function Fireworks({ count = 12, className = '' }: FireworksProps) {
  const bursts = useMemo<Burst[]>(() => {
    const arr: Burst[] = [];
    for (let b = 0; b < count; b += 1) {
      const left = 6 + Math.random() * 88; // 6–94 %
      const top = 10 + Math.random() * 62; // 10–72 %
      const radius = 32 + Math.random() * 48; // 32–80 px burst radius
      const n = 12 + Math.floor(Math.random() * 9); // 12–20 particles
      const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const particles: Particle[] = [];
      for (let i = 0; i < n; i += 1) {
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const r = radius * (0.55 + Math.random() * 0.45);
        particles.push({
          tx: Math.cos(ang) * r,
          ty: Math.sin(ang) * r,
          // Mostly the base colour, occasionally a contrasting brand pop.
          color: Math.random() > 0.25 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 3 + Math.random() * 3,
        });
      }
      arr.push({
        left,
        top,
        coreDelay: b * (1.4 + Math.random() * 1.6),
        cycle: 7 + Math.random() * 5, // 7–12s repeating cycle
        particles,
      });
    }
    return arr;
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
            style={{
              animationDelay: `${burst.coreDelay}s`,
              animationDuration: `${burst.cycle}s`,
            }}
          />
          {burst.particles.map((p, pi) => (
            <i
              key={pi}
              className="firework__particle"
              style={
                {
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  '--c': p.color,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  marginLeft: `${-p.size / 2}px`,
                  marginTop: `${-p.size / 2}px`,
                  animationDelay: `${burst.coreDelay}s`,
                  animationDuration: `${burst.cycle}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
