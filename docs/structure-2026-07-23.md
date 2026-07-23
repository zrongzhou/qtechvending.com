# 项目结构文档 — QtechVending 三语站点（2026-07-23）

> 项目：QtechVending（en/zh/ar 三语 B2B 售货机展示与询盘站点）
> 仓库：`qtechvending-local`（git 分支 `main`）
> 配套文档：`docs/audit/performance-2026-07-23.md`、`docs/audit/seo-2026-07-23.md`、`docs/maintenance-2026-07-23.md`

---

## 1. 项目相关文件清单（目录树）

```
qtechvending-local/
├── src/
│   ├── app/                         # Next.js App Router 路由与页面（Server + Client）
│   │   ├── layout.tsx               # 根布局：SSR <html lang/dir>，组件体内调用 headers() 取 locale（见性能报告 P0-A）
│   │   ├── globals.css              # 全局样式（约 2106 行，含全部品牌动画 CSS，见性能报告第 0 节）
│   │   ├── robots.ts                # robots 协议（当前未禁止 /en/qa-*，见 SEO 报告 P2-5）
│   │   ├── sitemap.xml/route.ts     # 动态 sitemap（当前 LOCALES=['en'] 仅英文，见 SEO 报告 P0-2）
│   │   ├── [locale]/                # 三语路由段（en/zh/ar）
│   │   │   ├── layout.tsx           # 客户端布局：Navbar/Footer/JsonLd、字体 <link>、i18n messages 全量 import
│   │   │   ├── page.tsx             # 首页
│   │   │   ├── about/ products/ blog/ solutions/ faq/ contact/   # 静态/列表/详情页
│   │   │   ├── products/[...slug]/  # 产品详情
│   │   │   ├── blog/[slug]/         # 博客详情（Article JSON-LD）
│   │   │   ├── category/[slug]/     # 分类页（缺 JSON-LD，见 SEO 报告 P2-4）
│   │   │   └── qa-*/                # QA 调试页（不应上线，见 SEO 报告 P2-5）
│   │   ├── api/                     # 路由处理器（Route Handlers）
│   │   │   ├── products|blogs|categories/   # 公共只读 API（force-dynamic + 默认 no-store，见性能报告 P1-D）
│   │   │   └── admin/               # 后台写 API（需 JWT，见 §5 账号）
│   │   └── xiaozhouBackend/         # 后台 UI（登录 / 站点设置 / 内容管理）
│   ├── components/                  # UI 组件
│   │   ├── ui/                      # 基础组件：ImageWithRetry / Starfield / OceanBubbles / JsonLd / AuroraBackground
│   │   ├── layout/ about/ home/ products/ faq/ solutions/   # 业务组件
│   │   ├── admin/                   # 后台表单：BlogForm / ProductForm / SiteSettingsSslCerts 等
│   │   ├── Fireworks.tsx IceCrystals.tsx   # 品牌动画（禁区，见性能报告第 0 节）
│   │   └── Footer.tsx               # 含 fireflies 品牌动画（禁区）
│   ├── lib/                         # 业务逻辑
│   │   ├── seo.ts                   # 统一 SEO 元数据生成（canonical/hreflang/og，见 SEO 报告 P0-1/P1-1）
│   │   ├── data.ts                  # DB 查询封装（getProducts/getBlogs/getSiteSetting...）
│   │   ├── prisma.ts                # Prisma 客户端单例（读 DATABASE_URL）
│   │   ├── auth.ts                  # 后台 JWT 签发/校验（ADMIN_JWT_SECRET / JWT_SECRET）
│   │   ├── nginx.ts                 # NginxManager：生成并下发 nginx 片段（sslCerts/forceHttps/http.inc）
│   │   ├── i18n.ts site-config.ts seo-keywords.ts localize.ts
│   │   └── middleware.ts            # Edge 中间件：forceHttps 时 308 跳转 HTTPS
│   ├── messages/                    # 三语文案（en.json/zh.json/ar.json，客户端全量打包，见性能报告 P1-B）
│   └── types/                       # 共享 TS 类型
├── prisma/
│   ├── schema.prisma                # 数据模型：Product / BlogPost / SiteSetting / Category 等
│   └── seed.ts                      # 初始化种子（admin 用户 + 默认 CompanyInfo）
├── public/                         # 静态资源（images/ 本地图片、favicon、og 图）
├── scripts/
│   ├── qtechvendingctl.sh           # 一键运维脚本（start/stop/restart/status/reload-nginx/deploy/ssl-renew/logs）
│   └── db_alter_*.mjs scrape.mjs download-images.mjs seed*.mjs   # 数据/迁移/抓取工具
├── docs/                           # 文档集（架构/PRD/QA/审计/nginx）
│   ├── nginx/qtechvending.conf      # nginx 站点配置样例（部署到 /etc/nginx/conf.d/）
│   └── audit/ performance-2026-07-23.md  seo-2026-07-23.md
├── next.config.mjs                 # Next 配置（images webp/avif、redirects、headers、reactStrictMode、compress）
├── ecosystem.config.js             # pm2 启动配置（进程名 qtechvending，端口 3001）
├── tailwind.config.ts postcss.config.mjs tsconfig.json
├── package.json                    # 依赖与脚本（dev/build/start/prisma:*/seed/test）
└── .env.example                    # 环境变量样例（复制为 .env 后填写真实值，禁止提交 .env）
```

