'use client';

import '@/styles/animations-deferred.css';
import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';

export interface RippleOnHoverProps {
  children: ReactNode;
  /** Extra classes for the ripple container. */
  className?: string;
  /** true = ripple originates at the pointer position on hover-enter. */
  pointerDriven?: boolean;
  /** Ripple fill colour (rgba). */
  rippleColor?: string;
  /** Number of concentric rings emitted per hover (1 = single bloom). */
  rings?: number;
  /** Per-ring stagger in seconds. */
  ringDelay?: number;
  /** Disable the effect entirely (e.g. reduced-motion). */
  reduced?: boolean;
}

interface RippleState {
  x: number;
  y: number;
  size: number;
  token: number;
}

/**
 * Container that emits one or more soft radial "water ripple" rings on hover.
 * In pointer-driven mode the rings originate at the cursor; otherwise they
 * expand from the center. Each ring is a lightweight child <span class="water-ripple__ring">
 * animated with pure CSS (@keyframes waterRippleExpand in globals.css), so there is
 * no layout cost and re-triggering works reliably by remounting the spans via a token key.
 *
 * When `reduced` is set — or the user prefers reduced motion — the effect is a
 * no-op.
 */
export default function RippleOnHover({
  children,
  className = '',
  pointerDriven = false,
  rippleColor = 'rgba(56, 189, 248, 0.25)',
  rings = 1,
  ringDelay = 0.3,
  reduced = false,
}: RippleOnHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<RippleState>({ x: 0, y: 0, size: 0, token: 0 });

  const activate = (e?: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const x = pointerDriven && e ? e.clientX - rect.left : rect.width / 2;
    const y = pointerDriven && e ? e.clientY - rect.top : rect.height / 2;
    // Ring expands to ~3x the container diagonal at scale 2.5, clearly visible on hover.
    const size = Math.max(rect.width, rect.height) * 1.2;
    setRipple((prev) => ({ x, y, size, token: prev.token + 1 }));
  };

  const ringCount = rings < 1 ? 1 : Math.min(rings, 4);
  const hasRipple = ripple.token > 0 && ripple.size > 0;

  return (
    <div
      ref={ref}
      className={`water-ripple ${className}`}
      style={
        {
          '--ripple-color': rippleColor,
          '--ripple-x': `${ripple.x}px`,
          '--ripple-y': `${ripple.y}px`,
          '--ripple-size': `${ripple.size}px`,
        } as CSSProperties
      }
      onMouseEnter={activate}
      onMouseLeave={() => setRipple((p) => ({ ...p, token: 0 }))}
    >
      {hasRipple &&
        Array.from({ length: ringCount }).map((_, i) => (
          <span
            key={`${ripple.token}-${i}`}
            className="water-ripple__ring"
            style={{ animationDelay: `${i * ringDelay}s` }}
            aria-hidden="true"
          />
        ))}
      {children}
    </div>
  );
}
