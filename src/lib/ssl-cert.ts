import fs from 'node:fs';
import path from 'node:path';
import type { SslCert } from '@/types';

/**
 * ssl-cert — server-side helpers for the V52 "paste PEM → auto-write to disk"
 * admin flow.
 *
 * Lifecycle (see architecture §7.4):
 *   1. The admin UI posts `sslCerts` that MAY carry transient `certContent` /
 *      `keyContent` PEM strings.
 *   2. `preprocessSslCerts` validates + (when both PEMs are present) writes the
 *      files to `${SSL_DIR}/<domain>.crt|.key` via `writeSslCertFiles`, then
 *      rewrites `certPath`/`keyPath` to the auto paths and STRIPS the transient
 *      fields so they are never stored in the DB.
 *   3. The cleaned array is persisted and handed to `nginxManager.applyConfig`.
 *
 * Security model:
 *   - Domain is sanitized to `[a-zA-Z0-9._-]+` and rejects `..` / `/` (no path
 *     traversal into the cert dir or elsewhere).
 *   - PEM markers are checked before any write.
 *   - Private-key content is NEVER logged or returned in error messages.
 */

/** Default on-server SSL directory (override via env NGINX_SSL_DIR). */
export const SSL_DIR_DEFAULT = '/etc/nginx/ssl';

const DOMAIN_RE = /^[a-zA-Z0-9._-]+$/;

// Strict PEM markers: a begin/end pair with a non-empty body in between. The
// regex enforces the correct order (BEGIN before END) and rejects an empty body
// (markers adjacent with only whitespace), so invalid certs/keys fail fast here
// instead of surfacing later at `nginx -t`.
const CERT_PEM_RE = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/;
// Backreference (\1) forces the END prefix to match the BEGIN prefix
// (PRIVATE KEY / RSA PRIVATE KEY / EC PRIVATE KEY), rejecting mismatched pairs
// as well as reversed or END-less markers.
const KEY_PEM_RE = /-----BEGIN ((?:RSA |EC )?)PRIVATE KEY-----([\s\S]*?)-----END \1PRIVATE KEY-----/;

/** Error type carrying a stable `code` used by callers / API responses. */
export class SslCertError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'SslCertError';
    this.code = code;
  }
}

/**
 * Sanitize & validate a domain for use in a file name / cert path.
 * Returns the trimmed domain on success, throws {@link SslCertError} otherwise.
 * Allowed characters mirror nginx's `DOMAIN_RE` family: `a-zA-Z0-9._-`.
 * Explicitly rejects empty strings, `..` (path traversal) and `/`.
 */
export function sanitizeSslDomain(domain: string): string {
  const d = (domain || '').trim();
  if (!d) throw new SslCertError('SSL_DOMAIN', 'Invalid SSL domain: empty');
  // Cap length (RFC 1035 max label 63, FQDN 253) so an absurdly long domain
  // cannot produce an unmanageable on-disk path.
  if (d.length > 253) throw new SslCertError('SSL_DOMAIN', `Invalid SSL domain (too long): ${d}`);
  if (!DOMAIN_RE.test(d)) {
    throw new SslCertError('SSL_DOMAIN', `Invalid SSL domain: ${d}`);
  }
  if (d.includes('..')) {
    throw new SslCertError('SSL_DOMAIN', `Invalid SSL domain (path traversal): ${d}`);
  }
  if (d.includes('/')) {
    throw new SslCertError('SSL_DOMAIN', `Invalid SSL domain (slash): ${d}`);
  }
  return d;
}

/**
 * True iff `content` is a well-formed certificate PEM: a CERTIFICATE begin/end
 * pair (in order) whose captured body has at least one non-whitespace
 * character (i.e. there is actual base64 content, not just adjacent markers).
 */
export function validatePemCert(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  const m = CERT_PEM_RE.exec(content);
  if (!m) return false;
  return m[1].trim().length > 0;
}

/**
 * True iff `content` is a well-formed private-key PEM: a recognised
 * (RSA/EC/unspecified) PRIVATE KEY begin/end pair (in order, prefixes matched
 * via backreference) whose captured body has at least one non-whitespace char.
 */
export function validatePemKey(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  const m = KEY_PEM_RE.exec(content);
  if (!m) return false;
  return m[2].trim().length > 0;
}

/**
 * Validate that a stored cert/key path is safe to embed in nginx config:
 *   - non-empty absolute path
 *   - located *inside* `sslDir` (default `/etc/nginx/ssl`), with a strict
 *     directory boundary so `/etc/nginx/ssl-evil/foo.crt` is rejected.
 * `path.resolve` normalises `..`, duplicate separators and `.`, which also
 * neutralises traversal attempts before the prefix comparison. The check is
 * therefore platform-independent.
 */
