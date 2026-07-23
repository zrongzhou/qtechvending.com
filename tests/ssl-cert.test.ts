import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import {
  preprocessSslCerts,
  writeSslCertFiles,
  validatePemCert,
  validatePemKey,
  sanitizeSslDomain,
  isSafeSslPath,
  SslCertError,
} from '@/lib/ssl-cert';

// In-memory store so the fs mock is platform-independent: backslashes emitted
// by path.join on Windows collapse to forward slashes, matching the keys we
// assert against.
const { mockStore } = vi.hoisted(() => ({ mockStore: {} as Record<string, string> }));
const norm = (p: string): string => String(p).replace(/\\/g, '/');

// Mock the synchronous fs surface used by ssl-cert.ts.
vi.mock('node:fs', () => {
  const impl = {
    mkdirSync: vi.fn((dir: string) => {
      mockStore[norm(dir)] = 'DIR';
    }),
    writeFileSync: vi.fn((p: string, data: string) => {
      mockStore[norm(p)] = String(data);
    }),
    chmodSync: vi.fn(() => {}),
    readFileSync: vi.fn((p: string) => mockStore[norm(p)] ?? ''),
    existsSync: vi.fn((p: string) => norm(p) in mockStore),
  };
  return { default: impl, ...impl };
});

const CERT = `-----BEGIN CERTIFICATE-----
MIIBExampleCertificateContent
-----END CERTIFICATE-----`;
const KEY = `-----BEGIN PRIVATE KEY-----
MIIEExamplePrivateKeyContent
-----END PRIVATE KEY-----`;
const RSA_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEExampleRsaKey
-----END RSA PRIVATE KEY-----`;
const EC_KEY = `-----BEGIN EC PRIVATE KEY-----
MIIEExampleEcKey
-----END EC PRIVATE KEY-----`;

describe('validatePem', () => {
  it('accepts a well-formed certificate', () => {
    expect(validatePemCert(CERT)).toBe(true);
  });
  it('rejects a malformed / empty certificate', () => {
    expect(validatePemCert('not a cert')).toBe(false);
    expect(validatePemCert('')).toBe(false);
    expect(validatePemCert('-----BEGIN CERTIFICATE-----')).toBe(false);
  });
  it('accepts PRIVATE KEY / RSA / EC markers', () => {
    expect(validatePemKey(KEY)).toBe(true);
    expect(validatePemKey(RSA_KEY)).toBe(true);
    expect(validatePemKey(EC_KEY)).toBe(true);
  });
  it('rejects a malformed / empty key', () => {
    expect(validatePemKey('not a key')).toBe(false);
    expect(validatePemKey('')).toBe(false);
    expect(validatePemKey('-----BEGIN PRIVATE KEY-----')).toBe(false);
  });
});

describe('sanitizeSslDomain', () => {
  it('keeps a valid hostname', () => {
    expect(sanitizeSslDomain('www.example.com')).toBe('www.example.com');
    expect(sanitizeSslDomain('a-b.c_d')).toBe('a-b.c_d');
  });
  it('throws on empty / traversal / slash / spaces', () => {
    expect(() => sanitizeSslDomain('')).toThrow(SslCertError);
    expect(() => sanitizeSslDomain('  ')).toThrow(SslCertError);
    expect(() => sanitizeSslDomain('..')).toThrow(SslCertError);
    expect(() => sanitizeSslDomain('a/../b')).toThrow(SslCertError);
    expect(() => sanitizeSslDomain('a b')).toThrow(SslCertError);
  });
});

describe('writeSslCertFiles', () => {
  // Use an absolute dir so the helper's `path.isAbsolute` check passes on every
  // platform; assertions are path.join + forward-slash normalized.
  const sslDir = path.resolve(process.cwd(), 'tmp', 'ssl-write-test');
  beforeEach(() => {
    for (const k of Object.keys(mockStore)) delete mockStore[k];
  });

  it('writes ../<domain>.crt|.key with trailing newline and correct paths', () => {
    const res = writeSslCertFiles('example.com', CERT, KEY, { sslDir });
    const certPath = path.join(sslDir, 'example.com.crt');
    const keyPath = path.join(sslDir, 'example.com.key');
    expect(norm(res.certPath)).toBe(norm(certPath));
    expect(norm(res.keyPath)).toBe(norm(keyPath));
    expect(mockStore[norm(certPath)]).toBe(`${CERT.trim()}\n`);
    expect(mockStore[norm(keyPath)]).toBe(`${KEY.trim()}\n`);
  });

  it('throws a recognizable error on an invalid certificate', () => {
    let caught: unknown;
    try {
      writeSslCertFiles('example.com', 'bogus', KEY, { sslDir });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(SslCertError);
    expect((caught as SslCertError).code).toBe('SSL_CERT_INVALID');
  });

  it('throws a recognizable error on an invalid key', () => {
    let caught: unknown;
    try {
      writeSslCertFiles('example.com', CERT, 'bogus', { sslDir });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(SslCertError);
    expect((caught as SslCertError).code).toBe('SSL_KEY_INVALID');
  });

  it('rejects a domain containing ".."', () => {
    expect(() => writeSslCertFiles('..', CERT, KEY, { sslDir })).toThrow(SslCertError);
  });

  it('rejects a domain containing "/"', () => {
    expect(() => writeSslCertFiles('a/b', CERT, KEY, { sslDir })).toThrow(SslCertError);
  });
});

describe('preprocessSslCerts', () => {
  const sslDir = path.resolve(process.cwd(), 'tmp', 'ssl-preprocess-test');
  beforeEach(() => {
    for (const k of Object.keys(mockStore)) delete mockStore[k];
  });

  it('write mode returns auto paths and drops transient fields', () => {
    const out = preprocessSslCerts(
      [{ domain: 'example.com', certContent: CERT, keyContent: KEY }],
      { sslDir }
    );
    expect(out).toHaveLength(1);
    expect(out[0].certContent).toBeUndefined();
    expect(out[0].keyContent).toBeUndefined();
    expect(norm(out[0].certPath)).toBe(norm(path.join(sslDir, 'example.com.crt')));
    expect(norm(out[0].keyPath)).toBe(norm(path.join(sslDir, 'example.com.key')));
    // Files were actually written.
    expect(mockStore[norm(path.join(sslDir, 'example.com.crt'))]).toBe(`${CERT.trim()}\n`);
  });

  it('path mode keeps supplied paths and does NOT write files', () => {
    const out = preprocessSslCerts([
      {
        domain: 'example.com',
        certPath: '/etc/nginx/ssl/example.com.crt',
        keyPath: '/etc/nginx/ssl/example.com.key',
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].certPath).toBe('/etc/nginx/ssl/example.com.crt');
    expect(out[0].keyPath).toBe('/etc/nginx/ssl/example.com.key');
    expect(out[0].certContent).toBeUndefined();
    expect(out[0].keyContent).toBeUndefined();
    expect(Object.keys(mockStore).length).toBe(0);
  });

  it('path mode rejects a path outside the ssl dir', () => {
    expect(() =>
      preprocessSslCerts([
        {
          domain: 'example.com',
          certPath: '/etc/nginx/other/example.com.crt',
          keyPath: '/etc/nginx/ssl/example.com.key',
        },
      ])
    ).toThrow(SslCertError);
  });

  it('write mode rejects a domain with ".."', () => {
    expect(() =>
      preprocessSslCerts([{ domain: '..', certContent: CERT, keyContent: KEY }], { sslDir })
    ).toThrow(SslCertError);
  });

  it('write mode requires BOTH contents when pasting', () => {
    expect(() =>
      preprocessSslCerts([{ domain: 'example.com', certContent: CERT }], { sslDir })
    ).toThrow(SslCertError);
    expect(() =>
      preprocessSslCerts([{ domain: 'example.com', keyContent: KEY }], { sslDir })
    ).toThrow(SslCertError);
  });

  it('returns [] for a non-array input', () => {
    expect(preprocessSslCerts(null)).toEqual([]);
    expect(preprocessSslCerts(undefined)).toEqual([]);
  });

  it('requires paths when no content is pasted', () => {
    expect(() => preprocessSslCerts([{ domain: 'example.com' }])).toThrow(SslCertError);
  });
});

describe('isSafeSslPath', () => {
  it('accepts absolute paths under the ssl dir', () => {
    expect(isSafeSslPath('/etc/nginx/ssl/a.crt')).toBe(true);
    expect(isSafeSslPath('/etc/nginx/ssl/sub/b.key')).toBe(true);
  });
  it('rejects relative / traversal / off-dir paths', () => {
    expect(isSafeSslPath('a.crt')).toBe(false);
    expect(isSafeSslPath('/etc/nginx/ssl/../../etc/passwd')).toBe(false);
    expect(isSafeSslPath('/other/a.crt')).toBe(false);
  });
});
