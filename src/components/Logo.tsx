interface LogoProps {
  className?: string;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Text color of the wordmark. */
  textClassName?: string;
}

/**
 * Qtech brand mark — a single rounded hexagon containing a minimal "Q",
 * filled with the ice-blue gradient. Optionally paired with the wordmark
 * "Qtech" and the "TOOL CABINET" tagline.
 *
 * The gradient id is shared by every instance on the page; because all
 * definitions are identical this is safe and avoids duplicate-id flicker.
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
          <linearGradient id="qtechMark" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="0.55" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Single rounded hexagon */}
        <path
          d="M14 6.68 L34 6.68 L44 24 L34 41.32 L14 41.32 L4 24 Z"
          fill="url(#qtechMark)"
          stroke="url(#qtechMark)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Minimal "Q": ring + tail */}
        <circle cx="24" cy="22.5" r="9" fill="none" stroke="#ffffff" strokeWidth="3" />
        <path d="M30 28 L35 34" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className={`text-xl font-extrabold tracking-tight ${textClassName}`}>Qtech</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-600">
            Tool Cabinet
          </span>
        </span>
      )}
    </span>
  );
}
