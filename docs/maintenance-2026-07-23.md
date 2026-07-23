# 项目维护手册 — QtechVending 三语站点（2026-07-23）

> 项目：QtechVending（en/zh/ar 三语 B2B 售货机展示与询盘站点）
> 服务器：`43.165.195.87` ｜ 部署根目录（git 工作树）：`/var/www/qtechvending`
> 一键运维脚本：`/var/www/qtechvending/scripts/qtechvendingctl.sh`（仓库内 `scripts/qtechvendingctl.sh`）
> 配套文档：`docs/structure-2026-07-23.md`、`docs/audit/performance-2026-07-23.md`、`docs/audit/seo-2026-07-23.md`

---

## 0. 重要隔离前提（务必先读）

本站点与服务器上既有的 `smart-cabinet`（端口 3000）**完全独立**，互不影响：

- **独立 pm2 进程**：`qtechvending`（端口 3001），不触碰 `smart-cabinet`（端口 3000）。
- **独立 nginx 配置**：`/etc/nginx/conf.d/qtechvending.conf`，与 `smart-cabinet.conf` 互不干扰。
- **独立数据库**：PostgreSQL 库 `qtechvending`，与 `smart_cabinet` 库无共享。
- **独立证书目录**：本站点证书位于 `/etc/nginx/ssl/`，由 `qtechvendingctl ssl-renew` 仅续期 `qtechvending.com` 一张证书。

> ⚠️ **wstoolcabinet 红线**：`wstoolcabinet` 的证书由 `smart-cabinet.conf` 管理，**严禁**用本站点脚本、certbot 或任何手段改动其证书/配置。任何 nginx / 证书操作前，确认只触及 `qtechvending*` 相关文件。

---

## 1. 服务管理

### 1.1 一键脚本 `qtechvendingctl`（推荐）

脚本位置（服务器）：`/var/www/qtechvending/scripts/qtechvendingctl.sh`
前置：命令需 **root**（内部 `require_root` 校验），生产环境用 `sudo` 调用。

| 命令 | 作用 |
|------|------|
| `sudo ./qtechvendingctl.sh start` | pm2 启动（已存在则 restart）后 `pm2 save` |
| `sudo ./qtechvendingctl.sh stop` | pm2 停止后 `pm2 save`（不影响 smart-cabinet） |
| `sudo ./qtechvendingctl.sh restart` | pm2 重启后 `pm2 save` |
| `sudo ./qtechvendingctl.sh status` | `pm2 status qtechvending` + `nginx -t` 结果 |
| `sudo ./qtechvendingctl.sh reload-nginx` | `nginx -t` 校验通过后 `nginx -s reload`（失败则中止，避免掉流量） |
| `sudo ./qtechvendingctl.sh logs [--lines N]` | 跟踪/尾部 pm2 日志（默认实时跟随） |
| `sudo ./qtechvendingctl.sh ssl-renew` | `certbot renew --cert-name qtechvending.com`（**仅本站点证书**，排除 wstoolcabinet） |
| `sudo ./qtechvendingctl.sh deploy` | 完整部署序列（见 §6.2） |

> 环境变量可覆盖：`APP_DIR`、`PM2_NAME`、`SSL_CERT_NAME`、`BUILD_NODE_OPTIONS`。

### 1.2 手动等价命令（无脚本时）

```bash
# pm2 进程
pm2 status qtechvending
pm2 restart qtechvending
pm2 stop qtechvending
pm2 logs qtechvending --lines 100

# nginx
nginx -t                      # 校验配置（必做）
nginx -s reload               # 热重载（不中断连接）

# 证书续期（仅 qtechvending）
certbot renew --cert-name qtechvending.com
```

---

## 2. 进程与端口参数

| 参数 | 值 | 来源 |
|------|----|------|
| 运行端口 `PORT` | **3001** | `ecosystem.config.js` env、`package.json` 的 `start`/`dev`（均 `-p 3001`） |
| pm2 进程名 | **`qtechvending`** | `ecosystem.config.js` `apps[].name` |
| pm2 模式 | `instances:1`、`exec_mode:'fork'` | `ecosystem.config.js` |
| pm2 内存重启阈值 | `max_memory_restart:'700M'`、`autorestart:true` | `ecosystem.config.js` |
| 构建内存上限 | `NODE_OPTIONS=--max-old-space-size=2048` | `qtechvendingctl.sh` 的 `BUILD_NODE_OPTIONS` |
| 应用上游（nginx→app） | `http://127.0.0.1:3001` | `qtechvending.conf` 的 `proxy_pass` |

