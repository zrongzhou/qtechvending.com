# QA 测试报告 — QtechVending 三语官网

> 测试工程师：严过关（software-qa-engineer）｜轮次：Round 1（发现 + 反馈）
> 测试环境：Windows 开发机，Node v22.22.2，本地 `next dev -p 3000`，**无 PostgreSQL**（无 :5432，无 `.env` / `DATABASE_URL`）。
> 代码：commit 3e64524，本地 `qtechvending-local`。

## 一、汇总

| 验证项 | 结果 | 说明 |
|---|---|---|
| 1. 构建 / 类型复验 (`npm run build`) | ✅ PASS | exit 0，0 TypeScript 错误，全部路由编译通过 |
| 2. i18n key 一致性 | ✅ PASS | en/zh/ar 扁平化后各 **166** 个 key，集合完全一致，无缺译 |
| 3. 爬虫数据完整性 | ✅ PASS | products=20、categories=11、blogs=7（达标 ≥20 / =11 / ≥1）|
| 4. 路由冒烟（runtime） | ❌ FAIL | 1/10 通过；仅 `/xiaozhouBackend/login`=200，其余 9 个数据驱动路由全部 500 |
| 5. 联系表单校验逻辑 | ✅ PASS（代码评审）| 8 字段齐全 + 必填标记；API 校验（必填/邮箱/subject 枚举）合理 |
| 6. SEO 标记 | ⚠️ 逻辑正确，runtime 被 Bug A 阻断 | `seo.ts`/`seo-keywords.ts` 生成的 hreflang(en/zh-CN/ar/x-default)/title/description/og 正确，但因页面 500 无法在 SSR HTML 中验证 |

**Round 1 路由通过率：1/10**（其余为源码 Bug，非环境 artifact）。

## 二、发现的源码 Bug（已反馈工程师 寇豆码）

### Bug A — 数据页在无 DB 时 500，缺少优雅降级（高）
- **现象**：本地无 DB / 无 `.env`，所有数据驱动路由返回 **HTTP 500**；仅不查库的 `/xiaozhouBackend/login` 返回 200（服务本身健康）。`/api/products` 同样 500。
- **根因**：`src/lib/data.ts` 中 `getCategories / getFeaturedProducts / getProducts / getBlogs / getCompanyInfo / getProductBySlug / getCategoryBySlug / getBlogBySlug / getRelatedProducts / getAll*Slugs` **全部直接调用 `prisma.xxx.findMany()` 且无 try/catch**。DB 不可用时异常未被捕获，沿 Server Component 渲染抛出 → 整页 500；Prisma 查询引擎子进程崩溃（dev 日志：`"Jest worker encountered 2 child process exceptions, exceeding retry limit"`）。
- **影响路由（9 个页面 + 全部数据 API）**：`/en`、`/zh`、`/ar`、`/en/products`、`/en/products/[slug]`、`/en/category/[slug]`、`/en/blog`、`/en/about`、`/en/contact`（contact 页 `page.tsx:24` 调 `getCategories()` 也查库）；API：`/api/products`、`/api/blogs` 等。
- **与预期冲突**：主理人明确"DB 空时页面应渲染外壳、数据为空（非 Bug）"；任务规则："若某页因 DB 空而抛 500（非预期崩溃），判定为源码 Bug → 反馈工程师"。当前行为 500，属源码 Bug。
- **建议修复**：在 `src/lib/data.ts` 每个函数外包 try/catch，DB 异常时返回空值：
  - `getCategories()` → `[]`；`getFeaturedProducts/getLatestBlogs/getProducts/getBlogs` → `{data:[],total:0,totalPages:1,page,pageSize}`；`getProductBySlug/getCategoryBySlug/getBlogBySlug/getCompanyInfo` → `null`；`getAll*Slugs/getRelatedProducts` → `[]`。
  - 这样部署窗口期（应用已起、库未 migrate/seed）与库临时不可用时，页面仍 200 渲染外壳，符合"外壳+空数据"预期。
  - API 路由（`/api/products` 等）同样受益（均调 data.ts），无需逐一路由改。

