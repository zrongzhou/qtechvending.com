import type { CSSProperties } from 'react';

/**
 * V12 Summer-Beach wave divider — a gentle SVG wave used to transition between
 * sections site-wide. `color` is the fill (defaults to sand-100) so the wave
 * blends into the section below it. `flip` mirrors it vertically.
 */
export default function WaveDivider({
  className = '',
  color = '#fdf6ec',
  flip = false,
}: {
  className?: string;
  color?: string;
  flip?: boolean;
}) {
  const style: CSSProperties | undefined = flip
    ? { transform: 'rotate(180deg)' }
    : undefined;

  return (
    <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-12 sm:h-16"
        style={style}
      >
        <path
          d="M0,40 C240,80 480,0 720,32 C960,64 1200,16 1440,40 L1440,80 L0,80 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