> ⚠️ 构建期内存低于 1024M 会导致 OOM **segfault**；前提是 2048M。本地构建若仍 OOM 可临时调高至 4096M（仅影响构建，不影响运行）。

---

## 3. 关键配置文件位置

| 文件 | 位置 | 作用 |
|------|------|------|
| pm2 启动配置 | 仓库根 `ecosystem.config.js` | 进程名、端口、环境变量、内存重启策略 |
| Next.js 配置 | 仓库根 `next.config.mjs` | 图片 webp/avif、301 重定向、headers、reactStrictMode、compress |
| **环境变量（真实值）** | **`/var/www/qtechvending/.env`**（服务器） | `DATABASE_URL` / `ADMIN_JWT_SECRET` / `JWT_SECRET` / `NEXT_PUBLIC_BASE_URL` / `SMTP_*` |
| nginx 主配置 | `/etc/nginx/conf.d/qtechvending.conf` | www/test 双域名反代 3001 + 80→443 301；证书 `/etc/nginx/ssl/*.pem` |
| SSL 片段目录 | `/etc/nginx/qtechvending-ssl/` | 应用 `NginxManager` 下发的每域名 SSL server 片段 |
| HTTP 跳转片段 | `/etc/nginx/conf.d/qtechvending-http.inc` | 由全局 `forceHttps` 开关生成（见 §5） |
| 应用生成的多域名片段 | `/etc/nginx/conf.d/qtechvending-ssl-*.conf` | 主配置 `include` 引入的证书片段 |
| nginx 样例配置 | 仓库 `docs/nginx/qtechvending.conf` | 部署时复制到 `/etc/nginx/conf.d/` |
| 环境变量样例 | 仓库 `.env.example` | 复制为 `.env` 后填真实值，**禁止提交 `.env`**（已被 `.gitignore` 忽略） |

> 修改 nginx 前**必须** `nginx -t` 校验；**勿改动 `smart-cabinet.conf` / `wstoolcabinet` 配置**。

---

## 4. 账号与密钥

### 4.1 数据库

| 项 | 值 |
|----|----|
| 角色（role） | **`qtechvending`** |
| 端口 | **5432** |
| 密码 | **`dkMmENkBhm2yLUAlkKugwhB`** |
| 库名 | `qtechvending` |
| 连接串 | `postgresql://qtechvending:dkMmENkBhm2yLUAlkKugwhB@localhost:5432/qtechvending` |

> 注：仓库内 `.env.example` / `docs/deploy.md` 为占位模板（角色 `qtechvending_user`、密码 `change-me-strong`），上线时须替换为上方真实生产值；模板值**不可用于生产**。
> 连接串通过 `DATABASE_URL` 由 `src/lib/prisma.ts` 读取。

### 4.2 后台管理（admin）

| 项 | 值 |
|----|----|
| 后台登录页 | `https://www.qtechvending.com/xiaozhouBackend/login` |
| 后台首页（登录后） | `https://www.qtechvending.com/xiaozhouBackend` |
| **修改密码页** | `https://www.qtechvending.com/xiaozhouBackend/change-password` |
| 路由保护 | `src/middleware.ts` 拦截 `/xiaozhouBackend/*`（未登录跳 `/xiaozhouBackend/login`） |
| 鉴权方式 | JWT（`admin_auth` cookie 或 `Authorization: Bearer`），由 `src/lib/auth.ts` 签发/校验，TTL `12h` |
| **后台 JWT 密钥** | `ADMIN_JWT_SECRET`，存放于 **`/var/www/qtechvending/.env`** |

> ⚠️ `ADMIN_JWT_SECRET` 回退链为 `ADMIN_JWT_SECRET || JWT_SECRET || 内置不安全默认值`。**生产必须设置 `ADMIN_JWT_SECRET`**。
> 一旦在 `.env` 中更改 `ADMIN_JWT_SECRET`，所有已登录后台会话立即失效，需重新登录。

### 4.3 SSL 证书

- **证书目录**：`/etc/nginx/ssl/`（本站点专用）。
  - 生产：`/etc/nginx/ssl/www.qtechvending.com_bundle.pem` + `.key`
  - 预发：`/etc/nginx/ssl/test.qtechvending.com_bundle.pem` + `.key`
