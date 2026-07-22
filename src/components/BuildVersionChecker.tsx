'use client';

import { useEffect } from 'react';

/** Endpoint returning the server's current build id. */
const BUILD_INFO_ENDPOINT = '/api/build-info';
/** Delay before the first check so we never block first paint / interaction. */
const FIRST_CHECK_DELAY_MS = 2000;
/** Delay before re-checking when the tab becomes visible again. */
const VISIBLE_CHECK_DELAY_MS = 2000;

declare global {
  interface Window {
    __BUILD_ID__?: string;
    __BUILT_AT__?: string;
  }
}

/**
 * Silently detects a server-side build version mismatch and reloads the page
 * when the deployed build has changed since the HTML was generated.
 *
 * This is the primary fix for the "Failed to find Server Action" errors that
 * made clicks hang / do nothing: after a redeploy, users with a cached page
 * hold Server Action IDs that no longer exist on the server. Reloading the
 * page swaps in the new bundle so interactions work again.
 *
 * The component renders no UI — it only triggers a reload when needed.
 */
export default function BuildVersionChecker(): null {
  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();
    let firstTimer: ReturnType<typeof setTimeout>;
    let visibleTimer: ReturnType<typeof setTimeout> | null = null;

    async function checkBuild(): Promise<void> {
      try {
        const res = await fetch(BUILD_INFO_ENDPOINT, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data: { buildId?: string; builtAt?: string } = await res.json();
        const serverBuildId = data.buildId ?? '';
        const clientBuildId = window.__BUILD_ID__ ?? '';
        // Only reload when both sides have a value and they differ. This avoids
        // spurious reloads in dev where __BUILD_ID__ might be 'dev' and the API
        // returns a time-based token, or vice-versa.
        if (
          !aborted &&
          serverBuildId &&
          clientBuildId &&
          serverBuildId !== clientBuildId
        ) {
          window.location.reload();
        }
      } catch {
        // Network errors are non-fatal — we retry on the next check / when the
        // tab becomes visible again.
      }
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState !== 'visible') return;
      if (visibleTimer) clearTimeout(visibleTimer);
      visibleTimer = setTimeout(checkBuild, VISIBLE_CHECK_DELAY_MS);
    };

    firstTimer = setTimeout(checkBuild, FIRST_CHECK_DELAY_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      aborted = true;
      controller.abort();
      clearTimeout(firstTimer);
      if (visibleTimer) clearTimeout(visibleTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
