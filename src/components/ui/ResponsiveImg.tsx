'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface ResponsiveImgProps {
  /** Original image source URL (also used as the largest srcset entry). */
  src: string;
  /** Pre-generated responsive variants, e.g. from buildSrcSet(). */
  srcSet?: string;
  /** CSS `sizes` attribute describing the rendered width. */
  sizes?: string;
  /** Alt text for accessibility. */
  alt?: string;
  /**
   * Class applied to the underlying <img> element (sizing, object-fit, hover
   * zoom). The component renders the <img> directly (no wrapper) so the parent
   * layout controls positioning.
   */
  className?: string;
  /** Fallback shown after all retries fail. */
  fallbackSrc?: string;
  /** Maximum number of automatic retries before showing the fallback. */
  maxRetries?: number;
  /** Native loading strategy; defaults to lazy. */
  loading?: 'lazy' | 'eager';
  /** Set fetchPriority='high' for LCP / above-fold images. */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Optional inline style for the <img> element. */
  style?: CSSProperties;
  /** Optional click handler. */
  onClick?: () => void;
  /** Optional drag handler toggle. */
  draggable?: boolean;
  /** Native decoding hint passthrough (sync | async | auto). */
  decoding?: 'sync' | 'async' | 'auto';
  /** Optional external onLoad handler, invoked once the image has loaded. */
  onLoad?: () => void;
}

type Status = 'loading' | 'ready' | 'retrying' | 'failed';

// Incremental back-off between retries (ms): 500 -> 1000 -> 2000, then 2000.
const RETRY_DELAYS = [500, 1000, 2000];

/**
 * A native <img> replacement for pre-optimized, pre-generated responsive
 * variants (used by the above-the-fold hero carousel).
 *
 * Unlike next/image, a native <img> honours the `srcset`/`sizes` we provide
 * even when next.config sets `images.unoptimized: true` (next/image drops the
 * responsive srcset under unoptimized). This lets the browser download only the
 * width it needs.
 *
 * It keeps ImageWithRetry's production-safe behaviours:
 *  - a pulsing skeleton while loading,
 *  - automatic retries with increasing delay on error,
 *  - fallback to `fallbackSrc` once retries are exhausted,
 *  - a hydration-safe "complete" check so a server-already-loaded image does
 *    not get stuck on the skeleton (which previously caused a white screen).
 */
export default function ResponsiveImg({
  src,
  srcSet,
  sizes,
  alt = '',
  className = '',
  fallbackSrc = '/images/og-default.svg',
  maxRetries = 3,
  loading = 'lazy',
  fetchPriority,
  style,
  onClick,
  draggable = true,
  decoding = 'async',
  onLoad,
}: ResponsiveImgProps) {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [status, setStatus] = useState<Status>('loading');
  const [retries, setRetries] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset whenever the source prop changes (e.g. gallery / carousel switch).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplaySrc(src);
    setStatus('loading');
    setRetries(0);
  }, [src]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Hydration-safe recovery: if the image already finished loading before React
  // bound onLoad, img.complete is true but onLoad never fires -> would stay on
  // the skeleton forever. Detect and recover.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setStatus('ready');
    }
  }, [src, displaySrc]);

  const handleError = () => {
    if (displaySrc === fallbackSrc) {
      setStatus('failed');
      return;
    }
    if (retries < maxRetries) {
      setStatus('retrying');
      const delay = RETRY_DELAYS[retries] ?? 2000;
      timerRef.current = setTimeout(() => {
        const sep = src.includes('?') ? '&' : '?';
        setDisplaySrc(`${src}${sep}__r=${retries + 1}`);
        setRetries((r) => r + 1);
        setStatus('loading');
      }, delay);
    } else {
      setDisplaySrc(fallbackSrc);
      setStatus('loading');
    }
  };

  const showSkeleton = status !== 'ready' && status !== 'failed';
  const imgHidden = status === 'retrying';
  // The <img> renders at full opacity immediately (no gated fade). The
  // transparent skeleton (z-10) overlays it during load and is removed on
  // 'ready'. This complies with the project's 白屏闪铁律 (image must display
  // immediately) and avoids adding a fade gate in front of the LCP hero.
  const imgStyle: CSSProperties = {
    ...style,
    ...(imgHidden ? { visibility: 'hidden' as const } : null),
  };

  // During a retry the URL carries a __r= query; serve it directly without the
  // srcset so the retry actually re-fetches the original asset.
  const isRetrying = displaySrc.includes('__r=');

  return (
    <>
      {showSkeleton && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-transparent" aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-8 w-8 animate-spin text-cyan-400/40"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}
      {status === 'failed' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 text-xs text-slate-400">
          {alt || 'image'}
        </div>
      )}
      <img
        ref={imgRef}
        src={displaySrc}
        srcSet={isRetrying ? undefined : srcSet}
        sizes={isRetrying ? undefined : sizes}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        draggable={draggable}
        onClick={onClick}
        onLoad={() => {
          setStatus('ready');
          onLoad?.();
        }}
        onError={handleError}
        style={imgStyle}
        className={className}
      />
    </>
  );
}
