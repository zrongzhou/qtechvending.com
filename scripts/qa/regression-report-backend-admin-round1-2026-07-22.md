# 后台管理模块 UI 回归报告（Round 1 基线）

> 仓库：`qtechvending-local`
> 验证对象：commit `19c7daa`（47 文件，+4133/-64）补齐的后台管理五大模块 UI
> QA：software-qa-engineer-2（严过关）
> 状态：Round 1 完成；Round 2 待工程师修复 sku 后复验
> 最终报告命名约定：`scripts/qa/regression-report-backend-admin-<工程师修复commit短哈希>.md`（本文件为 Round 1 基线，Round 2 将落盘为该命名文件）

---

## A. 代码审查结论

### 1. 鉴权（PASS）
全部 16 个 `/api/admin/*` 数据路由，每个 handler 首行均 `requireAdmin(req)` + 失败 `unauthorizedResponse()`，无遗漏开放端点。
- 例外（符合预期）：`login/route.ts`（登录本就开放）、`logout/route.ts`（仅清 cookie，无危害）。
- `requireAdmin`（`src/lib/auth.ts`）从 `Authorization: Bearer` 或 `admin_auth` cookie 提取 JWT 并校验 `role==='admin'`。
- ⚠️ 安全提醒（非阻塞，非本次引入）：`lib/auth.ts` 中 `ADMIN_JWT_SECRET` 有硬编码兜底默认值 `'change-me-admin-secret-qtechvending'`。生产环境（`/var/www/qtechvending/.env`）务必确认已设置 `ADMIN_JWT_SECRET` 或 `JWT_SECRET`，否则存在伪造 admin token 风险。

### 2. 类型安全（PASS）
- `src/app/api/admin/categories/route.ts`：`name`/`description` 用 `Prisma.InputJsonValue`，`Prisma.JsonNull` ✓
- `src/app/api/admin/categories/[id]/route.ts`：`Prisma.CategoryUpdateInput` + `Prisma.InputJsonValue` + `Prisma.JsonNull` ✓
- `src/app/api/admin/site-settings/route.ts`：`Prisma.SiteSettingUpdateInput` + `Prisma.InputJsonValue` + `Prisma.JsonNull` ✓

### 3. AdminNav（PASS）
导航项路径与实际页面完全一致：`/xiaozhouBackend/categories`、`/products`、`/blogs`、`/site-settings`、`/faq`（另含 dashboard、contact-messages）。文件含 `'use client'`。

### 4. 前端读链路一致性（PASS）
- `src/app/[locale]/contact/page.tsx`：`await getSiteSetting()` 并传 `site` 给 ContactClient；ContactClient 的 props 有 `site: SiteSetting`，联系邮箱/电话/地址读 `site?.email/phone/address/addressLine` + 兜底，**不再直接 import 硬编码 SITE_CONFIG**（SITE_CONFIG 仅用于 metadata 默认描述）。
- `src/app/[locale]/faq/page.tsx`：`await getSiteFaqCategories()` 传 `categories` 给 FaqAccordion；FaqAccordion 从 props 读 `categories` 且保留 `CAT_ACCENT` 映射 ✓

### 5. 致命缺陷扫描（发现 1 个 BUG）
- 🔴 **BUG（已转工程师，Round 2 复验）**：`src/components/admin/ProductForm.tsx` 无 `sku` 字段（无 state、无输入、payload 不含 `sku`），但 `src/app/api/admin/products/route.ts` POST（lines 83–86）**强制要求 sku** → 新建产品必返回 400 `{"error":"sku is required."}`。编辑正常（PATCH 中 sku 可选）。工单已发 software-engineer。
- 其余：全部 22 个 admin 组件/页面均含 `'use client'`（无缺失导致 build 失败）；`src/components/admin/i18n.ts` / `I18nInputs.tsx` 被正常引用、无重复定义冲突；`src/messages/en.json` 含全部 `admin.*` 键；未发现未定义 import / 错误 props 名。
- 轻微 nits（非阻塞，可选修）：`src/app/xiaozhouBackend/site-settings/page.tsx` 的 `onSaved={() => setSetting(setting)}` 未用服务端返回值刷新，首次无数据时保存后 `setting` 仍为 null（表单本地 state 保留输入，刷新会重新拉取，功能不受影响）。

