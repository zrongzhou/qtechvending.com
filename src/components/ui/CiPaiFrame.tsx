'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface CiPaiFrameProps {
  /** Main vertical keyword (e.g. "秋彦" / "Qtech" / a category word). */
  label: string;
  /** Optional secondary keyword shown beneath the main label. */
  subLabel?: string;
  /** Accent identity: 'cyan' | 'blue' | 'brand' | 'teal'. Defaults to 'cyan'. */
  accent?: 'cyan' | 'blue' | 'brand' | 'teal';
  /** Extra classes for the outer (relative) wrapper. */
  className?: string;
  /** The content the plaque overlays (usually an image). */
  children?: ReactNode;
}

const ACCENT_RING: Record<string, string> = {
  cyan: 'border-cyan-400/80',
  blue: 'border-blue-400/80',
  brand: 'border-brand-400/80',
  teal: 'border-teal-400/80',
};

const ACCENT_SEAL: Record<string, string> = {
  cyan: 'bg-brand-600',
  blue: 'bg-blue-600',
  brand: 'bg-brand-600',
  teal: 'bg-teal-600',
};

/**
 * CiPaiFrame (牌匾框) — a decorative Chinese vertical-plaque overlay.
 *
 * Renders `children` inside a `relative` wrapper and floats a thin brand-accent
 * plaque (writing-mode: vertical-rl) at the inline-end / top corner. Decorative
 * parts are `aria-hidden`. RTL-safe: the logical `end-*` positioning flips the
 * plaque to the left edge under `dir="rtl"`. The vertical CJK text still reads
 * top→bottom, which is correct for Chinese. There is no animation, so nothing
 * flashes under `prefers-reduced-motion`.
 */
export default function CiPaiFrame({
  label,
  subLabel,
  accent = 'cyan',
  className = '',
  children,
}: CiPaiFrameProps) {
  const ring = ACCENT_RING[accent] ?? ACCENT_RING.cyan;
  const seal = ACCENT_SEAL[accent] ?? ACCENT_SEAL.cyan;
  const vertical: CSSProperties = { writingMode: 'vertical-rl' };

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className={`pointer-events-none absolute end-3 top-3 z-30 select-none rounded-md border ${ring} bg-slate-900/45 px-1.5 py-2 shadow-md backdrop-blur-sm`}
        aria-hidden="true"
        style={vertical}
      >
        <span className="text-[13px] font-bold tracking-widest text-white">{label}</span>
        {subLabel && (
          <span className="mt-1 text-[9px] font-medium tracking-wide text-white/80">{subLabel}</span>
        )}
        {/* Seal-style corner mark, kept horizontal for legibility. */}
        <span
          className={`absolute flex h-4 w-4 items-center justify-center rounded-sm text-[8px] font-bold text-white ${seal}`}
          style={{ bottom: '-7px', right: '-7px', writingMode: 'horizontal-tb' }}
        >
          印
        </span>
      </div>
    </div>
  );
}
