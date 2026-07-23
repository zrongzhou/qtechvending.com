/**
 * QA regression test for POST /api/admin/password (commit 1b596b0).
 *
 * Strategy: import the REAL route handler from src/app/api/admin/password/route.ts
 * and exercise its decision branches. `next/server`, `@/lib/auth` and `@/lib/prisma`
 * are mocked, but `bcryptjs` is REAL so the bcrypt.compare / bcrypt.hash branches
 * are genuinely executed (this is the security-critical path).
 *
 * Run: npx vitest run tests/admin-password.test.ts
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// --- Fake NextResponse/NextRequest (mirrors the shape the route uses) ----------
class FakeCookies {
  setCalls: Array<{ name: string; value: string; opts: any }> = [];
  set(name: string, value: string, opts: any) {
    this.setCalls.push({ name, value, opts });
  }
}
function fakeRes(body: any, status = 200) {
  return { status, body, cookies: new FakeCookies() };
}

vi.mock('next/server', () => {
  return {
    NextRequest: class {
      _body: any;
      constructor(init?: any) {
        this._body = init?.body !== undefined ? JSON.parse(init.body) : {};
      }
      async json() {
        return this._body;
      }
    },
    NextResponse: {
      json: (body: any, init: any = {}) => fakeRes(body, init.status ?? 200),
    },
  };
});

// --- Mock @/lib/auth -----------------------------------------------------------
vi.mock('@/lib/auth', () => {
  const mk = (status: number, body: any) => ({ status, body, cookies: new FakeCookies() });
  return {
    requireAdmin: vi.fn(),
    generateAdminToken: vi.fn((p: any) => 'tok::' + p.sub),
    badRequestResponse: (msg: string) => mk(400, { error: msg }),
    serverErrorResponse: () => mk(500, { error: 'Internal server error.' }),
  };
});

// --- Mock @/lib/prisma ---------------------------------------------------------
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Import AFTER mocks are registered.
import { POST } from '@/app/api/admin/password/route';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ADMIN = { sub: 'u1', username: 'admin', role: 'admin' };
const CURRENT_PW = 'OldPass1';
const NEW_PW_VALID = 'NewPass9';

/** Helper: build a fake request whose json() returns `body` (or throws if invalid). */
function makeReq(body: any, invalidJson = false): any {
  return {
    async json() {
      if (invalidJson) throw new SyntaxError('Unexpected token');
      return body;
    },
  };
}

describe('POST /api/admin/password', () => {
  let currentHash: string;

  beforeAll(async () => {
    currentHash = await bcrypt.hash(CURRENT_PW, 10);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (requireAdmin as any).mockResolvedValue(ADMIN);
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'u1', passwordHash: currentHash });
    (prisma.user.update as any).mockResolvedValue({ id: 'u1' });
  });

  it('rejects unauthenticated requests with 401', async () => {
    (requireAdmin as any).mockResolvedValue(null);
    const res: any = await POST(makeReq({ currentPassword: CURRENT_PW, newPassword: NEW_PW_VALID }));
    expect(res.status).toBe(401);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 when fields are missing', async () => {
    const res: any = await POST(makeReq({ currentPassword: '', newPassword: '' }));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('必填');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 on malformed JSON body', async () => {
    const res: any = await POST(makeReq({}, true));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid request body');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 "当前密码错误" when current password is wrong (real bcrypt.compare=false)', async () => {
    const res: any = await POST(makeReq({ currentPassword: 'WrongPass1', newPassword: NEW_PW_VALID }));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('当前密码错误');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 when new password is too short', async () => {
    const res: any = await POST(makeReq({ currentPassword: CURRENT_PW, newPassword: 'Sh1' }));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('至少 8 位');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 when new password has no digit', async () => {
    const res: any = await POST(makeReq({ currentPassword: CURRENT_PW, newPassword: 'abcdefgh' }));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('字母和数字');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 when new password has no letter', async () => {
    const res: any = await POST(makeReq({ currentPassword: CURRENT_PW, newPassword: '12345678' }));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('字母和数字');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('succeeds with valid input: updates hash, re-issues cookie, no hash leak', async () => {
    const res: any = await POST(makeReq({ currentPassword: CURRENT_PW, newPassword: NEW_PW_VALID }));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // passwordHash never returned to client
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');

    // DB update used a fresh bcrypt hash
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
    const updateArg = (prisma.user.update as any).mock.calls[0][0];
    expect(updateArg.where.id).toBe('u1');
    const newHash: string = updateArg.data.passwordHash;
    expect(newHash).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
    // new hash must differ from the old one and verify against the new password
    expect(newHash).not.toBe(currentHash);
    expect(await bcrypt.compare(NEW_PW_VALID, newHash)).toBe(true);

    // cookie: httpOnly + sameSite=lax + maxAge=12h, path=/
    const cookie = res.cookies.setCalls.find((c: any) => c.name === 'admin_auth');
    expect(cookie).toBeDefined();
    expect(cookie!.value).toBe('tok::u1');
    expect(cookie!.opts.httpOnly).toBe(true);
    expect(cookie!.opts.sameSite).toBe('lax');
    expect(cookie!.opts.path).toBe('/');
    expect(cookie!.opts.maxAge).toBe(60 * 60 * 12);
    // After fix A: `secure` is now set. It tracks NODE_ENV === 'production'
    // (true in prod/HTTPS, false/undefined in local dev for debuggability).
    expect(cookie!.opts.secure).toBe(process.env.NODE_ENV === 'production');
  });

  it('coerces non-string (numeric) currentPassword to string -> 400 (no 500, no update)', async () => {
    // After fix B: String(body.currentPassword ?? '') stringifies 12345678 -> "12345678",
    // which is a wrong password -> bcrypt.compare=false -> 400 (was 500 before the fix).
    const res: any = await POST(makeReq({ currentPassword: 12345678 as any, newPassword: NEW_PW_VALID }));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('当前密码错误');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