### Bug B — SSR 的 `<html lang/dir>` 未按 locale 设置（中-高，破坏 /ar RTL 与 SEO）
- **现象（代码评审，确定性）**：`src/app/layout.tsx:22` **硬编码** `<html lang="en" dir="ltr">`；`src/app/[locale]/layout.tsx`（LocaleLayout，`'use client'`）仅通过 `useEffect` 在**客户端水合后**才设置 `document.documentElement.lang/dir`。因此 SSR HTML（curl / 爬虫拿到内容）始终是 `lang="en" dir="ltr"`，`/ar` 永远不会出现 `lang="ar" dir="rtl"`。
- **死代码**：`src/middleware.ts:34` `requestHeaders.set('x-pathname', pathname)` 注入了 x-pathname，但全代码**无任何消费点**（grep 确认）。ARCH 所述"中间件注入 x-pathname 控制 `<html lang/dir>`" 未真正实现。
- **影响**：`/ar` 的 RTL 仅在水合后由 JS 翻转（首屏 FOUC + 爬虫/SEO 看不到 RTL），违反 PRD"ar 为 RTL"与任务"`/ar` 含 `lang=\"ar\" dir=\"rtl\"`"断言。嵌套布局不能渲染 `<html>`，只有根布局能。
- **建议修复**：让**根布局（Server Component）**在 SSR 期按 locale 设置 `<html lang dir>`：用 `headers()` 读取 middleware 注入的 `x-pathname` 解析首段 locale，渲染 `<html lang={locale} dir={locale==='ar'?'rtl':'ltr'}>`（需 `export const dynamic` 适当）；或把 locale 从 `[locale]/layout` 的 `params.locale` 提升到根布局。并清理未消费的 `x-pathname`（或真正用它）。

## 三、代码评审结论（不阻塞，记录在案）

- **联系表单（item 5）✅**：`ContactClient.tsx` 渲染全部 8 字段（name/email/phone/company/country/productInterest/subject/message），name/email/message 带 `*` 必填标记；subject 枚举 = general/sales/support/customization/partnership。`src/app/api/contact/route.ts` 校验逻辑合理：必填 name/email/message、邮箱正则、subject 枚举（非法回落 general）、选填字段容错、400/200/500 分支清晰。**完整提交会因无 DB 卡在 insert（预期，非 Bug）。**
- **SEO 生成逻辑（item 6）✅**：`lib/seo.ts` 的 `generatePageMetadata` 与 `lib/seo-keywords.ts` 的 `buildHreflang` 正确产出 `alternates.languages` = en/zh-CN/ar/x-default、`<title>`、`description`、`og:*`、`twitter:`。仅因 Bug A 页面 500 而无法在 SSR HTML 中验证，待 Round 2 复验。
- **品牌 / 导航 / 语言切换（item 4）✅（代码层）**：`Navbar.tsx` 含 Logo（"Qtech" 双四角星）+ 导航（Home/Products/Blog/About/Contact）+ Globe 语言切换器（English/中文/العربية）。运行期被 Bug A 阻断，待 Round 2 复验。
- **i18n key 数差异 ⚠️**：工程师称各 184 个 key；实测扁平化后 **166** 个叶子 key（en/zh/ar 完全一致，无缺译）。166 = 叶子数 = 总 key 数（该 JSON 为扁平点号结构，无中间节点），故 184 应为计数口径误差，**非功能缺陷**；三语对齐无误，裸 key 风险为 0。

## 四、待"部署后回归"项（需服务器建库 migrate+seed 后验，本地无 PG 无法验）

- 产品列表实际填充、产品详情渲染图片/参数表、分类页列出产品、博客列表/详情真实文章、关于页真实文案。
- Round 2 在工程师修复 Bug A/B 后，**无需数据库**即可用 curl 复验：所有数据页 200 + 渲染外壳（品牌/导航/语言切换）、`/ar` SSR 含 `lang="ar" dir="rtl"`、`/en/contact` 表单 8 字段、`/en` 的 hreflang/title/description/og 标签齐全。

## 五、风险清单

1. **部署窗口风险（Bug A 未修前）**：若应用先起、库尚未 migrate/seed，所有内容页 500，DNS 提前切流会造成糟糕首屏。建议与部署（任务 #4）协同，先修 Bug A 再上线。
2. **RTL/SEO 风险（Bug B）**：`/ar` 的 RTL 与 hreflang 的 crawler 可见性在 Bug B 修复前不达标。
3. **dev worker 脆弱性**：单一 Prisma 查询引擎子进程在 DB 错误时会崩溃并级联 500；Bug A 的优雅降级同时可稳定该问题。
4. **i18n 184 vs 166**：仅计数口径差，功能无碍，低风险。

## 六、交付物（位于 `qtechvending-local/scripts/qa/`）

- `check-i18n-keys.mjs` — i18n 三语 key 集合一致性校验（PASS）
- `check-data-files.mjs` — 爬虫数据文件数量校验（PASS）
- `smoke.mjs` — 路由冒烟（当前 1/10，待 Bug A/B 修复后复验）
- 已为 `package.json` 增加 `qa:i18n` / `qa:data` / `qa:smoke` 脚本入口。

---
生成时间：Round 1。下轮（Round 2）于工程师修复 Bug A/B 后回归。
