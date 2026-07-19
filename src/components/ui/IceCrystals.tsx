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
      size: 80 + rand(i + 7) * 80, // V48.8: 80-160px (was 50-90px) — HUGE crystals
      dur: 20 + rand(i + 13) * 22, // V48.8: 20-42s (was 12-26s) — slow majestic fall
      delay: rand(i + 23) * 10,
      dx: (rand(i + 31) - 0.5) * 120, // V48.8: wider drift
      op: 1.0, // always fully opaque when visible
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
