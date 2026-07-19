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
    const left = 5 + Math.random() * 90; // 5–95 %
    const top = 5 + Math.random() * 70; // 5–75 %
    const radius = 90 + Math.random() * 140; // 90–230 px burst radius (V48.7: wider spread)
    const n = 22 + Math.floor(Math.random() * 14); // 22–35 particles (V48.7: more particles)
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const particles: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const r = radius * (0.45 + Math.random() * 0.55); // V48.7: particles reach further
      particles.push({
        tx: Math.cos(ang) * r,
        ty: Math.sin(ang) * r,
        color: Math.random() > 0.25 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 20 + Math.random() * 14, // V48.7: 20–34px (was 10-18px)
      });
    }
    arr.push({
      left,
      top,
      coreDelay: b * (0.4 + Math.random() * 0.8), // tighter stagger
      cycle: 4 + Math.random() * 3, // V48.7: 4–7s (slower = longer visible)
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
