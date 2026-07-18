'use client';

import { type ReactNode } from 'react';
import RippleOnHover from './RippleOnHover';

export interface OceanGlassCardProps {
  children: ReactNode;
  /** Extra classes for the card surface. */
  className?: string;
  /** Blur / shadow intensity (only for the 'ocean' surface). */
  depth?: 'sm' | 'md' | 'lg';
  /** Which glass surface to render. 'ocean' = aqua-tinted (default);
   *  'glass' = universal light glass (.glass-surface, see globals.css). */
  surface?: 'ocean' | 'glass';
  /** Lift on hover (only for the 'ocean' surface; .glass-surface hovers itself). */
  hoverLift?: boolean;
  /** Wrap content in a RippleOnHover water-ripple effect. */
  ripple?: boolean;
  /** Ripple fill colour (rgba). Defaults to an ocean-cyan bloom. */
  rippleColor?: string;
  /** Number of concentric rings emitted per hover (ocean mode = 3). */
  rippleRings?: number;
  /** Ripples originate at the pointer position on hover-enter. */
  ripplePointer?: boolean;
  /** Forwarded to the ripple effect (disable under reduced-motion). */
  reduced?: boolean;
}

/**
 * Ocean glass card primitive. By default it renders an aqua-tinted frosted
 * surface (`.ocean-glass`) with a top highlight border and a soft aqua glow.
 * Pass `surface="glass"` to render the universal light glass (`.glass-surface`)
 * used across the V43 bright/transparent redesign — translucent white with a
 * crisp highlight and a cyan brand glow on hover (see globals.css).
 * Content is lifted above the ripple layer (z-10) so the water bloom sits
 * behind the text/icons.
 */
export default function OceanGlassCard({
  children,
  className = '',
  depth = 'md',
  surface = 'ocean',
  hoverLift = true,
  ripple = false,
  rippleColor = 'rgba(8, 145, 178, 0.2)',
  rippleRings = 1,
  ripplePointer = false,
  reduced = false,
}: OceanGlassCardProps) {
  const surfaceClass =
    surface === 'glass'
      ? 'glass-surface'
      : `ocean-glass ocean-glass--${depth} ${hoverLift ? 'ocean-glass--hover' : ''}`;
  const inner = <div className="relative z-10 h-full">{children}</div>;

  if (ripple) {
    return (
      <RippleOnHover
        className={`${surfaceClass} ${className}`}
        rippleColor={rippleColor}
        rings={rippleRings}
        pointerDriven={ripplePointer}
        reduced={reduced}
      >
        {inner}
      </RippleOnHover>
    );
  }

  return <div className={`${surfaceClass} ${className}`}>{inner}</div>;
}
