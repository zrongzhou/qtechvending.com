'use client';

import { useEffect, useState } from 'react';

export interface FireworksProps {
  /** Number of fireworks (bursts) on screen. */
  count?: number;
  /** Extra classes for the fixed wrapper. */
  className?: string;
}

// V49.4: warmer, premium firework palette (gold / orange / pink / cyan / lilac).
const COLORS = ['#FFD27D', '#FF9E5E', '#FF8FB1', '#7DEFFF', '#C9A7FF', '#FFC36B', '#A0E8C0', '#B5A8FF'];

interface Burst {
  left: number;
  top: number;
  color: string;
  dot: number;
  /** Full box-shadow value — every spark rendered as a crisp dot + soft glow. */
  burst: string;
  cycle: number;
  delay: number;
}

/** Convert a #RRGGBB hex into an rgba() string at the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  if (hex === '#FFFFFF') return `rgba(255, 255, 255, ${alpha})`;
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Fireworks (V49.4) — a lightweight, dependency-free decorative layer. Each
 * burst is a single element whose `box-shadow` list IS the explosion: a ring of
 * crisp sparks + soft glow halos expanding outward from the core center (driven
 * by `transform: scale`) then drooping with gravity and fading. A bright core
 * flash ignites each burst. Positions, colours, sizes and timings are randomised
 * once on mount. The whole layer is `pointer-events-none absolute inset-0 z-5`
 * so it sits above card backgrounds, and it stays visible under
 * `prefers-reduced-motion` (see globals.css).
 */
function generateBursts(count: number): Burst[] {
  const arr: Burst[] = [];
  for (let b = 0; b < count; b += 1) {
    const left = 8 + Math.random() * 84; // 8–92 %
    const top = 8 + Math.random() * 55; // 8–63 % (upper area, like real sky)
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const n = 22 + Math.floor(Math.random() * 10); // 22–31 sparks (dense burst)
    const radius = 80 + Math.random() * 120; // 80–200 px real spread
    const sparks: string[] = [];
    for (let i = 0; i < n; i += 1) {
      // Even angular distribution + a little jitter so it isn't a perfect ring.
      const ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.35;
      const r = radius * (0.35 + Math.random() * 0.7); // varied depth
      const dx = Math.cos(ang) * r;
      const dy = Math.sin(ang) * r - radius * 0.12; // slight upward bias
      const c = Math.random() > 0.3 ? baseColor : '#FFFFFF';
      const glow = hexToRgba(c, 0.55);
      // Crisp spark + soft glow halo at the same offset.
      sparks.push(`${dx.toFixed(1)}px ${dy.toFixed(1)}px 0 0 ${c}`);
      sparks.push(`${dx.toFixed(1)}px ${dy.toFixed(1)}px 6px 0 ${glow}`);
    }
    arr.push({
      left,
      top,
      color: baseColor,
      dot: 4 + Math.random() * 3, // 4–7px spark head
      burst: sparks.join(', '),
      cycle: 5 + Math.random() * 2.5, // 5–7.5s cycle
      delay: b * (1.0 + Math.random() * 1.5),
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
            style={{
              animationDelay: `${burst.delay}s`,
              animationDuration: `${burst.cycle}s`,
            }}
          />
          <span
            className="firework__burst"
            style={
              {
                '--c': burst.color,
                '--dot': `${burst.dot}px`,
                '--burst': burst.burst,
                '--cycle': `${burst.cycle}s`,
                animationDelay: `${burst.delay}s`,
              } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
}
