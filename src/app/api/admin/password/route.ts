import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin, generateAdminToken, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PASSWORD_MIN_LENGTH = 8;

/**
 * POST /api/admin/password
 * Self-service password reset for the currently authenticated admin.
 * Requires the current password (verified) plus a new password that meets the
 * strength policy. On success the admin token is re-issued and set as a cookie
 * so the session is silently renewed without forcing a re-login.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  // Coerce to string so a non-string body (e.g. a number) cannot make
  // bcrypt.compare throw "Illegal arguments" and bubble up as a 500.
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');

  if (!currentPassword || !newPassword) {
    return badRequestResponse('当前密码与新密码均为必填。');
  }

  // Strength policy: at least 8 chars, and must contain both a letter and a digit.
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return badRequestResponse(`新密码至少 ${PASSWORD_MIN_LENGTH} 位。`);
  }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return badRequestResponse('新密码需同时包含字母和数字。');
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: admin.sub } });
    if (!user) {
      return NextResponse.json({ error: '用户不存在。' }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return badRequestResponse('当前密码错误');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Re-issue the admin token and set it as a cookie so the session stays
    // valid without the user having to log in again.
    const token = generateAdminToken({ sub: user.id, username: admin.username });
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (err) {
    console.error('[admin/password] POST failed:', err);
    return serverErrorResponse();
  }
}
