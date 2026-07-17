import { useId } from 'react';

interface LogoProps {
  className?: string;
  /** Pixel size of the sphere mark (width & height of the SVG). */
  size?: number;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Text color of the wordmark ("Qtech"). */
  textClassName?: string;
  /** Color of the "Tool Cabinet" subtitle. */
  subTextColor?: string;
}

/**
 * Qtech brand mark — a glossy sphere (circle) filled with a tech light-blue
 * gradient (#00BCD4 → #0EA5E9 → #38BDF8) carrying a white "Q" letter.
 * Replaces the previous blue diamond / double-star mark (V35).
 */
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
            <stop stopColor="#00BCD4" />
            <stop offset="0.5" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#38BDF8" />
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

        {/* White "Q" letter mark */}
        <text
          x="24"
          y="32"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="26"
          fontWeight="800"
          fill="#ffffff"
        >
          Q
        </text>
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
            Tool Cabinet
          </span>
        </span>
      )}
    </span>
  );
}
