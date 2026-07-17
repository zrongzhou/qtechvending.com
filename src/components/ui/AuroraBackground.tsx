'use client';

import { useEffect, useState } from 'react';

export interface AuroraBackgroundProps {
  /** Extra classes for the wrapping container. */
  className?: string;
  /** Gradient stop colors [cyan, purple, pink, green]. */
  colors?: string[];
  /** External reduced-motion override; when omitted, read from matchMedia. */
  reduced?: boolean;
}

/**
 * Aurora (northern-lights) background built from blurred SVG gradient "curtains"
 * that slowly flow and sway via CSS keyframes. V33 — made genuinely ethereal:
 *  - Stop opacities are very low (max ~0.4) so the light reads as ghost-curtains.
 *  - Blur is increased (stdDeviation 60) so edges are soft, not a flat cloth.
 *  - Six overlapping, organically-curved curtains in green/cyan/purple/pink.
 *  - Slow 18–25s flows with a vertical sway component (translateY).
 *  - The container blends with `mix-blend-mode: screen` (set in globals.css)
 *    so the translucent light layers luminously over the dark CTA background.
 * The flow is GPU-friendly (transform only) and disabled under
 * prefers-reduced-motion, where a static gradient remains.
 */
export default function AuroraBackground({
  className = '',
  colors = ['#22d3ee', '#a855f7', '#f472b6', '#34d399'],
  reduced,
}: AuroraBackgroundProps) {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    if (reduced !== undefined) {
      setIsReduced(reduced);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [reduced]);

  const c1 = colors[0] ?? '#22d3ee'; // cyan
  const c2 = colors[1] ?? '#a855f7'; // purple
  const c3 = colors[2] ?? '#f472b6'; // pink
  const c4 = colors[3] ?? '#34d399'; // green

  return (
    <div className={`aurora ${className}`} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Vertical curtain gradients: bright at top, fading to transparent
              at the bottom so each band looks like a hanging sheet of light. */}
          <linearGradient id="aurora-grad-a" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c1} stopOpacity="0.35" />
            <stop offset="55%" stopColor={c2} stopOpacity="0.18" />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aurora-grad-b" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c4} stopOpacity="0.3" />
            <stop offset="55%" stopColor={c1} stopOpacity="0.16" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aurora-grad-c" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c3} stopOpacity="0.28" />
            <stop offset="55%" stopColor={c2} stopOpacity="0.14" />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aurora-grad-d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c2} stopOpacity="0.3" />
            <stop offset="55%" stopColor={c1} stopOpacity="0.15" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </linearGradient>
          <filter id="aurora-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>

        {/* Curtain 1 — cyan→purple, tall flowing sheet */}
        <g filter="url(#aurora-blur)" className={isReduced ? '' : 'aurora__band--a'}>
          <path
            d="M-150,260 C200,160 400,320 650,230 C900,150 1100,300 1350,220 L1350,660 L-150,660 Z"
            fill="url(#aurora-grad-a)"
          />
        </g>

        {/* Curtain 2 — pink→purple, wide slow sheet */}
        <g
          filter="url(#aurora-blur)"
          className={isReduced ? '' : 'aurora__band--b'}
          style={isReduced ? undefined : { animationDelay: '-4s' }}
        >
          <path
            d="M-150,340 C250,250 450,400 800,300 C1050,240 1180,360 1350,300 L1350,660 L-150,660 Z"
            fill="url(#aurora-grad-c)"
          />
        </g>

        {/* Curtain 3 — green→cyan, shorter/narrower ribbon */}
        <g
          filter="url(#aurora-blur)"
          className={isReduced ? '' : 'aurora__band--c'}
          style={isReduced ? undefined : { animationDelay: '-3s' }}
        >
          <path
            d="M-150,180 C300,100 500,260 900,160 C1100,110 1200,220 1350,180 L1350,520 L-150,520 Z"
            fill="url(#aurora-grad-b)"
            opacity="0.5"
          />
        </g>

        {/* Curtain 4 — purple→cyan, deep-delay rich sheet */}
        <g
          filter="url(#aurora-blur)"
          className={isReduced ? '' : 'aurora__band--d'}
          style={isReduced ? undefined : { animationDelay: '-9s' }}
        >
          <path
            d="M-150,300 C220,380 520,180 820,300 C1050,390 1180,240 1350,300 L1350,560 L-150,560 Z"
            fill="url(#aurora-grad-d)"
            opacity="0.65"
          />
        </g>

        {/* Curtain 5 — pink→purple, low wide wash */}
        <g
          filter="url(#aurora-blur)"
          className={isReduced ? '' : 'aurora__band--b'}
          style={isReduced ? undefined : { animationDelay: '-6s' }}
        >
          <path
            d="M-150,420 C250,330 450,470 850,370 C1050,320 1180,430 1350,390 L1350,680 L-150,680 Z"
            fill="url(#aurora-grad-c)"
            opacity="0.45"
          />
        </g>

        {/* Curtain 6 — cyan→purple, taller narrow curtain */}
        <g
          filter="url(#aurora-blur)"
          className={isReduced ? '' : 'aurora__band--a'}
          style={isReduced ? undefined : { animationDelay: '-12s' }}
        >
          <path
            d="M-150,230 C200,300 450,140 750,250 C1000,340 1200,180 1350,250 L1350,600 L-150,600 Z"
            fill="url(#aurora-grad-a)"
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}
