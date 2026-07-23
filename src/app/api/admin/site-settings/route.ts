import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  requireAdmin,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  apiError,
} from '@/lib/auth';
import { SITE_CONFIG } from '@/lib/site-config';
import { nginxManager, type NginxApplyResult } from '@/lib/nginx';
import { preprocessSslCerts, SslCertError, SSL_DIR_DEFAULT } from '@/lib/ssl-cert';
import type { SslCert } from '@/types';

export const dynamic = 'force-dynamic';
// This route writes certificate files with `node:fs`, so it must run on the
// Node.js runtime (not Edge).
export const runtime = 'nodejs';

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
  const jsonFields = [
    'company',
    'address',
    'socials',
    'sameAs',
    'keywords',
    'defaultTitle',
    'defaultDescription',
    'sslCerts',
  ];

  // V52.1: preprocess sslCerts BEFORE touching the DB. If certContent/keyContent
  // are pasted, write the PEMs to disk and rewrite certPath/keyPath to the auto
  // paths (transient fields are dropped). Any validation failure returns 400
  // without persisting anything.
  let preSslCerts: SslCert[] | undefined;
  if ('sslCerts' in body && body.sslCerts !== undefined) {
    try {
      preSslCerts = preprocessSslCerts(body.sslCerts, {
        sslDir: process.env.NGINX_SSL_DIR || SSL_DIR_DEFAULT,
      });
    } catch (e) {
      const err = e as SslCertError;
      const code = err?.code === 'SSL_WRITE_FAILED' ? 'SSL_WRITE_FAILED' : 'SSL_CONTENT_INVALID';
      // Never echo the private key in the response.
      return apiError(code, err?.message || 'Invalid SSL content.', 400);
    }
  }

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
      if (f === 'sslCerts') {
        // Use the preprocessed (file-written, stripped) array; never store the
        // transient certContent/keyContent.
        (data as Record<string, unknown>)[f] = preSslCerts ?? body.sslCerts;
      } else {
        (data as Record<string, unknown>)[f] = body[f];
      }
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

    // V52 (T3): after persisting, apply the SSL config to live nginx.
    const nginxResult: NginxApplyResult = await nginxManager.applyConfig({
      forceHttps: (updated.forceHttps as boolean) ?? false,
      sslCerts: (updated.sslCerts as SslCert[] | null) ?? [],
    });
    if (!nginxResult.ok) {
      // DB is already saved; report the nginx failure so the UI can show it.
      return NextResponse.json(
        {
          code: 'NGINX_T',
          message: `证书已保存，但应用 nginx 失败：${nginxResult.error ?? '未知错误'}`,
          data: updated,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updated,
      nginx: { ok: true, appliedDomains: nginxResult.appliedDomains ?? 0 },
    });
  } catch (err) {
    console.error('[admin/site-settings] PATCH failed:', err);
    return serverErrorResponse();
  }
}
