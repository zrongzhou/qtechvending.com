# 性能体检报告 — QtechVending 三语站点（2026-07-23）

> 审计对象：`qtechvending-local/`（Next.js App Router，三语 en/zh/ar）
> 审计人：架构师 高见远（基于源码实地核对，非凭空推断）
> 配套报告：`seo-2026-07-23.md`

---

## 0. 品牌动画禁区清单（任何优化不得触碰 / 降级）

以下文件与 CSS 类为**品牌视觉核心**，任何性能优化**不得**加 `animation:none`、不得移除元素、不得降低粒子数 / 频率、不得削弱观感。允许的处理**仅限"可见性门控"（IntersectionObserver 等不改变视觉输出的手段）**。

- **Fireworks**：`src/components/Fireworks.tsx` + `globals.css` 中 `.fireworks` / `@keyframes firework*` 相关类
- **Glacier**：`src/components/IceCrystals.tsx` + `.glacier*`
- **Clouds**：`.cta-sky__cloud` / `@keyframes skyCloudDrift`
- **Fireflies**：`src/components/layout/Footer.tsx` 中 `.footer-fireflies`
- **Card pulse**：`.animate-pulse-border` / `.pulseBorderLine`、`.glass-ice.animate-pulse-border`、`.trust-shimmer`、`.glass-surface.pulse-soft`、`.card-beam-sweep`、`.stat-number-anim`
- **背景画布**：`src/components/ui/Starfield.tsx`、`src/components/ui/AuroraBackground.tsx`、`src/components/ui/OceanBubbles.tsx`
- **CTA 各场景**：`.cta-aqua` / `.cta-sunrise` / `.cta-sky` / `.cta-bird` / `.portal-*`

**结论**：本报告所有建议均遵守禁区约束；第 P2-A 项的 rAF 门控为"可见性门控"，不改变观感，属于允许范围。

---

## 1. 现状总览

站点采用 Next.js App Router，根布局 `src/app/layout.tsx` 为 Server Component，子布局 `src/app/[locale]/layout.tsx` 为 Client Component。三语通过 `[locale]` 段路由 + `params.locale` 实现。图片体系以 `next/image`（`ImageWithRetry`）为主，但仍有少量原生 `<img>`；品牌装饰大量使用 Canvas（Starfield / OceanBubbles 等）。公共只读 API（products / blogs / categories）均为 `force-dynamic`。

最大、最根本的性能瓶颈是**根布局在组件体内调用 `headers()`**，使整个站点被强制按请求动态渲染，无法走 SSG / ISR（详见 P0-A）。其余多为"资源体积 / 首屏渲染阻塞 / 缓存策略"层面的中等优化点。

---

## 2. 问题（按严重程度分级）

### 🔴 高（P0）

#### P0-A 根布局 `headers()` 强制全站动态渲染（核心瓶颈）
- **文件定位 + 行号**：`src/app/layout.tsx`
  - L2：`import { headers } from 'next/headers';`
  - L40-51：`resolveLocale()` 内部调用 `headers().get('x-pathname')`
  - L73：`const { locale, dir } = resolveLocale();`（在 RootLayout 组件体内、每次请求执行）
- **问题**：根布局是**所有页面的祖先布局**。在 App Router 中，只要祖先布局依赖动态 API（`headers()`、`cookies()`、`searchParams` 等），整条路由都会被标记为动态渲染——**即使子页面删除 `export const dynamic='force-dynamic'` 也会被根布局锁死**。实测全站 `src/app/[locale]/**/page.tsx` 均带 `force-dynamic`，根布局这一处又是最底层的"死锁"，导致任何内容页都无法 SSG / ISR，每次请求都重新渲染服务端组件并重新查库。这是**投入产出比最高**的优化点。
- **具体建议**：
  1. 删除根布局中对 `headers()` 的调用（L2、L40-51、L73 的 `resolveLocale` 逻辑）。
  2. 将 `<html lang dir>` 的下发下沉到 `src/app/[locale]/layout.tsx`：该组件已通过 `params.locale` 拿到语言（`L27-28`），可在 `useEffect` 内或直接设置 `<html lang={activeLocale} dir={...}>`。为此需把 `<html>/<body>` 从根布局上移到 `[locale]/layout.tsx`（根布局改为只返回 `children` 的透传布局），这是 App Router i18n 的标准做法。
  3. 内容页改为 `export const revalidate = 300`（或 `generateStaticParams` 预生成 en/zh/ar），对带 `params.slug` 的产品 / 博客 / 分类页预渲染。
  4. 中间件注入的 `x-pathname` 头如仍需要，可在 `[locale]/layout.tsx` 客户端通过 `usePathname()` 取，而非服务端 `headers()`。

