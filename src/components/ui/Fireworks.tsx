'use client';

import { useEffect, useState } from 'react';

export interface FireworksProps {
  /** Number of fireworks (bursts) on screen. */
  count?: number;
  /** Extra classes for the fixed wrapper. */
  className?: string;
}

// V49.2: REAL firework palette — gold, red, green, white, orange, magenta.
// NOT pastel cyan (that's why they didn't look like fireworks).
const COLORS = ['#FFD700', '#FF4444', '#00FF88', '#FFFFFF', '#FF8C00', '#FF00FF', '#FFE135', '#00E5FF'];

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
function generateBursts(count: number): Burst[] {
  const arr: Burst[] = [];
  for (let b = 0; b < count; b += 1) {
    const left = 8 + Math.random() * 84; // 8–92 %
    const top = 8 + Math.random() * 55; // 8–63 % (upper area, like real sky)
    const radius = 90 + Math.random() * 140; // 90–230 px (REAL spread)
    const n = 14 + Math.floor(Math.random() * 12); // 14–25 particles (dense burst)
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const particles: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const r = radius * (0.45 + Math.random() * 0.60);
      particles.push({
        tx: Math.cos(ang) * r,
        ty: Math.sin(ang) * r - radius * 0.15, // slight upward bias like real fireworks
        color: Math.random() > 0.25 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 10 + Math.random() * 16, // V49.2: 10-26px (visible particles)
      });
    }
    arr.push({
      left,
      top,
      coreDelay: b * (1.0 + Math.random() * 1.5),
      cycle: 5 + Math.random() * 2.5, // V49.2: 5-7.5s cycles
      particles,
    });
  }
  return arr;
}

export default function Fireworks({ count = 5, className = '' }: FireworksProps) {
  // V47.1: bursts are generated after mount (not during render) so the
  // server-rendered HTML and the client's first render both output an empty
  // container — no hydration mismatch. The random fireworks appear right
  // after mount.
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
