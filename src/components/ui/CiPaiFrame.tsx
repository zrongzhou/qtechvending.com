'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface CiPaiFrameProps {
  /** Main vertical keyword (e.g. "秋彦" / "Qtech" / a category word). */
  label: string;
  /** Optional secondary keyword shown beneath the main label. */
  subLabel?: string;
  /** Accent identity (reserved for future theming). Defaults to 'cyan'. */
  accent?: 'cyan' | 'blue' | 'brand' | 'teal';
  /** Extra classes for the outer (relative) wrapper. */
  className?: string;
  /** The content the plaque overlays (usually an image). */
  children?: ReactNode;
}

/**
 * CiPaiFrame (牌匾框) — an elegant Chinese vertical-plaque overlay.
 *
 * Renders `children` inside a `relative` wrapper and floats a refined brand
 * plaque (writing-mode: vertical-rl) at the inline-end / top corner. The plaque
 * is a deep-blue glass tablet with a double amber border, amber-gold serif
 * lettering and a round red seal — evoking a classical 牌匾. Decorative parts
 * are `aria-hidden`. RTL-safe: the logical `end-*` positioning flips the plaque
 * to the left edge under `dir="rtl"`. The vertical CJK text still reads
 * top→bottom, which is correct for Chinese. No animation, so nothing flashes
 * under `prefers-reduced-motion`.
 */
export default function CiPaiFrame({
  label,
  subLabel,
  accent = 'cyan',
  className = '',
  children,
}: CiPaiFrameProps) {
  void accent; // reserved for future theming; current design is fixed classical
  const vertical: CSSProperties = { writingMode: 'vertical-rl' };

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className="pointer-events-none absolute end-3 top-3 z-30 select-none rounded-md border border-amber-400/40 bg-gradient-to-b from-slate-800/70 to-slate-900/80 px-2 py-2.5 shadow-lg shadow-black/30 ring-1 ring-inset ring-amber-400/20 backdrop-blur-sm"
        aria-hidden="true"
        style={vertical}
      >
        <span className="font-serif text-[15px] font-bold tracking-wider text-amber-100">{label}</span>
        {subLabel && (
          <span className="mt-1.5 text-[10px] font-medium tracking-wide text-cyan-300/80">{subLabel}</span>
        )}
        {/* Seal-style corner mark, kept horizontal for legibility. */}
        <span
          className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-[9px] font-bold text-white shadow-sm"
          style={{ bottom: '-8px', right: '-8px', writingMode: 'horizontal-tb' }}
        >
          印
        </span>
      </div>
    </div>
  );
}