## B. 类型检查
`npx tsc --noEmit` → **0 错误**（与工程师声明一致，已实跑确认）。

## C. 智能路由判定
源码有 Bug → **路由至工程师 software-engineer（ProductForm 缺 sku）**。本次无测试代码，QA 不自修。

## D. 一致性验收清单（架构 §T9）— 4/4 PASS
1. **SiteSetting → 联系页/页脚/JSON-LD 读 DB**：`getSiteSetting()` 读库；公开端点 `src/app/api/site-settings/route.ts` 同样调用 `getSiteSetting()` 供 Footer/Organization JSON-LD 使用 ✓ PASS
2. **全局 FAQ → /faq 读 DB**：`getSiteFaqCategories()` 读 `site_faq_categories`+嵌套 items，非空即返回（空则降级 FAQ_CATEGORIES 常量）✓ PASS
3. **产品 FAQ 子编辑器 → 详情页 FAQ Tab 读 product.faq**：`ProductForm` 的 `ProductFaqEditor` 双向绑定 `faq` 并入参提交；`ProductDetailView` 传 `product.faq` 给 `ProductFaqAccordion`；`getProductBySlug` 返回全字段含 `faq` ✓ PASS
4. **分类/产品/博客 CRUD → 列表/详情实时读**：所有公开页（`products`、`products/[...slug]`、`blog`、`blog/[slug]`、`category/[slug]`、`contact`、`faq` 等）均为 `export const dynamic = 'force-dynamic'`，经 `getProducts/getProductBySlug/getBlogs/getBlogBySlug/getCategories/getSiteSetting/getSiteFaqCategories` 实时读库 ✓ PASS

## E. Seed 覆盖（⚠️ 关键遗留风险）
- `scripts/seed.mjs` **已覆盖**三张新表：`siteSetting.upsert`（skip-if-exists，首次从 SITE_CONFIG 写入，重跑 `update:{}` 不覆盖后台改动）+ `site_faq_categories`/`site_faq_items`（按 key/question 去重 upsert）。`npm run seed` 用 `tsx` 可正常执行。
- **但本次部署步骤（主理人所述 `node db_alter.mjs`）只建表、不跑 seed**。若生产库这些新表为空：
  - 后台 Site Settings 页 GET 返回 404 → 表单初始为空；前端联系页/页脚走 SITE_CONFIG 兜底，直到管理员首次保存。
  - `/faq` 走 FAQ_CATEGORIES 常量兜底，直到库中有数据。
  - 均为**优雅降级（不崩溃）**，但 DB 在首次 seed/手动保存前并非唯一数据源。
- **建议**：部署流程在 `db_alter.mjs` 之后补一步 `npm run seed`（幂等、skip-if-exists，不会覆盖后台已改内容），让三张新表上线即有数据、DB 即时成为唯一真相源。

## 路由决策汇总（Round 1）
- 发现 1 个源码 Bug（ProductForm 缺 sku）→ 已发工单给 software-engineer。
- 其余全部 PASS，tsc 0 错误。
- Round 2（复验）待工程师修复后由 QA 做最终确认。

## Round 2 复验重点（待工程师修复 sku 后）
- `ProductForm.tsx` 必须有 `sku` state、payload 含 `sku`、UI 渲染了 sku 输入块（带 `*` 必填标记，编辑态 disabled）。
- `products/route.ts` POST 的 `sku is required` 路径在表单补齐 sku 后不再触发；带 admin 凭证的 POST 新建产品应返回 `success:true`（或至少确认 payload 结构 + `npx tsc --noEmit` 0 错误）。
- 复验 4/4 一致性清单仍然成立（SiteSetting/FAQ/产品FAQ/CRUD 读链路）。
- 三项需求整体收尾后，输出更新版回归结论（含 sku 修复状态）。
