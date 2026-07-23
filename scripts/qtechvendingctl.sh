#!/usr/bin/env bash
#
# qtechvendingctl — one-shot management script for the QtechVending site.
#
# Runs the site as an independent pm2 process named `qtechvending` (port 3001)
# alongside the unrelated `smart-cabinet` process (port 3000). This script
# NEVER touches smart-cabinet / wstoolcabinet (its SSL is managed by
# smart-cabinet.conf and must be left alone).
#
# Usage:
#   ./qtechvendingctl.sh <command> [options]
#
# Commands:
#   start           pm2 start (restart if already running)
#   stop            pm2 stop
#   restart         pm2 restart
#   status          pm2 status + nginx -t
#   reload-nginx    nginx -t then nginx -s reload (abort on test failure)
#   logs [--lines N]   pm2 logs (optional tail line count)
#   ssl-renew       certbot renew for the qtechvending cert only
#   deploy          full pull/build/restart sequence (see below)
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Centralised configuration
# ---------------------------------------------------------------------------
APP_DIR="/var/www/qtechvending"          # server deploy root (git working tree)
PM2_NAME="qtechvending"                  # pm2 process / app name (port 3001)
PORT=3001

NGINX_CONF="/etc/nginx/conf.d/qtechvending.conf"
NGINX_HTTP_INC="/etc/nginx/conf.d/qtechvending-http.inc"
SSL_DIR="/etc/nginx/ssl"                 # qtechvending SSL certs live here
SSL_SNIPPET_DIR="/etc/nginx/qtechvending-ssl"

# qtechvending certbot certificate name. NOTE: wstoolcabinet is intentionally
# excluded — its cert is managed by smart-cabinet.conf and must not be renewed
# by this script.
SSL_CERT_NAME="qtechvending.com"

# Build memory cap. 1024 segfaults on this project; bump to 4096 locally if OOM.
BUILD_NODE_OPTIONS="--max-old-space-size=2048"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()  { printf '\033[0;32m[info]\033[0m %s\n' "$*"; }
err()   { printf '\033[0;31m[error]\033[0m %s\n' "$*" >&2; }
die()   { err "$*"; exit 1; }

usage() {
  cat <<'EOF'
Usage: qtechvendingctl.sh <command> [options]

Commands:
  start              pm2 start (restart if already running)
  stop               pm2 stop
  restart            pm2 restart
  status             pm2 status + nginx -t result
  reload-nginx       nginx -t, then nginx -s reload (aborts on test failure)
  logs [--lines N]   tail pm2 logs (default follows live)
  ssl-renew          certbot renew for the qtechvending cert only
  deploy             full sequence: git pull -> install -> build -> restart -> reload nginx -> pm2 save

Environment overrides:
  APP_DIR, PM2_NAME, SSL_CERT_NAME, BUILD_NODE_OPTIONS
EOF
}

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    die "This command requires root privileges. Run with sudo."
  fi
}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
cmd_start() {
  require_root
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    info "Process '$PM2_NAME' already exists — restarting."
    pm2 restart "$PM2_NAME"
  else
    info "Starting '$PM2_NAME' from ecosystem file."
    if [[ -f "$APP_DIR/ecosystem.config.js" ]]; then
      ( cd "$APP_DIR" && pm2 start ecosystem.config.js )
    else
      ( cd "$APP_DIR" && pm2 start npm --name "$PM2_NAME" -- run start )
    fi
  fi
  pm2 save
}

cmd_stop() {
  require_root
  info "Stopping '$PM2_NAME'."
  pm2 stop "$PM2_NAME"
  pm2 save
}

cmd_restart() {
  require_root
  info "Restarting '$PM2_NAME'."
  pm2 restart "$PM2_NAME"
  pm2 save
}

cmd_status() {
  info "pm2 status:"
  pm2 status "$PM2_NAME" || true
  echo
  info "nginx config test:"
  if nginx -t; then
    info "nginx configuration OK."
  else
    err "nginx configuration test FAILED."
    return 1
  fi
}

cmd_reload_nginx() {
  require_root
  info "Validating nginx configuration..."
  if ! nginx -t; then
    err "nginx -t failed — aborting reload to avoid dropping traffic."
    exit 1
  fi
  info "Reloading nginx."
  nginx -s reload
  info "nginx reloaded."
}

cmd_logs() {
  local lines=()
  if [[ "${1:-}" == "--lines" ]] && [[ -n "${2:-}" ]]; then
    lines=(--lines "$2")
  fi
  pm2 logs "$PM2_NAME" "${lines[@]}"
}

cmd_ssl_renew() {
  require_root
  info "Renewing qtechvending certificate only (wstoolcabinet excluded)."
  # --cert-name scopes renewal to the qtechvending cert so smart-cabinet /
  # wstoolcabinet certificates are never touched.
  if certbot renew --cert-name "$SSL_CERT_NAME"; then
    info "certbot renew finished for '$SSL_CERT_NAME'."
  else
    err "certbot renew failed for '$SSL_CERT_NAME'."
    exit 1
  fi
}

cmd_deploy() {
  require_root
  info "Starting full deploy for '$PM2_NAME' in $APP_DIR"

  # Run the whole sequence from the app directory. `set -e` makes any failing
  # step abort the deploy so we never restart on a broken build.
  (
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
    npm install
    npm run prisma:generate
    rm -rf .next
    NODE_OPTIONS="$BUILD_NODE_OPTIONS" npm run build
  )

  info "Build complete — restarting process and reloading nginx."
  pm2 restart "$PM2_NAME"
  nginx -s reload
  pm2 save
  info "Deploy finished."
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------
main() {
  local cmd="${1:-}"
  [[ $# -gt 0 ]] && shift || true

  case "$cmd" in
    start)        cmd_start "$@" ;;
    stop)         cmd_stop "$@" ;;
    restart)      cmd_restart "$@" ;;
    status)       cmd_status "$@" ;;
    reload-nginx) cmd_reload_nginx "$@" ;;
    logs)         cmd_logs "$@" ;;
    ssl-renew)    cmd_ssl_renew "$@" ;;
    deploy)       cmd_deploy "$@" ;;
    ""|-h|--help|help) usage ;;
    *) err "Unknown command: '$cmd'"; echo; usage; exit 1 ;;
  esac
}

main "$@"
