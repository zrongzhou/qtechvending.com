/**
 * QA verification test for src/lib/seo.ts — generatePageMetadata (perf/seo round 1:
 * commits 2d5ac48 + b5f7797).
 *
 * Verifies the S-01/S-03/S-04 locale behaviour introduced in this round:
 *   - canonical / og:url include the locale segment (e.g. /en/about, /zh)
 *   - alternates.languages emit ABSOLUTE hreflang (en / zh-CN / ar / x-default)
 *   - openGraph.locale maps zh->zh_CN, ar->ar, else en_US
 *   - default title/description/keywords resolve per-locale with en fallback
 *   - STATIC_TITLES localises the six static marketing routes
 *
 * `next/headers` is never exercised (NEXT_PUBLIC_BASE_URL is set), and
 * `@/lib/data` (getSiteSetting) + `@/lib/site-config` (SITE_CONFIG) are mocked.
 *
 * Run: npx vitest run tests/seo.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const MOCK_SETTING = {
  defaultTitle: {
    en: 'Qtech — Global Vending',
    zh: 'Qtech — 全球智能售货机',
    ar: 'Qtech — أجهزة البيع الذكية',
  },
  defaultDescription: {
    en: 'Default description EN',
    zh: '默认描述 ZH',
    ar: 'الوصف الافتراضي AR',
  },
  keywords: {
    en: ['vending', 'machine'],
    zh: ['售货机', '自动售卖'],
    ar: ['بيع', 'آلة'],
  },
  ogImage: '/images/og-default.svg',
  twitterHandle: '@qtech',
  company: { en: 'Qtech' },
  phone: '',
  email: '',
  sameAs: [],
};

vi.mock('@/lib/data', () => ({
  getSiteSetting: vi.fn(),
}));

vi.mock('@/lib/site-config', () => ({
  SITE_CONFIG: {
    name: 'Qtech',
    defaultTitle: 'Fallback Title',
    defaultDescription: 'Fallback Description',
    keywords: ['fallback-keyword'],
    ogImage: '/images/og-default.svg',
    twitterHandle: '@qtech',
    company: 'Qtech',
    phone: '',
    email: '',
    sameAs: [],
  },
}));

// Import AFTER mocks are registered.
import { generatePageMetadata } from '@/lib/seo';
import { getSiteSetting } from '@/lib/data';

const BASE = 'https://www.qtechvending.com';

beforeEach(() => {
  process.env.NEXT_PUBLIC_BASE_URL = BASE;
  (getSiteSetting as any).mockResolvedValue(MOCK_SETTING);
});

describe('generatePageMetadata — locale in canonical / og:url', () => {
  it('path "/about" + locale "en" => canonical https://.../en/about', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'en' });
    expect(m.alternates?.canonical).toBe(`${BASE}/en/about`);
    expect((m.openGraph as any).url).toBe(`${BASE}/en/about`);
  });

  it('path "/" + locale "zh" => canonical https://.../zh (no double slash)', async () => {
    const m = await generatePageMetadata({ path: '/', locale: 'zh' });
    expect(m.alternates?.canonical).toBe(`${BASE}/zh`);
    expect((m.openGraph as any).url).toBe(`${BASE}/zh`);
  });

  it('path "/products" + locale "ar" => canonical https://.../ar/products', async () => {
    const m = await generatePageMetadata({ path: '/products', locale: 'ar' });
    expect(m.alternates?.canonical).toBe(`${BASE}/ar/products`);
  });
});

describe('generatePageMetadata — hreflang alternates', () => {
  it('emits absolute en / zh-CN / ar + x-default (= en)', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'en' });
    const langs = m.alternates?.languages as Record<string, string>;
    expect(langs.en).toBe(`${BASE}/en/about`);
    expect(langs['zh-CN']).toBe(`${BASE}/zh/about`);
    expect(langs.ar).toBe(`${BASE}/ar/about`);
    expect(langs['x-default']).toBe(`${BASE}/en/about`);
  });

  it('x-default always points at the English variant even for zh locale', async () => {
    const m = await generatePageMetadata({ path: '/faq', locale: 'zh' });
    const langs = m.alternates?.languages as Record<string, string>;
    expect(langs['x-default']).toBe(`${BASE}/en/faq`);
    expect(langs.en).toBe(`${BASE}/en/faq`);
  });
});

describe('generatePageMetadata — openGraph.locale mapping', () => {
  it('zh -> zh_CN', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'zh' });
    expect((m.openGraph as any).locale).toBe('zh_CN');
  });
  it('ar -> ar', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'ar' });
    expect((m.openGraph as any).locale).toBe('ar');
  });
  it('en (default) -> en_US', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'en' });
    expect((m.openGraph as any).locale).toBe('en_US');
  });
});

describe('generatePageMetadata — STATIC_TITLES localisation', () => {
  it('/about uses the locale-specific static title as the bare <title>', async () => {
    const en = await generatePageMetadata({ path: '/about', locale: 'en' });
    expect(en.title).toBe('About Qtech Vending | Smart Vending Machine Manufacturer');
    const zh = await generatePageMetadata({ path: '/about', locale: 'zh' });
    expect(zh.title).toBe('关于 Qtech 智能售货机 | 自助售卖设备制造商');
  });

  it('all six static routes have a title (about/products/solutions/contact/faq/blog)', async () => {
    const paths = ['/about', '/products', '/solutions', '/contact', '/faq', '/blog'];
    for (const p of paths) {
      const m = await generatePageMetadata({ path: p, locale: 'en' });
      expect(typeof m.title).toBe('string');
      expect((m.title as string).length).toBeGreaterThan(0);
    }
  });

  it('dynamic route still honours a caller-supplied title', async () => {
    const m = await generatePageMetadata({
      path: '/products/foo',
      locale: 'en',
      title: 'My Product',
    });
    expect(m.title).toBe('My Product');
  });
});

describe('generatePageMetadata — per-locale defaults + fallback', () => {
  it('keywords fall back to setting.keywords[locale] when none supplied', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'zh' });
    expect(m.keywords).toBe('售货机, 自动售卖');
  });

  it('description uses setting.defaultDescription for the active locale', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'ar' });
    expect(m.description).toBe('الوصف الافتراضي AR');
  });

  it('noindex produces robots index:false', async () => {
    const m = await generatePageMetadata({ path: '/about', locale: 'en', noindex: true });
    expect((m.robots as any).index).toBe(false);
    expect((m.robots as any).follow).toBe(true);
  });
});
