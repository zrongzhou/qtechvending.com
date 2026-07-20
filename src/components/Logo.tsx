import { useId } from 'react';

interface LogoProps {
  className?: string;
  /** Pixel size of the sphere mark (width & height of the SVG). */
  size?: number;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Text color of the wordmark ("Qtech"). */
  textClassName?: string;
  /** Color of the "Vending Machines" subtitle. */
  subTextColor?: string;
}

/**
 * Qtech brand mark — a glossy sphere (circle) filled with a sky-cyan gradient
 * (#22d3ee → #0ea5e9 → #3b82f6) carrying a twin white sparkle (double-star)
 * mark. Replaces the previous light-blue sphere with a "Q" letter.
 */
function sparkle(cx: number, cy: number, r: number): string {
  // A four-pointed "sparkle" drawn with quadratic curves bowing toward the
  // centre: N → E → S → W → N. Stays crisp at any size.
  return [
    `M ${cx} ${cy - r}`,
    `Q ${cx} ${cy} ${cx + r} ${cy}`,
    `Q ${cx} ${cy} ${cx} ${cy + r}`,
    `Q ${cx} ${cy} ${cx - r} ${cy}`,
    `Q ${cx} ${cy} ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

export default function Logo({
  className = '',
  size = 44,
  markOnly = false,
  textClassName = 'text-slate-900',
  subTextColor = '#0EA5E9',
}: LogoProps) {
  const uid = useId().replace(/:/g, '');
  const sphereId = `sp-${uid}`;
  const sheenId = `sh-${uid}`;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          {/* Tech light-blue sphere gradient */}
          <linearGradient id={sphereId} x1="6" y1="4" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0891B2" />
            <stop offset="0.5" stopColor="#0E7490" />
            <stop offset="1" stopColor="#155E75" />
          </linearGradient>
          {/* Soft top sheen for a 3-D sphere feel */}
          <radialGradient id={sheenId} cx="0.35" cy="0.28" r="0.55">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sphere body */}
        <circle cx="24" cy="24" r="21" fill={`url(#${sphereId})`} />
        {/* Rim light */}
        <circle cx="24" cy="24" r="21" fill="none" stroke="#bae6fd" strokeOpacity="0.6" strokeWidth="0.8" />
        {/* Glossy top sheen */}
        <ellipse cx="18" cy="14" rx="11" ry="8" fill={`url(#${sheenId})`} />

        {/* Double-star (sparkle) brand mark — two white four-point stars */}
        <path d={sparkle(19, 22, 11)} fill="#ffffff" />
        <path d={sparkle(31, 30, 6)} fill="#ffffff" fillOpacity="0.85" />
      </svg>

      {!markOnly && (
        <span className="flex flex-col leading-none ms-2">
          <span className={`text-[12px] font-semibold tracking-tight ${textClassName}`}>Qtech</span>
          <span
            style={{
              marginTop: 1,
              fontSize: '7px',
              fontWeight: 400,
              letterSpacing: '0.6px',
              color: subTextColor,
              textTransform: 'uppercase',
            }}
          >
            Vending Machines
          </span>
        </span>
      )}
    </span>
  );
}
