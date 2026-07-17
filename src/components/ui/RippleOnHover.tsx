'use client';

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';

export interface RippleOnHoverProps {
  children: ReactNode;
  /** Extra classes for the ripple container. */
  className?: string;
  /** true = ripple originates at the pointer; false = expands from center. */
  pointerDriven?: boolean;
  /** Ripple fill color (rgba). */
  rippleColor?: string;
  /** Disable the effect entirely (e.g. reduced-motion). */
  reduced?: boolean;
}

/**
 * Container that emits a soft radial "water ripple" bloom on hover. In
 * pointer-driven mode the bloom originates at the cursor; otherwise it expands
 * from the center. The visual is a CSS pseudo-element, so no layout cost. When
 * `reduced` is set the effect is a no-op.
 */
export default function RippleOnHover({
  children,
  className = '',
  pointerDriven = false,
  rippleColor = 'rgba(56, 189, 248, 0.25)',
  reduced = false,
}: RippleOnHoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  const activate = (e?: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const x = pointerDriven && e ? `${e.clientX - rect.left}px` : '50%';
    const y = pointerDriven && e ? `${e.clientY - rect.top}px` : '50%';
    // V32: larger bloom so the water ripple is clearly visible on hover.
    const size = Math.max(rect.width, rect.height) * (pointerDriven ? 3 : 2.2);
    el.style.setProperty('--ripple-x', x);
    el.style.setProperty('--ripple-y', y);
    el.style.setProperty('--ripple-size', `${size}px`);
    el.classList.add('ripple--active');
  };

  const deactivate = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('ripple--active');
  };

  return (
    <div
      ref={ref}
      className={`ripple ${className}`}
      style={{ '--ripple-color': rippleColor } as CSSProperties}
      onMouseEnter={activate}
      onMouseMove={pointerDriven ? activate : undefined}
      onMouseLeave={deactivate}
    >
      {children}
    </div>
  );
}