**核心目录用途速查**

| 目录 | 用途 |
|------|------|
| `src/app/[locale]/` | 三语前端页面（约 50+ 路由） |
| `src/app/api/` | 公共只读 API + 后台写 API |
| `src/app/xiaozhouBackend/` | 后台管理界面 |
| `src/lib/` | SEO、数据访问、鉴权、nginx 片段生成等核心逻辑 |
| `src/components/ui/` | 可复用基础组件 + 品牌 Canvas 背景 |
| `src/messages/` | 三语文案 JSON（i18n 数据源） |
| `prisma/` | 数据模型与种子 |
| `scripts/` | 运维脚本与数据工具 |
| `public/images/` | 本地化图片（已下载，避免远程图域） |

---

## 2. 相关服务

| 服务 | 说明 | 隔离性 |
|------|------|--------|
| **pm2 进程 `qtechvending`** | Next.js 生产服务（`next start`），fork 模式，监听 **127.0.0.1:3001** | 独立进程，**不触碰** `smart-cabinet`（端口 3000） |
| **nginx** | 反向代理 + TLS 终止；`/etc/nginx/conf.d/qtechvending.conf` 将 `www`/`test` 域名反代到 3001；同时由应用生成 `qtechvending-http.inc`（forceHttps 时 301 跳 HTTPS） | 独立 conf 文件，**不动** `smart-cabinet.conf` |
| **PostgreSQL** | 独立数据库 `qtechvending`（与 `smart_cabinet` 完全隔离），由 `DATABASE_URL` 连接 | 独立库、独立角色 |

> 服务器上本站点部署根目录为 `/var/www/qtechvending`（即本仓库的工作树）；`qtechvendingctl.sh` 以此为 `APP_DIR`。

---

## 3. 参数说明

| 参数 | 值 | 来源 / 说明 |
|------|----|-------------|
| 运行端口 `PORT` | **3001** | `ecosystem.config.js` env 与 `package.json` 的 `start`/`dev` 脚本（`next start -p 3001`） |
| pm2 进程名 | **`qtechvending`** | `ecosystem.config.js` `apps[].name` |
| 构建内存上限 `NODE_OPTIONS` | **`--max-old-space-size=2048`** | `scripts/qtechvendingctl.sh` 的 `BUILD_NODE_OPTIONS`（构建期 `npm run build` 使用；低于 1024 会 OOM segfault） |
| pm2 实例/模式 | `instances:1`、`exec_mode:'fork'` | `ecosystem.config.js` |
| pm2 内存重启 | `max_memory_restart:'700M'`、`autorestart:true` | `ecosystem.config.js` |
| Node 版本 | 22（部署前置要求） | `docs/deploy.md` 前置条件 |
| PostgreSQL 版本 | 15+ | `docs/deploy.md` 前置条件 |

