/**
 * R2 回归测试 (T06 / T07 / T08) — qtechvending-local
 * 提交 93fa1d1 (R2: T06/T07/T08)
 *
 * 范围（仅验证 R2 三项，不触碰无关逻辑/文件）：
 *   T06 — 根布局透传 + html 下沉 + 内容页 ISR（门控2：getBaseUrl 去 headers）
 *   T07 — i18n messages 按 locale 服务端动态 import
 *   T08 — globals.css 非首屏动画抽 CSS 分块（禁区品牌动画原样保留）
 *
 * 设计依据：docs/architecture-r2-2026-07-23.md §0 铁律 / §5 验证 / §7 共享约定
 *
 * 运行：npx vitest run tests/r2-regression.test.ts
 *       （全量：npm test —— 注意 tests/blogFaq.test.ts 存在历史 tsc 类型错误，
 *         属预存在、非 R2 回归，vitest 以 esbuild 转译不校验类型，不影响本套件）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---------------------------------------------------------------------------
// Mocks：让 seo.ts 在测试环境可导入，且若 getBaseUrl 仍调用 headers() 必暴露
// ---------------------------------------------------------------------------
vi.mock('@/lib/data', () => ({ getSiteSetting: vi.fn() }));
vi.mock('@/lib/site-config', () => ({
  SITE_CONFIG: {
    name: 'Qtech',
    defaultTitle: '',
    defaultDescription: '',
    keywords: [],
    ogImage: '',
    twitterHandle: '',
    company: '',
    phone: '',
    email: '',
    sameAs: [],
  },
}));
// 若任何代码路径仍调用 headers()，直接抛错以便测试捕获（T06 门控2 不应再触发）。
vi.mock('next/headers', () => ({
  headers: vi.fn(() => {
    throw new Error('headers() was called — T06 门控2 回归！');
  }),
  cookies: vi.fn(() => {
    throw new Error('cookies() was called');
  }),
}));

// 必须在 mocks 注册之后导入
import { getBaseUrl } from '@/lib/seo';
import { headers as mockHeaders } from 'next/headers';

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_BASE_URL;
  vi.clearAllMocks();
});

// ===========================================================================
// T06 门控2 — getBaseUrl() 不再调用 headers()
// ===========================================================================
describe('T06 门控2 — getBaseUrl() 不再依赖 headers()', () => {
  it('NEXT_PUBLIC_BASE_URL 已设置 → 返回规范 URL（去除尾部斜杠），不调用 headers', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://www.qtechvending.com/';
    const result = getBaseUrl();
    expect(result).toBe('https://www.qtechvending.com');
    expect(mockHeaders).not.toHaveBeenCalled();
  });

  it('NEXT_PUBLIC_BASE_URL 未设置 → 返回空串（确定性，不调用 headers，不抛错）', () => {
    const result = getBaseUrl();
    expect(result).toBe('');
    expect(mockHeaders).not.toHaveBeenCalled();
  });

  it('NEXT_PUBLIC_BASE_URL 无尾部斜杠 → 原样返回，仍不调用 headers', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    expect(getBaseUrl()).toBe('https://example.com');
    expect(mockHeaders).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// T06 — 根布局透传 + html 下沉（静态校验源码不变量）
// ===========================================================================
describe('T06 — 根布局透传 / html 下沉（静态校验）', () => {
  const rootLayout = read('src/app/layout.tsx');
  const localeLayout = read('src/app/[locale]/layout.tsx');
  const xiaozhou = read('src/app/xiaozhouBackend/layout.tsx');

  it('根 layout.tsx 不再 import headers 且为纯透传（无 html/body，return children）', () => {
    expect(rootLayout).not.toContain("import { headers }");
    expect(rootLayout).not.toContain('next/headers');
    expect(rootLayout).not.toContain('resolveLocale');
    expect(rootLayout).not.toContain('VALID_LOCALES');
    expect(rootLayout).not.toContain('escapeForInlineScript');
    expect(rootLayout).not.toContain('BUILD_ID');
    // 透传
    expect(rootLayout).toContain('return children;');
    // 不得渲染 html/body 元素（已下沉到 [locale]；注释中的 <html>/<body> 字样不计）
    expect(rootLayout).not.toContain('<html lang');
    expect(rootLayout).not.toContain('<body className');
  });

  it('[locale]/layout.tsx 渲染正确 html lang/dir，body className 一字不变', () => {
    expect(localeLayout).toContain('lang={activeLocale}');
    expect(localeLayout).toContain("dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}");
    expect(localeLayout).toContain('suppressHydrationWarning');
    expect(localeLayout).toContain(
      'className="flex min-h-screen flex-col bg-slate-50 text-ink-800 antialiased"',
    );
    // BUILD_ID <script> 与 <BuildVersionChecker /> 必须在 body 内
    expect(localeLayout).toContain('<BuildVersionChecker />');
    expect(localeLayout).toContain('window.__BUILD_ID__');
    // 透传给 LocaleShell
    expect(localeLayout).toContain('<LocaleShell');
  });

  it('xiaozhouBackend/layout.tsx 补 <html lang="en"><body>（根透传后 admin 自包含）', () => {
    expect(xiaozhou).toContain('<html lang="en">');
    expect(xiaozhou).toContain('<body');
    expect(xiaozhou).toContain('noindex');
  });

  it('9 个内容页 force-dynamic → revalidate=300，contact 保持 force-dynamic', () => {
    const pages = [
      'src/app/[locale]/page.tsx',
      'src/app/[locale]/about/page.tsx',
      'src/app/[locale]/blog/page.tsx',
      'src/app/[locale]/blog/[slug]/page.tsx',
      'src/app/[locale]/category/[slug]/page.tsx',
      'src/app/[locale]/faq/page.tsx',
      'src/app/[locale]/products/page.tsx',
      'src/app/[locale]/products/[...slug]/page.tsx',
      'src/app/[locale]/solutions/page.tsx',
    ];
    for (const p of pages) {
      const src = read(p);
      expect(src, `${p} 应设 revalidate=300`).toContain('export const revalidate = 300;');
      expect(src, `${p} 不应再 force-dynamic`).not.toContain("export const dynamic = 'force-dynamic';");
    }
    const contact = read('src/app/[locale]/contact/page.tsx');
    expect(contact).toContain("export const dynamic = 'force-dynamic';");
  });
});

// ===========================================================================
// T07 — i18n messages 按 locale 服务端动态 import
// ===========================================================================
describe('T07 — messages 服务端动态 import（静态校验）', () => {
  const localeLayout = read('src/app/[locale]/layout.tsx');
  const localeShell = read('src/components/LocaleShell.tsx');

  it('[locale]/layout.tsx 服务端 await import 当前 locale messages 并取 .default', () => {
    expect(localeLayout).toContain('await import(');
    expect(localeLayout).toContain('`@/messages/${activeLocale}.json`');
    expect(localeLayout).toContain('.default');
    expect(localeLayout).toContain('initialMessages');
  });

  it('LocaleShell 客户端切换使用动态 import + 骨架占位（无英文 FOUC）', () => {
    expect(localeShell).toContain('loadMessagesOnSwitch');
    expect(localeShell).toContain('`@/messages/${next}.json`');
    // 加载态骨架占位（loading 时渲染中性占位，不显示英文）
    expect(localeShell).toContain('setLoading(true)');
    expect(localeShell).toContain('loading ?');
  });

  it('LocaleShell 保留 LocaleProvider + 字体 link + JsonLd + Navbar/main/Footer/BackToTop', () => {
    expect(localeShell).toContain('<LocaleProvider');
    expect(localeShell).toContain('fonts.googleapis.com');
    expect(localeShell).toContain('<JsonLd');
    expect(localeShell).toContain('<Navbar />');
    expect(localeShell).toContain('<main className="flex-1">');
    expect(localeShell).toContain('<Footer />');
    expect(localeShell).toContain('<BackToTop />');
  });
});

// ===========================================================================
// T08 — globals.css 拆分（禁区品牌动画原样保留 + 抽取完整 + 消费组件 import）
// ===========================================================================
describe('T08 — globals.css 拆分（静态校验）', () => {
  const globals = read('src/app/globals.css');
  const deferred = read('src/styles/animations-deferred.css');

  // §7 禁区品牌 keyframes —— 必须仍留在 globals.css
  const FORBIDDEN_KEYFRAMES = [
    'fireworkCore',
    'fireworkParticle',
    'glacierAurora',
    'glacierAurora2',
    'glacierRay',
    'glacierMist',
    'glacierSparkle',
    'skyCloudDrift',
    'footerTwinkle',
    'footerDrift',
    'pulseBorderLine',
    'trustShockSweep',
    'pulseSoft',
    'card-beam-sweep',
    'statSheen',
    'iconGlow',
    'trustBorderPulse',
    'auroraFlowA',
    'auroraFlowB',
    'auroraFlowC',
    'auroraFlowD',
    'oceanWave',
    'bubbleRise',
    'waveShimmer',
  ];

  it('globals.css 保留全部禁区品牌 @keyframes', () => {
    for (const kf of FORBIDDEN_KEYFRAMES) {
      expect(globals, `globals.css 缺失禁区 @keyframes ${kf}`).toContain(`@keyframes ${kf}`);
    }
  });

  it('globals.css 保留禁区品牌类名（fireworks/glacier/clouds/footer-fireflies/card pulse/aurora/ocean/cta）', () => {
    const forbiddenClasses = [
      '.fireworks',
      '.glacier',
      '.cta-sky__cloud',
      '.footer-fireflies',
      '.animate-pulse-border',
      '.trust-shimmer',
      '.aurora__band',
      '.ocean-wave',
      '.cta-aqua',
      '.cta-sunrise',
      '.portal-ring',
    ];
    for (const c of forbiddenClasses) {
      expect(globals, `globals.css 缺失禁区类名 ${c}`).toContain(c);
    }
  });

  // 被搬走的类（不含品牌重叠的 .firefly，其 @keyframes firefly 仅存在于 deferred.css）
  const MOVED_CLASSES = [
    'village-star',
    'window-glow',
    'moon-glow',
    'icon-float',
    'icon-shimmer',
    'pill-pulse',
    'ripple',
    'ripple-ring',
    'water-ripple',
    'god-ray',
    'flow-bar',
    'animate-float-slow',
    'animate-float-gentle',
    'animate-slide-up',
    'animate-spin-slow',
    'value-badge',
  ];
  const MOVED_KEYFRAMES = [
    'villageStar',
    'windowGlow',
    'moonGlow',
    'firefly',
    'iconFloatY',
    'iconShimmer',
    'pillPulse',
    'rippleRing',
    'waterRippleExpand',
    'godRaySway',
    'flowBar',
    'floatSlow',
    'floatGentle',
    'slideUpFade',
    'spinSlow',
    'badgeBreath',
  ];

  it('animations-deferred.css 定义全部搬走的类与 @keyframes', () => {
    for (const c of MOVED_CLASSES) {
      expect(deferred, `deferred.css 缺失类 .${c}`).toContain(`.${c}`);
    }
    for (const kf of MOVED_KEYFRAMES) {
      expect(deferred, `deferred.css 缺失 @keyframes ${kf}`).toContain(`@keyframes ${kf}`);
    }
  });

  it('globals.css 不再定义被搬走的类（拆分彻底，无重复定义导致闪烁）', () => {
    for (const c of MOVED_CLASSES) {
      // 词边界匹配，避免 .footer-firefly 与 .firefly 的误判
      const re = new RegExp(`\\.${c.replace(/[-]/g, '\\-')}\\s*\\{`);
      expect(globals, `globals.css 仍残留被搬走类 .${c}`).not.toMatch(re);
    }
  });

  it('每个搬走类名的消费组件已 import 新分块（无丢类名导致样式缺失）', () => {
    const consumers: Record<string, string> = {
      'flow-bar': 'src/app/[locale]/about/AboutClient.tsx',
      'value-badge': 'src/app/[locale]/about/AboutClient.tsx',
      'icon-float': 'src/components/ui/IconTile.tsx',
      'icon-shimmer': 'src/components/ui/IconTile.tsx',
      'animate-spin-slow': 'src/components/home/AdvantagesSection.tsx',
      'ripple': 'src/components/ui/RippleOnHover.tsx',
      'water-ripple': 'src/components/ui/RippleOnHover.tsx',
      'god-ray': 'src/app/[locale]/qa-products/page.tsx',
    };
    for (const [cls, file] of Object.entries(consumers)) {
      const content = read(file);
      expect(
        content,
        `${file} 必须 import '@/styles/animations-deferred.css'（类 .${cls} 已抽离）`,
      ).toContain("import '@/styles/animations-deferred.css'");
    }
  });
});