### 🟠 中（P1）

#### P1-A 字体：渲染阻塞的 Google Fonts `<link>` 全量下发三语种
- **文件定位 + 行号**：`src/app/[locale]/layout.tsx` L56-61（`<link rel="preconnect">` ×2 + L58-61 的 `css2?family=Inter&Noto+Sans+SC&Noto+Sans+Arabic&display=swap` 样式表）
- **问题**：在 `<head>` 同步加载的 Google Fonts 样式表会**阻塞首次渲染**（render-blocking），且一次性请求了 Inter + Noto Sans SC + Noto Sans Arabic 三套字体（含全部字重 400/500/600/700），对首屏 LCP 与 TTI 均有拖累；非中文 / 非阿语用户也被迫下载不需要的子集。
- **具体建议**：
  1. 迁移到 `next/font/google`：自托管、构建期内联、`font-display: swap`、按 `subsets` 子化（Inter→latin，Noto Sans SC→chinese-simplified，Noto Sans Arabic→arabic）。
  2. 或按 `locale` 条件加载：仅在 `locale==='zh'` 时加载 Noto Sans SC，仅 `ar` 时加载 Noto Sans Arabic，避免无谓下发。
  3. 移除 / 保留 `preconnect` 即可，避免主文档渲染被字体 CSS 阻塞。

#### P1-B i18n：三套 messages 全量进入客户端包（约 69.8KB）
- **文件定位 + 行号**：`src/app/[locale]/layout.tsx` L10-18（`import enMessages/zhMessages/arMessages` 并组装 `MESSAGES` 常量；L45 `const messages = MESSAGES[currentLocale]` 注入 Provider）
- **问题**：三个语言包原始体积合计 **69,787 字节**（en 21,576 + zh 21,212 + ar 26,999），因在 **Client Component** 布局中静态 `import`，会**整体打包进客户端 chunk 并随每个 locale 的页面下发**——即中文用户也下载了 ar/en 全量文案，反之亦然。
- **具体建议**：
  1. 改为**按 locale 动态 `import()`**：在 `useEffect` 内依据 `currentLocale` 懒加载对应 `messages/<locale>.json`，仅当前语言进入客户端包。
  2. 或将 messages 改为服务端读取（`getMessages(locale)` 在 Server Component / RSC 中读取后透传），避免进入客户端包。
  3. 注意：`[locale]/layout.tsx` 是 `'use client'`，动态 import 需在客户端完成；若上移逻辑到 Server 端更彻底。

#### P1-C 原生 `<img>` 绕过 `next/image`（失去 webp/avif、响应式、懒加载优化）
- **文件定位 + 行号**：
  - `src/components/about/FactoryShowcase.tsx` **L70**（主轮播图 `<img>`）、**L124**（缩略图 `<img>`）
  - `src/components/home/CaseGallerySection.tsx` **L96-97**（首帧 `<img>`，`eslint-disable @next/next/no-img-element`）
  - `src/app/[locale]/products/[...slug]/ProductDetailView.tsx` **L431**（灯箱大图 `<img>`）
  - `src/app/[locale]/about/AboutClient.tsx` **L1475**（资质证书实拍 `<img>`）
- **问题**：原生 `<img>` 绕过 `next.config` 已配置的 `images.formats: ['image/webp','image/avif']`（L54）与 `deviceSizes`，无法享受自动格式转换、响应式 `srcset`、内置懒加载与 `priority` LCP 优化；部分（FactoryShowcase、CaseGallerySection 首帧）虽手动加了 `loading=eager/decoding=sync/fetchPriority=high`，但仍是原始格式、无尺寸优化。
- **具体建议**：
  1. 统一改用 `src/components/ui/ImageWithRetry.tsx`（`next/image` 封装，已支持 `priority`/`fetchPriority`/`loading`/`quality`/重试兜底）。
  2. 首屏图（FactoryShowcase 首帧、CaseGallerySection 首帧、AboutClient 证书图）保留 `loading="eager"` + `fetchPriority="high"`，与现有 Hero LCP 策略一致。
  3. 其余（缩略图、灯箱）使用默认 `loading="lazy"`。
  4. 注意：`ImageWithRetry` 走 `next/image` 优化管线，需确保图源在 `public/images` 本地路径（当前已是），无需 `remotePatterns`。

