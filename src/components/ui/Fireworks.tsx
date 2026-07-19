'use client';

import { useEffect, useState } from 'react';

export interface FireworksProps {
  /** Number of fireworks (bursts) on screen. */
  count?: number;
  /** Extra classes for the fixed wrapper. */
  className?: string;
}

// V48.8: Vivid saturated palette ONLY — colors chosen for maximum visibility
// on light/white backgrounds. No pale/cyan/blue that blends with page bg.
const COLORS = ['#FACC15', '#F97316', '#EF4444', '#22D3EE', '#A855F7', '#EC4899', '#FBBF24'];

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
    const left = 8 + Math.random() * 84; // 8–92 % (keep away from edges)
    const top = 8 + Math.random() * 65; // 8–73 %
    const radius = 120 + Math.random() * 180; // 120–300 px (V48.8: wider spread)
    const n = 16 + Math.floor(Math.random() * 10); // 16–25 particles (fewer but bigger)
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const particles: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const r = radius * (0.4 + Math.random() * 0.6);
      particles.push({
        tx: Math.cos(ang) * r,
        ty: Math.sin(ang) * r,
        color: Math.random() > 0.3 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 32 + Math.random() * 20, // V48.8: 32-52px (was 20-34px)
      });
    }
    arr.push({
      left,
      top,
      coreDelay: b * (0.6 + Math.random() * 1.0), // wider stagger
      cycle: 7 + Math.random() * 3, // V48.8: 7-10s (slower = longer visible)
      particles,
    });
  }
  return arr;
}

export default function Fireworks({ count = 10, className = '' }: FireworksProps) {
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
