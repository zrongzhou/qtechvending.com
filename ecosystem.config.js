/**
 * pm2 ecosystem file for the QtechVending site.
 *
 * The site runs as an INDEPENDENT pm2 process named `qtechvending` on PORT 3001.
 * It does NOT share or affect the existing `smart-cabinet` process (port 3000).
 */
module.exports = {
  apps: [
    {
      name: 'qtechvending',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Override ADMIN_JWT_SECRET / DATABASE_URL / NEXT_PUBLIC_BASE_URL / SMTP_* here or via .env.
      // env_production: { ... }
      watch: false,
      autorestart: true,
      max_memory_restart: '700M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