- **续期**：`sudo ./qtechvendingctl.sh ssl-renew`（certbot，仅 `qtechvending.com` 一张，`--cert-name` 显式限定，绝不触及 wstoolcabinet）。
- **证书内容来源**：后台「站点设置」可粘贴 PEM → 应用写入 `/etc/nginx/ssl/<domain>.crt|.key`（权限 0644 / 0600），并经 `NginxManager` 下发片段 + `nginx -t` 校验后 reload。

> ⚠️ **wstoolcabinet 证书红线**：其证书由 `smart-cabinet.conf` 管理。**绝不用** `certbot renew`（无 `--cert-name` 限定）、`qtechvendingctl` 或手工改动它；只操作 `qtechvending*` 文件。

---

## 5. HTTP → HTTPS 301 机制

全站强制 HTTPS 由两层共同保证：

1. **nginx 静态 80 跳转**（`/etc/nginx/conf.d/qtechvending.conf`）：
   ```nginx
   server {
       listen 80;
       server_name www.qtechvending.com test.qtechvending.com;
       return 301 https://$host$request_uri;
   }
   ```
2. **应用动态 `qtechvending-http.inc`**（`/etc/nginx/conf.d/qtechvending-http.inc`，由 `src/lib/nginx.ts` 按全局开关 `SiteSetting.forceHttps` 生成，并经 `NginxManager.applyConfig` `include` 进主配置）：
   - `forceHttps = true`：为每个启用域名下发 `if ($host = "<domain>") { return 301 https://$host$request_uri; }`
   - `forceHttps = false`：HTTP 直出，不做跳转。
   - 同时 `src/middleware.ts`（Edge）在 `forceHttps` 时再做 308 兜底跳转。

> 该开关在后台「站点设置 / SSL 证书」处配置；改动后 `NginxManager` 会自动写 `http.inc` 并 `nginx -t` 校验 → reload（失败自动回滚，不 reload）。
> 若发现 HTTP 未跳 HTTPS：检查后台 `forceHttps` 开关、主配置是否 `include qtechvending-http.inc`、以及 nginx 80 server block 是否完好。

---

## 6. 完整部署序列

### 6.1 首次 / 从零部署（一次性）

前置：Node 22、PostgreSQL 15+、pm2、nginx；DNS 将 `www`/`test` 解析到 `43.165.195.87`。

```bash
# 1) 取代码到部署根
git clone <repo> /var/www/qtechvending
cd /var/www/qtechvending

# 2) 建独立数据库（角色 qtechvending，库 qtechvending）
sudo -u postgres psql <<'SQL'
CREATE USER qtechvending WITH PASSWORD 'dkMmENkBhm2yLUAlkKugwhB';
CREATE DATABASE qtechvending OWNER qtechvending;
SQL

# 3) 环境变量（复制样例，填入真实值；禁止提交 .env）
cp .env.example .env
#   .env 至少设置：
#   DATABASE_URL=postgresql://qtechvending:dkMmENkBhm2yLUAlkKugwhB@localhost:5432/qtechvending
#   ADMIN_JWT_SECRET=<长随机串>
#   NEXT_PUBLIC_BASE_URL=https://www.qtechvending.com   # 预发改为 test.qtechvending.com
#   SMTP_*（可选）

# 4) 数据库迁移 + 初始化（admin 用户 + 默认 CompanyInfo）
npx prisma migrate deploy
npm run db:seed

# 5) 安装依赖并构建（构建期注入内存上限，避免 OOM segfault）
npm install
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# 6) 内容抓取/下载/灌库（需能访问源站，可选）
npm run scrape && npm run download:images && npm run seed

# 7) 启动 pm2（独立进程 qtechvending，端口 3001）
pm2 start ecosystem.config.js
pm2 save

# 8) 下发 nginx 配置（勿改 smart-cabinet.conf）
sudo cp docs/nginx/qtechvending.conf /etc/nginx/conf.d/qtechvending.conf
sudo nginx -t
sudo systemctl reload nginx

# 9) 验证
#    https://test.qtechvending.com/en  （先预发）
#    https://www.qtechvending.com/en   （再生产）
#    后台：https://www.qtechvending.com/xiaozhouBackend/login
```