#### P1-D 公共只读 API：`force-dynamic` + 默认 `no-store`（无法 CDN/边缘缓存）
- **文件定位 + 行号**：
  - `src/app/api/products/route.ts` L4 `export const dynamic = 'force-dynamic'`
  - `src/app/api/blogs/route.ts` L4 `export const dynamic = 'force-dynamic'`
  - `src/app/api/categories/route.ts` L4 `export const dynamic = 'force-dynamic'`
  - （其余 `[slug]` 详情接口同理）
- **问题**：这些为**公共只读**列表 / 详情接口，但被强制 `force-dynamic`，且处理器未显式设置 `Cache-Control`。Next.js 对此类动态 GET 路由处理器默认下发 `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`，导致 CDN / 边缘节点**完全无法缓存**，每次访问都打到源站 + 数据库。
- **具体建议**：
  1. 在响应上显式加：`Cache-Control: public, s-maxage=300, stale-while-revalidate=600`（允许边缘缓存 5 分钟、过期后后台再验证）。
  2. 内容更新时效要求不高的列表 / 分类接口可放大 `s-maxage`（如 600）。
  3. 若强一致性要求，保留 `no-store` 仅用于写接口（admin/*、contact）；公共只读接口与写接口应**区分**缓存策略。
  4. 当前 `next.config.mjs` 的 `headers()` 对 `/api/*` 显式排除（L71-75），因此不会与路由内 `Cache-Control` 冲突——加在路由处理器内即可生效。

#### P1-E 全局样式：`globals.css` 约 2106 行，动画 CSS 全量下发
- **文件定位 + 行号**：`src/app/globals.css`（共 **2106** 行，含大量 `@keyframes` 与品牌动画类）
- **问题**：`globals.css` 经根布局 `import './globals.css'`（L3）全局引入，所有动画 / 关键帧随首屏 CSS 全量下发，其中相当部分为长尾组件（CTA、卡片脉冲等）使用，首屏并不需要。
- **具体建议**：
  1. 将**非首屏、组件局部**的动画样式抽成 **CSS Module**（`*.module.css`），仅随对应组件按需加载。
  2. 首屏必需的基础样式保留在 `globals.css`。
  3. ⚠️ 抽离时**不得**改动禁区清单（第 0 节）中的任何类 / 关键帧名称与动画逻辑，仅做"文件切分"，不得加 `animation:none`。

### 🟡 低（P2）

#### P2-A 品牌 Canvas（Starfield / OceanBubbles）视口外仍跑 rAF
- **文件定位 + 行号**：
  - `src/components/ui/Starfield.tsx` L550-562：`loop()` 通过 `requestAnimationFrame` 持续 `draw()`，无可见性判断；L558-562 即使 `isReduced` 也仅画一帧，否则永久 rAF。
  - `src/components/ui/OceanBubbles.tsx` L155-173：`tick()` 持续 rAF 重绘气泡，L69 仅在 `prefers-reduced-motion` 时停。
- **问题**：当画布所在区块滚动到视口外时，rAF 仍在后台持续绘制（每帧 `clearRect` + 重绘星 / 气泡），产生**无谓的 CPU / 电量消耗**（尤其移动端、长页面）。二者均为装饰性背景（`aria-hidden`），用户不可见时绘制毫无意义。
- **具体建议（可见性门控，属禁区允许范围）**：
  1. 用 `IntersectionObserver` 监听 `wrapRef`/`canvas` 容器：进入视口 `raf = requestAnimationFrame(loop)`，离开视口 `cancelAnimationFrame(raf)` 并暂停循环。
  2. 不改任何绘制逻辑、粒子数、频率、配色——仅控制"是否运行循环"，**观感零变化**。
  3. 保留 `prefers-reduced-motion` 与 `reduced` prop 的现有短路逻辑。

#### P2-B 图片优化管线被部分绕过（极少量 `unoptimized`）
- **文件定位 + 行号**：`src/components/home/CaseGallerySection.tsx` L115（`unoptimized`）、L210（灯箱 `unoptimized`）
- **问题**：画廊与灯箱图显式 `unoptimized`，跳过 `next/image` 的 webp/avif 自动转换（虽图源已是本地 webp）。影响较小，但首屏首帧若用 `unoptimized` 原始大图会拖累 LCP。
- **具体建议**：首帧保留 `next/image` 优化（移除 `unoptimized`），仅对非关键缩略图 / 灯箱可保持现状；如首帧为 LCP 候选，务必 `priority` + 优化格式。

---

## 3. 已良好项（保持，勿改动）

- `next.config.mjs` L54：`images.formats: ['image/webp','image/avif']` ✅
- `next.config.mjs` L24：`reactStrictMode: true` ✅
- `next.config.mjs` L96：`compress: true` ✅
- `next.config.mjs` L84：静态资源 `Cache-Control: public, max-age=604800, immutable`（7 天不可变）✅
- Hero 首屏 LCP 图已用 `eager` + `fetchPriority="high"`（见 `CaseGallerySection` 首帧注释 V49.4）✅
- `ImageWithRetry` 已具备重试 / 骨架 / `priority` 能力，可承接 P1-C 迁移 ✅

---

## 4. 执行优先级建议

| 优先级 | 项 | 预期收益 | 风险 |
|--------|----|----------|------|
| **P0（先做）** | P0-A 移除根布局 `headers()`、下沉 locale 解析 + `revalidate` | 全站可 SSG/ISR，TTFB/源站压力大幅下降 | 需调整 `<html>` 归属，需回归 RTL |
| P1 | P1-A 字体 `next/font` / 按 locale 加载 | 消除渲染阻塞，首屏更快 | 字体回退排版需核验 |
| P1 | P1-C 原生 `<img>` → `ImageWithRetry` | 自动 webp/avif、响应式、懒加载 | 低 |
| P1 | P1-D 公共只读 API 加 `Cache-Control: public` | CDN 可缓存，源站减负 | 需评估内容时效 |
| P1 | P1-B i18n 按 locale 动态 import | 客户端包减 ~70KB | 需处理加载态 |
| P1 | P1-E `globals.css` 抽 CSS Module | 首屏 CSS 体积下降 | 禁区内类不得改 |
| P2 | P2-A Canvas rAF 可见性门控 | 移动端后台耗电下降 | 零观感变化，安全 |
| P2 | P2-B 移除非必要 `unoptimized` | 轻微 | 低 |

**建议顺序**：P0-A（地基）→ P1-A、P1-C、P1-D（低风险高收益）→ P1-B、P1-E → P2。

---

## 5. 修复优先级清单（按文件）

| 文件 | 涉及项 | 动作 |
|------|--------|------|
| `src/app/layout.tsx` | P0-A | 删除 `headers()` 调用（L2、L40-51、L73），改为透传布局 |
| `src/app/[locale]/layout.tsx` | P0-A, P1-A, P1-B | 上移 `<html lang/dir>`；`next/font` 或按 locale 加载字体（L56-61）；messages 改动态 import（L10-18） |
| `src/components/about/FactoryShowcase.tsx` | P1-C | L70、L124 原生 `<img>` 改 `ImageWithRetry` |
| `src/components/home/CaseGallerySection.tsx` | P1-C, P2-B | L96-97 首帧改 `ImageWithRetry`（保留 eager+high）；评估 L115/L210 `unoptimized` |
| `src/app/[locale]/products/[...slug]/ProductDetailView.tsx` | P1-C | L431 灯箱 `<img>` 改 `ImageWithRetry` |
| `src/app/[locale]/about/AboutClient.tsx` | P1-C | L1475 证书图 `<img>` 改 `ImageWithRetry` |
| `src/app/api/products/route.ts` | P1-D | 响应加 `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` |
| `src/app/api/blogs/route.ts` | P1-D | 同上 |
| `src/app/api/categories/route.ts` | P1-D | 同上 |
| `src/components/ui/Starfield.tsx` | P2-A | `IntersectionObserver` 门控 rAF（L550-562） |
| `src/components/ui/OceanBubbles.tsx` | P2-A | `IntersectionObserver` 门控 rAF（L155-173） |
| `src/app/globals.css` | P1-E | 非首屏动画抽 CSS Module（禁区类仅切分不改） |
