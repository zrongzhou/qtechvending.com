'use client';

import { useEffect, useRef, useState } from 'react';

export interface CountUpProps {
  /** Target numeric value. */
  end: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Text shown before the number. */
  prefix?: string;
  /** Text shown after the number (e.g. "+", "/7"). */
  suffix?: string;
  /** Tailwind/utility classes for the wrapper span. */
  className?: string;
}

/**
 * Animates a number from 0 to `end` (easeOutCubic) the first time it scrolls
 * into view. Used for hero statistics and advantage step numbers.
 */
export default function CountUp({
  end,
  duration = 1500,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * end));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
