# 后台管理模块 UI 回归报告（Round 2 — sku 修复复验）

> 仓库：`qtechvending-local`
> 验证对象：commit `1fc01b0`（`fix: add sku field to ProductForm so product create no longer 400s`）
> 基线：Round 1 于 commit `19c7daa`（47 文件，+4133/-64）
> QA：software-qa-engineer-2（严过关）
> 状态：Round 2 完成 — sku 修复 PASS，全量 PASS
> 替代关系：本文档替代 / 归档 Round 1 基线 `regression-report-backend-admin-round1-2026-07-22.md`

---

## 0. Round-2 一句话结论

**sku 修复通过；全量 PASS；智能路由判定 = NoOne（无遗留源码 / 测试 bug）；仅 2 项非阻塞遗留（安全硬编码兜底 + seed 覆盖），由主理人在用户总结单列 / 部署补一步。**

---

## 1. sku 修复复验（Round-2 重点）

逐项核对 `src/components/admin/ProductForm.tsx` @ `1fc01b0`：

| 检查项 | 结果 | 证据 |
|---|---|---|
| `sku` state | ✅ PASS | line 29 `const [sku, setSku] = useState(initial?.sku ?? '');` |
| payload 含 `sku` | ✅ PASS | line 80 `sku: sku.trim(),` |
| 提交校验（空 sku 拦截） | ✅ PASS | lines 72–75 `if (!sku.trim()) { setError(t('admin.skuRequired')); return; }` |
| UI 渲染 sku 输入块 | ✅ PASS | lines 153–164：label `t('admin.fieldSku')` + 红 `*`(155) + placeholder `"e.g. RV-001"`(161) + `disabled={!!initial}`(162) |
| i18n 键齐备 | ✅ PASS | `en/zh/ar.json` 均含 `admin.fieldSku` / `admin.skuRequired` |

配套 i18n 键确认位置：
- `src/messages/en.json:261` `"admin.fieldSku": "SKU"` / `:311` `"admin.skuRequired": "SKU is required."`
- `src/messages/zh.json:294` `"admin.fieldSku": "SKU"` / `:344` `"admin.skuRequired": "SKU 必填。"`
- `src/messages/ar.json:294` `"admin.fieldSku": "SKU"` / `:344` `"admin.skuRequired": "الـ SKU مطلوب."`

### POST 行为（带 admin 凭证路径）

- **未能取得 admin token**（本地无服务器凭证，且远程端点不可本地直连）→ 按主理人约定走回退：验证 **payload 结构 + `tsc` 0 错误**，并辅以静态推理。
- 静态推理：`products/route.ts` POST 仅在 `body.sku` 为空时返回 `sku is required`（lines 83–86）。修复后：
  - 表单**总是**发送 `sku: sku.trim()`（line 80）；且客户端在 `sku` 为空时于 submit 内 `return`（lines 72–75），不会发出空 sku。
  - 因此「带有效 sku」→ 通过校验 → `prisma.product.create` 拿到 sku → 返回 `200 {success:true}`，**Round-1 的「新建产品必 400」bug 已消除**。
  - 「不带 sku」→ 客户端拦截（不发请求）；即便绕过客户端直发空 sku，也按预期 `400`（属合理安全行为，**非 bug**）。
- 结论：Round-1 报告的 🔴 源码 BUG（ProductForm 缺 sku）**已修复**，原路由至工程师的工单关闭。

---

## 2. 类型检查

`npx tsc --noEmit` @ `1fc01b0` → **EXIT=0，0 错误**（与工程师声明、服务器 build 成功一致，已实跑确认）。

---

## 3. 一致性验收清单（架构 §T9）— 4/4 PASS（复验）

commit `1fc01b0` 仅改动 `ProductForm.tsx`（写路径字段）+ 3 个 i18n 文件，**不涉及读链路**，故 Round-1 的 4/4 结论保持有效；并已重新核对关键接线无回退：

1. **SiteSetting → 联系页 / 页脚 / JSON-LD 读 DB**：`src/app/[locale]/contact/page.tsx:24` `await getSiteSetting()` 仍接；公开端点 `src/app/api/site-settings/route.ts` 仍调 `getSiteSetting()` ✓ PASS
2. **全局 FAQ → /faq 读 DB**：`src/app/[locale]/faq/page.tsx:23` `await getSiteFaqCategories()` 仍接 ✓ PASS
3. **产品 FAQ 子编辑器 → 详情页 FAQ Tab**：`ProductForm` 的 `ProductFaqEditor` 仍在（未受 sku 改动影响）；`getProductBySlug` 返回全字段含 `faq` ✓ PASS
4. **分类 / 产品 / 博客 CRUD → 列表 / 详情实时读**：公开页均 `force-dynamic`，经 `data.ts` 实时读库；sku 为写字段，不影响读链路 ✓ PASS

---

## 4. 智能路由判定

- Round-2：原源码 bug（sku）已修复，无新 bug；本仓库无单测框架，QA 不自修源码。
- **路由决策：NoOne** —— 全部 PASS。

---

## 5. 非阻塞遗留（继承 Round-1，不阻塞交付）

- ⚠️ **安全（非阻塞）**：`src/lib/auth.ts` 中 `ADMIN_JWT_SECRET` 有硬编码兜底默认值 `'change-me-admin-secret-qtechvending'`。生产环境 `/var/www/qtechvending/.env` 务必确认已设置 `ADMIN_JWT_SECRET` 或 `JWT_SECRET`，否则存在伪造 admin token 风险。主理人将在用户总结中单列提醒。
- ⚠️ **Seed 覆盖（非阻塞）**：部署步骤 `node db_alter.mjs` 只建表不跑 seed；`scripts/seed.mjs` 已覆盖三张新表，但需在部署后补一步 `npm run seed`（幂等、skip-if-exists，不会覆盖后台已改内容）。否则新表上线为空、靠常量兜底直到首次保存（优雅降级，不崩溃，但 DB 非唯一真相源）。

---

## 6. Round-1 → Round-2 变更摘要

| 阶段 | commit | 结论 | 路由 |
|---|---|---|---|
| Round 1 | `19c7daa` | 发现 1 源码 bug（ProductForm 缺 sku） | → Engineer |
| Round 2 | `1fc01b0` | bug 已修；全量 PASS | NoOne |

文件差异（来自 `1fc01b0`）：`src/components/admin/ProductForm.tsx`(+18)、`src/messages/en.json`(+2)、`src/messages/zh.json`(+2)、`src/messages/ar.json`(+2)，共 4 文件 +24 行。

---

## 7. 最终交付结论（供三项需求整体收尾）

后台管理五大模块 UI 回归：

- **sku 修复：PASS**（Round-1 🔴 bug 关闭）
- **auth / 类型安全 / AdminNav / 读链路 / 致命缺陷扫描：PASS**
- **一致性清单（§T9）：4/4 PASS**
- **`tsc --noEmit`：0 错误**
- **路由判定：NoOne**

仅 2 项非阻塞遗留：① `ADMIN_JWT_SECRET` 硬编码兜底（安全，生产须设 env）；② seed 覆盖（部署须补 `npm run seed`）。二者均不阻塞本次交付，由主理人单列提醒 / 部署补一步。

**后台管理模块可纳入「点击卡顿 / sitemap / 后台管理」三项需求整体收尾。**
