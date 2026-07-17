'use client';

import { type ReactNode } from 'react';
import RippleOnHover from './RippleOnHover';

export interface OceanGlassCardProps {
  children: ReactNode;
  /** Extra classes for the card surface. */
  className?: string;
  /** Blur / shadow intensity. */
  depth?: 'sm' | 'md' | 'lg';
  /** Lift on hover. */
  hoverLift?: boolean;
  /** Wrap content in a RippleOnHover water-ripple effect. */
  ripple?: boolean;
  /** Forwarded to the ripple effect (disable under reduced-motion). */
  reduced?: boolean;
}

/**
 * Ocean glass card primitive: an aqua-tinted frosted surface with a top
 * highlight border and a soft aqua glow (see `.ocean-glass` in globals.css).
 * Content is lifted above the ripple layer (z-10) so the water bloom sits
 * behind the text/icons.
 */
export default function OceanGlassCard({
  children,
  className = '',
  depth = 'md',
  hoverLift = true,
  ripple = false,
  reduced = false,
}: OceanGlassCardProps) {
  const surface = `ocean-glass ocean-glass--${depth} ${hoverLift ? 'ocean-glass--hover' : ''}`;
  const inner = <div className="relative z-10">{children}</div>;

  if (ripple) {
    return (
      <RippleOnHover className={`${surface} ${className}`} reduced={reduced}>
        {inner}
      </RippleOnHover>
    );
  }

  return <div className={`${surface} ${className}`}>{inner}</div>;
}
