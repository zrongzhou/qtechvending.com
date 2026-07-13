interface LogoProps {
  className?: string;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Text color of the wordmark. */
  textClassName?: string;
}

/**
 * Qtech brand mark — two four-pointed stars (sparkles) in the ice-blue
 * gradient, optionally paired with the wordmark "Qtech".
 */
export default function Logo({ className = '', markOnly = false, textClassName = 'text-ink-900' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="qtechStar" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="0.5" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Primary four-pointed star */}
        <path
          d="M24 3 L27.2 20.8 L45 24 L27.2 27.2 L24 45 L20.8 27.2 L3 24 L20.8 20.8 Z"
          fill="url(#qtechStar)"
        />
        {/* Secondary smaller star (offset, upper-right) */}
        <path
          d="M40 8 L41.6 15.4 L49 17 L41.6 18.6 L40 26 L38.4 18.6 L31 17 L38.4 15.4 Z"
          fill="url(#qtechStar)"
          opacity="0.75"
        />
      </svg>
      {!markOnly && (
        <span className={`text-xl font-extrabold tracking-tight ${textClassName}`}>Qtech</span>
      )}
    </span>
  );
}
