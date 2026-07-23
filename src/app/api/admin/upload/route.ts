import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';
import * as UploadService from '@/lib/upload';

// Must run on Node — we write files to disk with `fs`.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/upload
 *
 * Multipart form fields:
 *   file: File          (single image)
 *   type: 'products'|'blog'
 *   slug: string         (must match ^[\w-]+$)
 *
 * Success 200: { data: string[] }   — web-accessible path(s), e.g.
 *   ["/images/products/rose-vending/1.webp"]
 * Failure 400: { code, message }    — codes: UPLOAD_TYPE / UPLOAD_SLUG /
 *   UPLOAD_MIME / UPLOAD_SIZE / UPLOAD_FILE / UPLOAD_FAILED
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { code: 'UPLOAD_FORM', message: 'Invalid multipart form.' },
      { status: 400 }
    );
  }

  const file = form.get('file');
  const type = String(form.get('type') ?? '');
  const slug = String(form.get('slug') ?? '');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { code: 'UPLOAD_FILE', message: 'file is required.' },
      { status: 400 }
    );
  }

  const err = UploadService.validateUpload(file, type, slug);
  if (err) {
    return NextResponse.json({ code: err.code, message: err.message }, { status: 400 });
  }

  try {
    const savedPath = await UploadService.save(file, type as UploadService.UploadType, slug);
    return NextResponse.json({ data: [savedPath] });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code || 'UPLOAD_FAILED';
    const message = e instanceof Error ? e.message : 'Upload failed.';
    return NextResponse.json({ code, message }, { status: 400 });
  }
}
