import type { LucideIcon } from 'lucide-react';

interface IconTileProps {
  icon: LucideIcon;
  /** Classes for the lucide <svg> (size / extra color). */
  className?: string;
  /** Classes for the tile container. Defaults to the brand-tinted pill. */
  tileClassName?: string;
  size?: number;
}

/**
 * Unified icon container. Renders a lucide icon inside a rounded tile with a
 * fixed strokeWidth of 1.75 for a consistent, refined line weight across the
 * whole site. The tile background / color is fully controllable via
 * `tileClassName` so it can sit on light cards or dark photo overlays alike.
 */
export default function IconTile({
  icon: Icon,
  className = '',
  tileClassName = 'bg-brand-50 text-brand-600 p-3',
  size = 24,
}: IconTileProps) {
  return (
    <span className={`inline-flex items-center justify-center rounded-xl ${tileClassName}`}>
      <Icon className={className} size={size} strokeWidth={1.75} />
    </span>
  );
}