### 6.2 日常发布（改代码后）

**推荐**使用一键脚本（已含 `set -e`，任一环节失败即中止，绝不带病重启）：

```bash
cd /var/www/qtechvending
sudo ./qtechvendingctl.sh deploy
```

脚本内部序列（与 §6.1 步骤 4–8 对应，但走 git 拉取）：

```
git fetch origin
git reset --hard origin/main
npm install
npm run prisma:generate
rm -rf .next
NODE_OPTIONS="--max-old-space-size=2048" npm run build   # 失败则中止
pm2 restart qtechvending
nginx -s reload
pm2 save
```

> 发布后建议观察日志确认无报错：`sudo ./qtechvendingctl.sh logs --lines 50`。

---

## 7. 故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| **502 Bad Gateway** | pm2 进程未运行 / 端口不匹配（应为 3001） | `qtechvendingctl status` 看 `pm2 status`；未运行则 `qtechvendingctl start`；确认 `ecosystem.config.js` 端口 3001 与 nginx `proxy_pass` 一致 |
| **构建失败 / `JavaScript heap out of memory` segfault** | 构建内存不足（<1024M） | 构建期注入 `NODE_OPTIONS="--max-old-space-size=2048"`（脚本已默认）；本地仍 OOM 可临时 4096M |
| **后台登录返回 401** | 未带有效 `admin_auth` cookie / token 过期（TTL 12h） | 重新访问 `/xiaozhouBackend/login` 登录；若 `.env` 改过 `ADMIN_JWT_SECRET`，旧会话全部失效需重登 |
| **后台改密后旧 token 仍可用** | 已签发 JWT 在 TTL 内仍有效（无服务端吊销） | 等待 12h 过期，或改 `ADMIN_JWT_SECRET` 使其立即全失效；改密入口 `/xiaozhouBackend/change-password` |
| **证书过期 / 浏览器不信任** | 证书到期 | `sudo ./qtechvendingctl.sh ssl-renew`（仅 qtechvending）；**勿**动 wstoolcabinet |
| **HTTP 访问未跳 HTTPS** | `forceHttps` 关闭 / `http.inc` 未 include / 80 server block 被改 | 后台开启 `forceHttps`；`nginx -t` 看主配置是否含 `include qtechvending-http.inc`；确认 80 block 完好 |
| **`nginx -t` 报错** | 配置语法错误（常因手工改 conf） | 回滚到上次可用版本；`qtechvendingctl reload-nginx` 会因校验失败而中止，不会掉流量 |
| **静态图 404** | `public/images/` 缺失或路径错 | 确认本地图片在 `public/images/`；`next build` 已纳入；nginx 片段对 `/_next/static` 与图片有缓存规则 |
| **页面空白 / 白屏** | 构建产物缺失（`.next` 被清但未重建）或运行时崩溃 | `qtechvendingctl logs` 看报错；必要时 `qtechvendingctl deploy` 重建 |
| **SEO canonical/hreflang 异常** | 见 `docs/audit/seo-2026-07-23.md`（P0-1/P0-2/P1-*） | 按 SEO 报告核对 `src/lib/seo.ts`、`sitemap.xml/route.ts` |
| **性能/渲染瓶颈** | 见 `docs/audit/performance-2026-07-23.md`（根布局 `headers()` 锁全站动态、i18n 全量打包、原生 `<img>`、Canvas rAF） | 按性能报告优化；**品牌动画禁区不可删减**，仅可做 IntersectionObserver 可见性门控 |

---

## 8. 与其他文档的关系

- **结构**：目录树、服务、参数、配置文件位置见 `docs/structure-2026-07-23.md`。
- **性能**：渲染/打包/缓存瓶颈与优化边界（含品牌动画禁区清单）见 `docs/audit/performance-2026-07-23.md`。
- **SEO**：canonical/sitemap/本地化/结构化数据问题见 `docs/audit/seo-2026-07-23.md`。

---

> 文档生成原则：所有路径、端口、账号、命令均核实自仓库真实文件（`ecosystem.config.js`、`.env.example`、`scripts/qtechvendingctl.sh`、`docs/nginx/qtechvending.conf`、`src/lib/auth.ts`、`src/lib/nginx.ts`、`docs/deploy.md`），未虚构。生产数据库密码、后台 JWT 密钥以本手册 §4 为准。