export function isSafeSslPath(p: string, sslDir: string = SSL_DIR_DEFAULT): boolean {
  if (!p || typeof p !== 'string') return false;
  if (!path.isAbsolute(p)) return false;
  const resolved = path.resolve(p);
  const dir = path.resolve(sslDir);
  // Equal to the dir itself (defensive) or strictly nested under it. The
  // `dir + path.sep` boundary is what prevents the `ssl-evil` sibling bypass.
  return resolved === dir || resolved.startsWith(dir + path.sep);
}

export interface WriteSslCertResult {
  certPath: string;
  keyPath: string;
}

/**
 * Write a certificate + private key to `${sslDir}/<domain>.crt|.key`.
 *   - `.crt` mode 0644, `.key` mode 0600.
 *   - The directory is created if missing.
 * Throws {@link SslCertError} (SSL_CERT_INVALID / SSL_KEY_INVALID / SSL_DOMAIN /
 * SSL_WRITE_FAILED) on any validation or I/O failure. The private key is NEVER
 * included in the thrown message.
 */
export function writeSslCertFiles(
  domain: string,
  certContent: string,
  keyContent: string,
  opts?: { sslDir?: string }
): WriteSslCertResult {
  const safeDomain = sanitizeSslDomain(domain);
  if (!validatePemCert(certContent)) {
    throw new SslCertError('SSL_CERT_INVALID', `Invalid certificate PEM for ${safeDomain}`);
  }
  if (!validatePemKey(keyContent)) {
    throw new SslCertError('SSL_KEY_INVALID', `Invalid private key PEM for ${safeDomain}`);
  }

  const sslDir = opts?.sslDir || SSL_DIR_DEFAULT;
  if (!sslDir || !path.isAbsolute(sslDir) || sslDir.includes('..')) {
    throw new SslCertError('SSL_DIR_INVALID', `Invalid SSL directory: ${sslDir}`);
  }

  try {
    fs.mkdirSync(sslDir, { recursive: true });
    const certPath = path.join(sslDir, `${safeDomain}.crt`);
    const keyPath = path.join(sslDir, `${safeDomain}.key`);
    fs.writeFileSync(certPath, `${certContent.trim()}\n`, { mode: 0o644 });
    fs.writeFileSync(keyPath, `${keyContent.trim()}\n`, { mode: 0o600 });
    // Re-assert modes explicitly (writeFileSync mode is subject to umask).
    fs.chmodSync(certPath, 0o644);
    fs.chmodSync(keyPath, 0o600);
    return { certPath, keyPath };
  } catch (e) {
    if (e instanceof SslCertError) throw e;
    throw new SslCertError('SSL_WRITE_FAILED', `Failed to write certificate files for ${safeDomain}`);
  }
}

/**
 * Preprocess a raw `sslCerts` payload for persistence:
 *   - If BOTH `certContent` and `keyContent` are present (non-empty), write the
 *     PEMs to disk and return the entry with auto-generated `certPath`/
 *     `keyPath` (transient fields dropped).
 *   - Otherwise keep the operator-supplied `certPath`/`keyPath` (validated to be
 *     absolute and under `sslDir`), dropping any transient fields.
 * Throws {@link SslCertError} before writing the DB on any validation failure.
 */
export function preprocessSslCerts(raw: unknown, opts?: { sslDir?: string }): SslCert[] {
  const sslDir = opts?.sslDir || SSL_DIR_DEFAULT;
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const c = (item ?? {}) as Record<string, unknown>;
    const domain = typeof c.domain === 'string' ? c.domain.trim() : '';
    const certContent = typeof c.certContent === 'string' ? c.certContent : '';
    const keyContent = typeof c.keyContent === 'string' ? c.keyContent : '';

    // Paste mode: both PEMs provided → write & rewrite paths.
    if (certContent.trim() && keyContent.trim()) {
      const result = writeSslCertFiles(domain, certContent, keyContent, { sslDir });
      return {
        domain,
        certPath: result.certPath,
        keyPath: result.keyPath,
        enabled: Boolean(c.enabled),
      };
    }

    // Path mode: keep supplied paths, validating them.
    const certPath = typeof c.certPath === 'string' ? c.certPath.trim() : '';
    const keyPath = typeof c.keyPath === 'string' ? c.keyPath.trim() : '';
    if (!certPath || !keyPath) {
      throw new SslCertError(
        'SSL_PATH_REQUIRED',
        `证书路径与私钥路径必填（或粘贴 PEM 内容）：${domain || '(unknown)'}`
      );
    }
    if (!isSafeSslPath(certPath, sslDir) || !isSafeSslPath(keyPath, sslDir)) {
      throw new SslCertError(
        'SSL_PATH_INVALID',
        `证书路径必须位于 ${sslDir} 下：${certPath} / ${keyPath}`
      );
    }
    return { domain, certPath, keyPath, enabled: Boolean(c.enabled) };
  });
}
