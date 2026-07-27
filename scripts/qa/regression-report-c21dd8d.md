# 回归测试报告 — commit c21dd8d (qtechvending.com 三项修复)

> QA 工程师：严过关（software-qa-engineer）
> 验证对象：已部署 commit `c21dd8d`（仅 3 个文件）
> 验证方式：本地仓库代码审查 + `tsc --noEmit` 类型检查 + 线上已验证事实（主理人提供）

## 一、三项修复验证结论

### 修复 1：联系页面浅色主题（`src/app/[locale]/contact/ContactClient.tsx`）— ✅ 通过

代码审查（已部署 commit c21dd8d）逐项核对：

| 项 | 变更 | 结果 |
|---|---|---|
| 页面背景 | `from-slate-900 via-[#0B3A4A] to-slate-900` → `from-slate-50 via-cyan-50/80 to-teal-50/60` | ✅ |
| 背景 blur orb alpha | 0.15–0.30 → 0.30–0.45（`bg-cyan-400/45`、`bg-teal-400/40`、`bg-cyan-500/35`、`bg-sky-400/30`） | ✅ |
| eyebrow | `text-cyan-400` → `text-cyan-600` | ✅ |
| title | `text-white` → `text-ink-900` | ✅ |
| subtitle | `text-cyan-100/80` → `text-slate-600` | ✅ |
| 表单/信息/地图/成功/社交卡片 | `bg-slate-900/60 border-white/10` → `bg-white/90 border-white/70`（5 类卡片全部替换） | ✅ |
| 输入框 | `bg-white/10 border-white/20 text-white` → `bg-slate-50 border-slate-200 text-ink-900` | ✅ |
| 标签 | `text-cyan-100/90` → `text-slate-700`（所有 label） | ✅ |
| 错误提示 | `bg-red-500/10 border-red-500/30 text-red-300` → `bg-red-50 border-red-200 text-red-700` | ✅ |
| 邮箱链接 | `text-cyan-300` → `text-cyan-700` | ✅ |
| 联系信息小标签/内容 | `text-cyan-100/60`/`text-cyan-100/90` → `text-slate-500`/`text-slate-700` | ✅ |

**无遗漏深色样式核查**：对部署版本全文检索，`bg-slate-900` 与 `text-cyan-100` 均已清零；仅存的 `text-white` 全部位于带色图标/按钮区域（Facebook/X/YouTube/TikTok 社交图标圈、成功勾选圆、IconTile、CTA 渐变按钮），符合预期，**非图标区域的深色文字样式已彻底清除**。

线上佐证：`/en/contact` → 200，HTML 中已出现 `from-slate-50`、`bg-white/90`、`text-ink-900` 浅色类名 ✅

### 修复 2：sitemap 缓存缩短（`src/app/sitemap.xml/route.ts`）— ✅ 通过

- `Cache-Control`：`public, max-age=3600` → `public, max-age=60, must-revalidate`（第 102 行）✅
- 其余响应头保持不变：`Content-Type: text/xml; charset=utf-8`、`X-Content-Type-Options: nosniff`、完整 XML namespace/缩进均保留 ✅
- 线上佐证：`https://www.qtechvending.com/sitemap.xml` → 200 + `text/xml` + 完整 XML + `cache-control: public, max-age=60, must-revalidate` ✅

### 修复 3：favicon.ico 404（`src/app/layout.tsx` icons metadata + nginx 301）— ✅ 通过

- 仓库内（`layout.tsx`）：新增 `icons` metadata —— `icon` / `shortcut` / `apple` 均指向 `/favicon.svg` ✅
- 服务端（nginx，不在仓库内）：`location = /favicon.ico { return 301 /favicon.svg; }`（依据主理人说明 + 线上验证）
- `public/favicon.svg` 文件存在（1066 字节，Jul 20）且可正常访问 ✅
- 线上佐证：`https://www.qtechvending.com/favicon.ico` → 301 → `/favicon.svg` → 200 + `image/svg+xml` ✅

## 二、类型检查结果（`npx tsc --noEmit`）

- 退出码：**1**（存在错误，但**全部来自未跟踪的残留 admin 文件**，与本次三项修复无关）
- 错误清单（均位于 `src/app/api/admin/**` 未跟踪文件）：
  1. `src/app/api/admin/categories/[id]/route.ts(54,78)` — Prisma `description` JSON 类型不兼容（`null` vs `InputJsonValue`）
  2. `src/app/api/admin/categories/route.ts(82,9)` — Prisma JSON `null` 类型不兼容
  3. `src/app/api/admin/site-settings/route.ts(54,7)` — `SiteSettingCreateInput` 缺少必填字段 `company`
- **三项修复涉及文件（ContactClient.tsx / sitemap.xml/route.ts / layout.tsx）零类型错误** ✅
- 结论：符合预期（报错仅来自未跟踪残留文件）

## 三、智能路由判定

- 源码 Bug：无（三项修复实现正确，无逻辑/样式缺陷）
- 测试代码 Bug：本次无测试代码
- **判定：NoOne — 全部通过**

## 四、遗留风险

1. **未跟踪 admin API 文件类型错误（已知、超出本次范围）**：`src/app/api/admin/**` 3 个文件存在 Prisma 类型错误，属历史残留、未纳入版本控制、与本次修复无关。建议后续单独排期修复或清理，避免污染 `tsc` 基线；**不影响本次三项修复上线**。
2. **工作树存在未提交改动**：`ContactClient.tsx` 在工作树另有 8 行未提交改动（社交图标 ring 由 `ring-white/*` 改为 `ring-black/*`，为浅色主题下的对比度微调，纯 className 改动）。该改动**未包含在已部署的 commit c21dd8d 中**，仅为本地待提交优化，不影响线上验证结论。
3. **favicon 依赖服务端 nginx 配置**：修复 3 的 301 跳转依赖 `/etc/nginx/conf.d/qtechvending.conf`，属运维侧配置，仓库内无法回归；已通过线上 301→200 验证，但后续若重置 nginx 需重新确认。
4. **`icons` metadata 与 favicon.ico 共存**：layout 已声明 `shortcut: '/favicon.svg'`，浏览器优先使用 SVG；`/favicon.ico` 301 作为兼容兜底，二者无冲突。

---

## 总体结论

三项修复均通过代码审查与线上佐证，类型检查无新增错误（仅已知 admin 残留），智能路由判定 **NoOne**，可验收。