---

## 4. 关键配置文件位置

| 文件 | 位置 | 作用 |
|------|------|------|
| pm2 启动配置 | **`ecosystem.config.js`**（仓库根） | 定义进程名、端口、环境变量、内存重启策略 |
| Next.js 配置 | **`next.config.mjs`**（仓库根） | images 格式（webp/avif）、301 重定向、headers（静态资源 7 天 immutable）、reactStrictMode、compress |
| nginx 主配置 | **`/etc/nginx/conf.d/qtechvending.conf`** | www/test 双域名反代 3001 + 80→443 301；证书路径 `/etc/nginx/ssl/*.pem` |
| SSL 片段目录 | **`/etc/nginx/qtechvending-ssl/`** | 由应用 `NginxManager` 下发的每域名 SSL server 片段 |
| HTTP 跳转片段 | **`/etc/nginx/conf.d/qtechvending-http.inc`** | 由应用按全局 `forceHttps` 开关生成：开启时为各启用域名下发 `return 301 https://$host$request_uri;`；关闭时为空 |
| 应用生成的其他片段 | `/etc/nginx/conf.d/qtechvending-ssl-*.conf` | 主配置 `include` 引入的多域名证书片段 |
| 环境变量 | **`/var/www/qtechvending/.env`**（服务器） | `DATABASE_URL` / `ADMIN_JWT_SECRET` / `JWT_SECRET` / `NEXT_PUBLIC_BASE_URL` / `SMTP_*` |

> ⚠️ nginx 主配置 `qtechvending.conf` 与 `smart-cabinet.conf` 相互独立；修改 nginx 前务必 `nginx -t` 校验，且**勿改动 `smart-cabinet.conf` / `wstoolcabinet` 相关配置**。

---

## 5. 环境变量（env）

| 变量 | 用途 | 读取位置 | 必填 |
|------|------|----------|------|
| `DATABASE_URL` | PostgreSQL 连接串（独立库 `qtechvending`） | `src/lib/prisma.ts` | 是 |
| `ADMIN_JWT_SECRET` | 后台 JWT 签名密钥（优先） | `src/lib/auth.ts` | 是 |
| `JWT_SECRET` | 后台 JWT 签名回退密钥 | `src/lib/auth.ts` | 否（缺省回退到内置值，不安全） |
| `NEXT_PUBLIC_BASE_URL` | 规范域名（canonical / hreflang / og / JSON-LD 的绝对 URL 基址） | `src/lib/seo.ts`、`layout.tsx`、`robots.ts` | 是（生产 `https://www.qtechvending.com`） |
| `NODE_OPTIONS` | 构建期内存上限（`--max-old-space-size=2048`） | 由 `qtechvendingctl deploy` 注入 | 构建期 |
| `SMTP_*` | 询盘通知邮件（可选；未配置则跳过发信，仅落库） | 邮件通知逻辑 | 否 |

> 变量清单以 `.env.example` 为准；真实值填写于服务器 `/var/www/qtechvending/.env`，**禁止提交 `.env` 到仓库**（已被 `.gitignore` 忽略）。

---

## 6. 与配套文档的关系

- **性能**：渲染/打包/缓存层面的瓶颈与优化建议见 `docs/audit/performance-2026-07-23.md`（含品牌动画禁区）。
- **SEO**：canonical/sitemap/本地化/结构化数据问题见 `docs/audit/seo-2026-07-23.md`。
- **运维**：服务管理、配置、账号、部署序列与故障排查见 `docs/maintenance-2026-07-23.md`。
