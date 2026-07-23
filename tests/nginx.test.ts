import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nginxManager } from '@/lib/nginx';

// Shared, hoisted mock state so both the factory and the tests see the same store.
const { mockStore, mockFns } = vi.hoisted(() => ({
  mockStore: {} as Record<string, string>,
  mockFns: { nginxTestOk: true, nginxReloadOk: true },
}));

// Normalize a path so the in-memory store is platform-independent: backslashes
// (emitted by path.join on Windows) collapse to forward slashes, matching the
// forward-slash keys used by the test fixtures.
const norm = (p: string): string => String(p).replace(/\\/g, '/');

vi.mock('node:fs', () => ({
  promises: {
    access: vi.fn(async (p: string) => {
      if (!(norm(p) in mockStore)) throw new Error('ENOENT');
    }),
    readFile: vi.fn(async (p: string) => {
      if (!(norm(p) in mockStore)) throw new Error('ENOENT');
      return mockStore[norm(p)];
    }),
    writeFile: vi.fn(async (p: string, data: string) => {
      mockStore[norm(p)] = String(data);
    }),
    copyFile: vi.fn(async (src: string, dst: string) => {
      if (!(norm(src) in mockStore)) throw new Error('ENOENT');
      mockStore[norm(dst)] = mockStore[norm(src)];
    }),
    unlink: vi.fn(async (p: string) => {
      delete mockStore[norm(p)];
    }),
    mkdir: vi.fn(async () => {}),
    readdir: vi.fn(async (dir: string) =>
      Object.keys(mockStore)
        .filter((k) => k.startsWith(norm(dir)))
        .map((k) => k.slice(norm(dir).length).replace(/^[/\\]/, ''))
        .filter(Boolean)
    ),
    chmod: vi.fn(async () => {}),
  },
}));

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn((_bin: string, args: string[]) => {
    if (args[0] === '-t') {
      if (!mockFns.nginxTestOk) {
        const e = new Error('nginx -t failed') as Error & { stderr?: string };
        e.stderr = 'duplicate default server';
        throw e;
      }
      return Buffer.from('');
    }
    if (args[0] === '-s' && args[1] === 'reload') {
      if (!mockFns.nginxReloadOk) {
        const e = new Error('reload failed') as Error & { stderr?: string };
        e.stderr = 'reload error';
        throw e;
      }
      return Buffer.from('');
    }
    return Buffer.from('');
  }),
}));

const enabledCert = {
  domain: 'www.qtechvending.com',
  certPath: '/etc/nginx/ssl/www/full.pem',
  keyPath: '/etc/nginx/ssl/www/priv.pem',
  enabled: true,
};
const fragKey = '/etc/nginx/conf.d/qtechvending-ssl-www.qtechvending.com.conf';

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  mockFns.nginxTestOk = true;
  mockFns.nginxReloadOk = true;
});

describe('generateSslFragment', () => {
  it('emits a 443 server block with the domain and cert paths', () => {
    const s = nginxManager.generateSslFragment(enabledCert);
    expect(s).toContain('listen 443 ssl');
    expect(s).toContain('server_name www.qtechvending.com');
    expect(s).toContain('ssl_certificate     /etc/nginx/ssl/www/full.pem;');
    expect(s).toContain('ssl_certificate_key /etc/nginx/ssl/www/priv.pem;');
  });
  it('throws on an unsafe cert path', () => {
    expect(() =>
      nginxManager.generateSslFragment({
        domain: 'a.com',
        certPath: '/x/../y',
        keyPath: '/c/priv.pem',
        enabled: true,
      })
    ).toThrow();
  });
});

describe('generateHttpInc', () => {
  it('emits a 301 when forceHttps is on', () => {
    const s = nginxManager.generateHttpInc(true, ['www.qtechvending.com']);
    expect(s).toContain('return 301 https://$host$request_uri');
    expect(s).toContain('www.qtechvending.com');
  });
  it('does not emit a redirect when forceHttps is off', () => {
    const s = nginxManager.generateHttpInc(false, ['www.qtechvending.com']);
    expect(s).not.toContain('return 301');
  });
});

describe('sanitize / validate', () => {
  it('sanitizeDomain keeps dots', () => {
    expect(nginxManager.sanitizeDomain('www.qtechvending.com')).toBe('www.qtechvending.com');
  });
  it('validateDomain rejects spaces', () => {
    expect(() => nginxManager.validateDomain('bad domain')).toThrow();
  });
  it('validateCertPath rejects relative paths', () => {
    expect(() => nginxManager.validateCertPath('etc/nginx/x.pem')).toThrow();
  });
  it('validateCertPath rejects path traversal', () => {
    expect(() => nginxManager.validateCertPath('/etc/nginx/../x')).toThrow();
  });
});

describe('applyConfig', () => {
  it('writes the fragment + http.inc and reports success when nginx -t passes', async () => {
    const res = await nginxManager.applyConfig({ forceHttps: true, sslCerts: [enabledCert] });
    expect(res.ok).toBe(true);
    expect(res.appliedDomains).toBe(1);
    expect(mockStore[fragKey]).toContain('listen 443 ssl');
    expect(mockStore[fragKey]).toContain('server_name www.qtechvending.com');
    expect(mockStore['/etc/nginx/conf.d/qtechvending-http.inc']).toContain(
      'return 301 https://$host$request_uri'
    );
  });

  it('rolls back to the .bak when nginx -t fails (never reloads)', async () => {
    mockStore[fragKey] = 'OLD FRAGMENT CONTENT';
    mockFns.nginxTestOk = false; // simulate nginx -t failure
    const res = await nginxManager.applyConfig({ forceHttps: true, sslCerts: [enabledCert] });
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
    // The previous (good) content is restored, not the new (bad) one.
    expect(mockStore[fragKey]).toBe('OLD FRAGMENT CONTENT');
  });

  it('rejects an invalid cert path before touching disk', async () => {
    const res = await nginxManager.applyConfig({
      forceHttps: true,
      sslCerts: [
        {
          domain: 'www.qtechvending.com',
          certPath: '../../etc/passwd',
          keyPath: '/etc/nginx/ssl/www/priv.pem',
          enabled: true,
        },
      ],
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('Invalid certificate path');
  });

  it('removes fragments for disabled domains', async () => {
    mockStore[fragKey] = 'PREV';
    const res = await nginxManager.applyConfig({
      forceHttps: false,
      sslCerts: [{ ...enabledCert, enabled: false }],
    });
    expect(res.ok).toBe(true);
    expect(mockStore[fragKey]).toBeUndefined();
  });
});
