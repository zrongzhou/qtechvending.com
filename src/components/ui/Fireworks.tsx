'use client';

import { useEffect, useState } from 'react';

export interface FireworksProps {
  /** Number of fireworks (bursts) on screen. */
  count?: number;
  /** Extra classes for the fixed wrapper. */
  className?: string;
}

// Brand palette — vivid, saturated tones chosen to stay visible against the
// light product-page background. No pure white (would vanish on the pale bg).
const COLORS = ['#22D3EE', '#0EA5E9', '#38BDF8', '#2DD4BF', '#FBBF24', '#A855F7', '#F472B6', '#FB7185'];

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
    const left = 6 + Math.random() * 88; // 6–94 %
    const top = 8 + Math.random() * 65; // 8–73 % (V48.6: slightly higher)
    const radius = 70 + Math.random() * 110; // 70–180 px burst radius
    const n = 18 + Math.floor(Math.random() * 12); // 18–29 particles
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const particles: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const r = radius * (0.5 + Math.random() * 0.5);
      particles.push({
        tx: Math.cos(ang) * r,
        ty: Math.sin(ang) * r,
        color: Math.random() > 0.25 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 10 + Math.random() * 8, // V48.6: 10–18px (was 5–11px)
      });
    }
    arr.push({
      left,
      top,
      coreDelay: b * (0.6 + Math.random() * 1.0), // tighter stagger
      cycle: 3 + Math.random() * 2.4, // V48.6: 3–5.4s (was 5–9s)
      particles,
    });
  }
  return arr;
}

export default function Fireworks({ count = 12, className = '' }: FireworksProps) {
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
