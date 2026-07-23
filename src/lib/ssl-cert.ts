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

const CERT_BEGIN = '-----BEGIN CERTIFICATE-----';
const CERT_END = '-----END CERTIFICATE-----';

const KEY_BEGINS = [
  '-----BEGIN PRIVATE KEY-----',
  '-----BEGIN RSA PRIVATE KEY-----',
  '-----BEGIN EC PRIVATE KEY-----',
];
const KEY_ENDS = [
  '-----END PRIVATE KEY-----',
  '-----END RSA PRIVATE KEY-----',
  '-----END EC PRIVATE KEY-----',
];

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

/** True iff the content contains both a CERTIFICATE begin and end marker. */
export function validatePemCert(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  return content.includes(CERT_BEGIN) && content.includes(CERT_END);
}

/** True iff the content contains a recognised PRIVATE KEY begin/end pair. */
export function validatePemKey(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  const hasBegin = KEY_BEGINS.some((b) => content.includes(b));
  const hasEnd = KEY_ENDS.some((e) => content.includes(e));
  return hasBegin && hasEnd;
}

/**
 * Validate that a stored cert/key path is safe to embed in nginx config:
 *   - non-empty absolute path
 *   - located under `sslDir` (default `/etc/nginx/ssl`)
 *   - no `..` traversal
 * Path separators are normalised to `/` so the check is platform-independent.
 */
export function isSafeSslPath(p: string, sslDir: string = SSL_DIR_DEFAULT): boolean {
  if (!p || typeof p !== 'string') return false;
  if (!path.isAbsolute(p)) return false;
  const np = p.replace(/\\/g, '/');
  const nd = sslDir.replace(/\\/g, '/');
  if (!np.startsWith(nd)) return false;
  if (np.includes('..')) return false;
  return true;
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
