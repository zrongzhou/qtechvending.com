# QtechVending — Deployment Guide

Independent deployment of `www.qtechvending.com` + `test.qtechvending.com` on
server `43.165.195.87`. **This never touches the existing `smart-cabinet`
site, its pm2 process (port 3000), database, or nginx config.**

---

## 1. Prerequisites

- Node 22, PostgreSQL 15+, pm2, nginx installed.
- Domain DNS: `www.qtechvending.com` and `test.qtechvending.com` A-record → `43.165.195.87`.
- TLS certificates for both hosts placed manually (no certbot on this host) at:
  - `/etc/nginx/ssl/www.qtechvending.com_bundle.pem` + `.key`
  - `/etc/nginx/ssl/test.qtechvending.com_bundle.pem` + `.key`

---

## 2. Database (independent `qtechvending` database)

```bash
sudo -u postgres psql <<'SQL'
CREATE USER qtechvending_user WITH PASSWORD 'change-me-strong';
CREATE DATABASE qtechvending OWNER qtechvending_user;
SQL

# from the project directory
cp .env.example .env
# edit .env: DATABASE_URL, ADMIN_JWT_SECRET, NEXT_PUBLIC_BASE_URL, SMTP_*
# For the test environment set NEXT_PUBLIC_BASE_URL=https://test.qtechvending.com

npx prisma migrate deploy
npm run db:seed          # creates admin user + default CompanyInfo
```

---

## 3. Build & seed content

```bash
npm install
npm run build

# Scrape the source WordPress site + download images + seed into PostgreSQL
npm run scrape
npm run download:images
npm run seed
```

> The scrape/download/seed steps require outbound network access to the
> source site. Run them from a machine that can reach it, then the data lives
> in the `qtechvending` database.

---

## 4. Run with pm2 (NEW process `qtechvending`, port 3001)

```bash
pm2 start ecosystem.config.js
pm2 save
```

`ecosystem.config.js` launches the Next.js production server on **PORT 3001**
as the independent process named `qtechvending` — separate from `smart-cabinet`
(port 3000).

---

## 5. nginx

Copy the sample config (do NOT edit `smart-cabinet.conf`):

```bash
sudo cp docs/nginx/qtechvending.conf /etc/nginx/conf.d/qtechvending.conf
sudo nginx -t
sudo systemctl reload nginx
```

The config reverse-proxies both `www` and `test` hostnames to
`127.0.0.1:3001` with their own certificates.

---

## 6. Verify

- `https://test.qtechvending.com/en` (staging first)
- `https://www.qtechvending.com/en` (production after staging checks)
- Admin console: `https://www.qtechvending.com/xiaozhouBackend/login`
- Contact inquiry → appears under `/xiaozhouBackend/contact-messages`

---

## 7. Rollback / isolation notes

- Stop only this site: `pm2 stop qtechvending` (leaves `smart-cabinet` running).
- Database, process, port, nginx file, and certificates are all independent.
- No shared directories with `smart-cabinet` (`/var/www/smart-cabinet`).
