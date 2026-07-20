'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';

export interface ImageWithRetryProps {
  /** Image source URL. */
  src: string;
  /** Alt text for accessibility. */
  alt?: string;
  /**
   * Class applied to the underlying <Image> element (e.g. sizing, object-fit,
   * hover zoom). The component wraps it in a relative container so the
   * skeleton and fade-in overlay align correctly.
   */
  className?: string;
  /** Fallback shown after all retries fail. */
  fallbackSrc?: string;
  /** Maximum number of automatic retries before showing the fallback. */
  maxRetries?: number;
  /** Intrinsic width (optional). */
  width?: number | string;
  /** Intrinsic height (optional). */
  height?: number | string;
  /** Native loading strategy; defaults to lazy. */
  loading?: 'lazy' | 'eager';
  /** Set fetchPriority='high' for LCP / above-fold images. */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Optional inline style for the wrapper element. */
  style?: CSSProperties;
  /** Optional native event handler. */
  onClick?: () => void;
  /** Optional drag handler toggle. */
  draggable?: boolean;
  /** Next.js <Image> quality (1-100). Bypass the default 75 for crisp product shots. */
  quality?: number;
}

type Status = 'loading' | 'ready' | 'retrying' | 'failed';

// Incremental back-off between retries (ms): 500 → 1000 → 2000, then 2000.
const RETRY_DELAYS = [500, 1000, 2000];

/**
 * A Next.js <Image> replacement that shows a pulsing skeleton while loading,
 * retries failed loads with an increasing delay, and only falls back to
 * `fallbackSrc` once every retry is exhausted.
 *
 * Benefits over plain <img>:
 * - Automatic WebP/AVIF conversion (configured in next.config.mjs)
 * - Responsive sizing via deviceSizes/imageSizes
 * - Built-in priority prop for LCP optimization
 * - Blur placeholder support ready
 */
export default function ImageWithRetry({
  src,
  alt = '',
  className = '',
  fallbackSrc = '/images/og-default.svg',
  maxRetries = 3,
  width,
  height,
  loading = 'lazy',
  fetchPriority,
  style,
  onClick,
  draggable = true,
  quality,
}: ImageWithRetryProps) {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [status, setStatus] = useState<Status>('loading');
  const [retries, setRetries] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset whenever the source prop changes (e.g. gallery thumbnail switch).
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

  // 🔑 Critical fix: detect hydration race condition.
  // After SSR, the browser may have already loaded the image before React
  // hydrates and binds the onLoad listener. In that case img.complete === true
  // but onLoad never fires → permanent white screen (skeleton visible, img opacity-0).
  // We check complete on mount + after src changes to recover from this gap.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setStatus('ready');
      return;
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
  const imgStyle: CSSProperties = imgHidden ? { ...style, visibility: 'hidden' } : { ...style };

  // Whether current src has retry query params (bypass Next.js optimizer for those)
  const isRetrying = displaySrc.includes('__r=');

  // Determine sizing strategy
  const hasExplicitSize = width && height;
  const numWidth = typeof width === 'number' ? width : undefined;
  const numHeight = typeof height === 'number' ? height : undefined;

  return (
    <>
      {showSkeleton && (
        <div className="absolute inset-0 overflow-hidden animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
      {status === 'failed' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-400">
          {alt || 'image'}
        </div>
      )}
      <Image
        ref={imgRef as any}
        src={displaySrc}
        alt={alt}
        width={numWidth ?? (hasExplicitSize ? 0 : undefined)}
        height={numHeight ?? (hasExplicitSize ? 0 : undefined)}
        fill={!hasExplicitSize ? true : undefined}
        loading={loading}
        priority={fetchPriority === 'high'}
        fetchPriority={fetchPriority}
        unoptimized={isRetrying}
        quality={quality}
        draggable={draggable}
        onClick={onClick}
        onLoad={() => setStatus('ready')}
        onError={handleError}
        style={imgStyle}
        className={`transition-opacity duration-500 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </>
  );
}
