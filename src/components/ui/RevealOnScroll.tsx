'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  [key: string]: unknown;
}

/**
 * Scroll-reveal wrapper: adds the `reveal-up` class on initial render (opacity 0 /
 * translated down) and toggles `is-visible` once the element scrolls into the
 * viewport, so the content fades + slides up. Honors prefers-reduced-motion via
 * the global stylesheet (reveal-up forced visible).
 */
export default function RevealOnScroll({
  children,
  className = '',
  as: Tag = 'div',
  delay = 0,
  ...rest
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Trigger as soon as the element enters the (adjusted) root, so very tall
      // elements (e.g. long blog posts) reveal on short mobile viewports where
      // 10% of the element can never fit in view.
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Comp = Tag as ElementType;
  return (
    <Comp
      ref={ref}
      className={`reveal-up ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Comp>
  );
}
