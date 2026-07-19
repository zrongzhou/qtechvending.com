'use client';

import type { CSSProperties } from 'react';

export interface IceCrystalsProps {
  /** Number of ice shards. */
  count?: number;
  /** Extra classes for the absolute wrapper. */
  className?: string;
}

// Deterministic pseudo-random so server and client renders match (no hydration
// mismatch). Same technique as the CtaSection ambient fields.
function rand(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * IceCrystals (V48, R4) — a lightweight, CSS-only field of drifting ice shards
 * for the About-page "glacier" stat band. Each shard is a small glowing diamond
 * that falls and slowly rotates (see globals.css `.ice-crystal`). No canvas, so
 * it stays cheap on mobile. All motion is decorative and is neutralised under
 * `prefers-reduced-motion`.
 */
export default function IceCrystals({ count = 26, className = '' }: IceCrystalsProps) {
  const shards = Array.from({ length: count }, (_, i) => {
    const r = rand(i + 1);
    return {
      left: r * 100,
      size: 50 + rand(i + 7) * 40, // V48.7: 50–90px (was 35–60)
      dur: 12 + rand(i + 13) * 14, // V48.7: 12–26s (slower = longer visible)
      delay: rand(i + 23) * 10,
      dx: (rand(i + 31) - 0.5) * 100, // V48.7: wider drift
      op: 1.0, // V48.7: ALWAYS fully opaque — no fading
    };
  });

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {shards.map((s, i) => (
        <span
          key={i}
          className="ice-crystal"
          style={
            {
              left: `${s.left}%`,
              ['--ice-size']: `${s.size}px`,
              ['--ice-dur']: `${s.dur}s`,
              ['--ice-dx']: `${s.dx}px`,
              ['--ice-op']: s.op,
              animationDelay: `${s.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
