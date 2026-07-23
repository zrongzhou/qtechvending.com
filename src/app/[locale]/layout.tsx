import type { Locale } from '@/lib/i18n';
import { locales } from '@/lib/i18n';
import LocaleShell from '@/components/LocaleShell';
import BuildVersionChecker from '@/components/BuildVersionChecker';

/**
 * Resolves the active locale from the route segment. Falls back to `en` for
 * any unknown segment (the middleware guarantees a valid locale prefix, but we
 * stay defensive for direct renders / static generation).
 */
function resolveLocale(locale: string): Locale {
  return (locales as readonly string[]).includes(locale) ? (locale as Locale) : 'en';
}

/**
 * Escapes a value for safe embedding inside a single-quoted inline <script>.
 * Build IDs only contain [A-Za-z0-9-], but we still neutralise quotes and
 * backslashes to stay defensive against any future value source.
 */
function escapeForInlineScript(value: string): string {
  return value.replace(/['"\\]/g, '\\$&');
}

// Build id injected at build time via next.config.mjs `env.NEXT_PUBLIC_BUILD_ID`.
// Falls back to the deployment pipeline's GIT_COMMIT, then 'dev' for local runs
// where the value was not inlined.
const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ?? process.env.GIT_COMMIT ?? 'dev';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  const activeLocale = resolveLocale(locale);

  // Server-side load of ONLY the active locale's messages. The JSON is shipped
  // with the RSC payload so the first byte of HTML already carries the correct
  // language copy — no English FOUC and SEO text is present in the initial
  // response. Each locale becomes its own client chunk (no three-language
  // bundle). T07 of the R2 plan.
  const initialMessages = (await import(
    `@/messages/${activeLocale}.json`
  )).default as Record<string, string>;

  // Reflects the moment this HTML response was rendered (informational only;
  // the client compares buildId, not builtAt).
  const builtAt = new Date().toISOString();

  return (
    <html
      lang={activeLocale}
      dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-slate-50 text-ink-800 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_ID__='${escapeForInlineScript(
              BUILD_ID,
            )}';window.__BUILT_AT__='${escapeForInlineScript(builtAt)}';`,
          }}
        />
        <LocaleShell locale={activeLocale} initialMessages={initialMessages}>
          {children}
        </LocaleShell>
        <BuildVersionChecker />
      </body>
    </html>
  );
}
