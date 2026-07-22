import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { SITE_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/** GET the single SiteSetting row (slug = 'main'). */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { slug: 'main' } });
    if (!setting) return notFoundResponse('SiteSetting');
    return NextResponse.json({ data: setting });
  } catch (err) {
    console.error('[admin/site-settings] GET failed:', err);
    return serverErrorResponse();
  }
}

/**
 * PATCH a subset of SiteSetting fields. `slug` is never accepted.
 * Updatable fields are whitelisted; `socials`/`sameAs`/`keywords`/`defaultTitle`/
 * `defaultDescription`/`company`/`address` are JSON, the rest are strings.
 */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const stringFields = ['email', 'phone', 'addressLine', 'ogImage', 'twitterHandle', 'sslCertPath', 'sslKeyPath'];
  const booleanFields = ['forceHttps', 'sslEnabled'];
  const jsonFields = ['company', 'address', 'socials', 'sameAs', 'keywords', 'defaultTitle', 'defaultDescription'];

  const data: Prisma.SiteSettingUpdateInput = {};
  for (const f of stringFields) {
    if (f in body && (body[f] === null || typeof body[f] === 'string')) {
      (data as Record<string, unknown>)[f] = body[f];
    }
  }
  for (const f of booleanFields) {
    if (f in body && typeof body[f] === 'boolean') {
      (data as Record<string, unknown>)[f] = body[f];
    }
  }
  for (const f of jsonFields) {
    if (f in body && body[f] !== undefined) {
      (data as Record<string, unknown>)[f] = body[f];
    }
  }

  try {
    const updated = await prisma.siteSetting.upsert({
      where: { slug: 'main' },
      update: data,
      create: {
        slug: 'main',
        company: (data.company as Prisma.InputJsonValue) ?? {
          en: SITE_CONFIG.company,
          zh: '广州秋彦科技有限公司',
          ar: SITE_CONFIG.company,
        },
        email: (data.email as string) ?? SITE_CONFIG.email,
        phone: (data.phone as string) ?? SITE_CONFIG.phone,
        addressLine: (data.addressLine as string | null) ?? null,
        ogImage: (data.ogImage as string | null) ?? SITE_CONFIG.ogImage,
        twitterHandle: (data.twitterHandle as string | null) ?? SITE_CONFIG.twitterHandle,
        forceHttps: (data.forceHttps as boolean) ?? false,
        sslCertPath: (data.sslCertPath as string | null) ?? null,
        sslKeyPath: (data.sslKeyPath as string | null) ?? null,
        sslEnabled: (data.sslEnabled as boolean) ?? false,
        address: data.address !== undefined ? (data.address as Prisma.InputJsonValue) : Prisma.JsonNull,
        socials: data.socials !== undefined ? (data.socials as Prisma.InputJsonValue) : Prisma.JsonNull,
        sameAs: data.sameAs !== undefined ? (data.sameAs as Prisma.InputJsonValue) : Prisma.JsonNull,
        keywords: data.keywords !== undefined ? (data.keywords as Prisma.InputJsonValue) : Prisma.JsonNull,
        defaultTitle: data.defaultTitle !== undefined ? (data.defaultTitle as Prisma.InputJsonValue) : Prisma.JsonNull,
        defaultDescription:
          data.defaultDescription !== undefined ? (data.defaultDescription as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[admin/site-settings] PATCH failed:', err);
    return serverErrorResponse();
  }
}
