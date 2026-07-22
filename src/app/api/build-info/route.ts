import { NextResponse } from 'next/server';

// Always resolve at request time — this endpoint must never be cached so the
// client can detect a freshly deployed build immediately.
export const dynamic = 'force-dynamic';

/**
 * Resolve the current server build identifier.
 *
 * Precedence:
 *   1. NEXT_PUBLIC_BUILD_ID — injected at build time via next.config.mjs `env`.
 *   2. GIT_COMMIT — supplied by the deployment pipeline when present.
 *   3. A time-based token — last-resort fallback so the value is always set.
 */
function resolveBuildId(): string {
  if (process.env.NEXT_PUBLIC_BUILD_ID) return process.env.NEXT_PUBLIC_BUILD_ID;
  if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT;
  return Date.now().toString(36);
}

/**
 * Exposes the server's build id so the client-side BuildVersionChecker can
 * detect when a new deployment has gone live and the cached HTML/JS (with
 * stale Server Action IDs) should be reloaded.
 */
export async function GET(): Promise<Response> {
  return NextResponse.json(
    { buildId: resolveBuildId(), builtAt: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
