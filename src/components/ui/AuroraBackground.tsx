'use client';

import { useEffect, useState } from 'react';

export interface AuroraBackgroundProps {
  /** Extra classes for the wrapping container. */
  className?: string;
  /** Gradient stop colors [near, mid, far]. */
  colors?: string[];
  /** External reduced-motion override; when omitted, read from matchMedia. */
  reduced?: boolean;
}

/**
 * Aurora (northern-lights) background built from blurred SVG gradient bands
 * that slowly flow via CSS keyframes. The flow is GPU-friendly (transform only)
 * and is disabled under prefers-reduced-motion, where a static gradient remains.
 */
export default function AuroraBackground({
  className = '',
  colors = ['#06b6d4', '#0891b2', '#0e7490'],
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

  const c1 = colors[0] ?? '#06b6d4';
  const c2 = colors[1] ?? '#0891b2';
  const c3 = colors[2] ?? '#0e7490';

  return (
    <div className={`aurora ${className}`} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="aurora-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} stopOpacity="0.55" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="aurora-grad-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c3} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c1} stopOpacity="0.04" />
          </linearGradient>
          <filter id="aurora-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <g filter="url(#aurora-blur)" className={isReduced ? '' : 'aurora__band--a'}>
          <path
            d="M-100,420 C200,300 400,520 700,400 C950,300 1100,460 1300,380 L1300,620 L-100,620 Z"
            fill="url(#aurora-grad-a)"
          />
        </g>
        <g filter="url(#aurora-blur)" className={isReduced ? '' : 'aurora__band--b'}>
          <path
            d="M-100,520 C250,420 450,560 800,460 C1050,390 1150,520 1300,470 L1300,640 L-100,640 Z"
            fill="url(#aurora-grad-b)"
          />
        </g>
        <g
          filter="url(#aurora-blur)"
          className={isReduced ? '' : 'aurora__band--a'}
          style={isReduced ? undefined : { animationDelay: '-6s' }}
        >
          <path
            d="M-100,300 C300,200 500,360 900,260 C1100,210 1200,320 1300,280 L1300,520 L-100,520 Z"
            fill="url(#aurora-grad-b)"
            opacity="0.7"
          />
        </g>
      </svg>
    </div>
  );
}
