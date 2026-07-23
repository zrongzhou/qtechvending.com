import '@/styles/animations-deferred.css';
import type { LucideIcon } from 'lucide-react';

type IconVariant = 'default' | 'gradient' | 'glossy' | 'float' | 'hex';
type IconAnimate = false | 'pulse' | 'bounce' | 'shimmer' | 'float';

export interface IconTileProps {
  icon: LucideIcon;
  /** Classes for the lucide <svg> (size / extra color). */
  className?: string;
  /** Explicit tile container classes (overrides `variant` when provided). */
  tileClassName?: string;
  size?: number;
  /** Visual variant of the tile. */
  variant?: IconVariant;
  /** Idle animation for the tile. */
  animate?: IconAnimate;
}

// Default tile looks per variant. Callers may still pass `tileClassName` to
// fully control the surface (backwards-compatible with existing usages).
const VARIANT_TILE: Record<IconVariant, string> = {
  default: 'bg-brand-50 text-brand-700',
  gradient: 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md',
  glossy:
    'bg-gradient-to-br from-cyan-400/30 to-blue-600/40 text-white shadow-inner ring-1 ring-white/30',
  float: 'bg-gradient-to-br from-ocean-500 to-brand-600 text-white shadow-lg',
  hex: 'bg-gradient-to-br from-brand-600 to-ocean-700 text-white shadow-md',
};

const ANIMATE_CLASS: Record<Exclude<IconAnimate, false>, string> = {
  pulse: 'icon-pulse',
  bounce: 'animate-icon-bounce',
  shimmer: 'icon-shimmer',
  float: 'icon-float',
};

/**
 * Unified icon container. Renders a lucide icon inside a rounded (or hexagonal)
 * tile. The tile background / color is controllable through `variant` or the
 * explicit `tileClassName`, and a subtle idle animation can be applied via
 * `animate`. Keeps a refined 1.75 stroke weight across the whole site.
 */
export default function IconTile({
  icon: Icon,
  className = '',
  tileClassName,
  size = 24,
  variant = 'default',
  animate = false,
}: IconTileProps) {
  const tile = tileClassName ?? VARIANT_TILE[variant];
  const isGradient = tile.includes('from-');
  const needsRing = !tileClassName && !isGradient;
  const ring = needsRing ? 'shadow-soft ring-1 ring-brand-100' : '';
  const anim = animate ? ANIMATE_CLASS[animate] : '';
  // V49.5: gradient tiles get the refined .icon-chip (top sheen + inner
  // shadow + soft drop) so icons read as floating, glossy surfaces.
  const gloss = isGradient ? 'icon-chip' : '';
  const shape = variant === 'hex'
    ? '[clip-path:polygon(25%_5%,75%_5%,100%_50%,75%_95%,25%_95%,0%_50%)]'
    : 'rounded-xl';

  return (
    <span className={`relative inline-flex items-center justify-center ${shape} ${tile} ${gloss} ${anim} ${ring}`}>
      <Icon className={className} size={size} strokeWidth={1.75} />
    </span>
  );
}
