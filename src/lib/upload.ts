import { promises as fsp } from 'node:fs';
import path from 'node:path';

/**
 * UploadService — validates and persists admin-uploaded images to
 * `/public/images/<type>/<slug>/<n>.<ext>` (the same static dir Next serves),
 * returning the web-accessible path. Extension is derived ONLY from the MIME
 * type (never the client file name) to prevent malicious extensions (.php …).
 *
 * Zero runtime dependencies: uses Node built-in `fs/promises` + `path`.
 */

export type UploadType = 'products' | 'blog';

export interface UploadError {
  code: string;
  message: string;
}

export interface UploadFileInput {
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

const MIME_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const SLUG_RE = /^[\w-]+$/;
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

/** Resolve the on-disk extension from a MIME type, or null if not allowed. */
export function resolveExt(mime: string): string | null {
  return MIME_EXT[mime] ?? null;
}

/** Whether `type` is an accepted upload bucket. */
export function isValidType(type: string): type is UploadType {
  return type === 'products' || type === 'blog';
}

/** Whether a slug matches the safe pattern `^[\w-]+$`. */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** Sanitize a client file name into something safe for logging / fallback use. */
export function sanitizeFileName(name: string): string {
  return (name || '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100) || 'file';
}

/**
 * Validate an upload request. Returns an UploadError (with a stable `code`) when
 * invalid, or null when the request may proceed.
 */
export function validateUpload(
  file: { type: string; size: number },
  type: string,
  slug: string
): UploadError | null {
  if (!isValidType(type)) {
    return { code: 'UPLOAD_TYPE', message: 'type must be "products" or "blog".' };
  }
  if (!slug || !isValidSlug(slug)) {
    return { code: 'UPLOAD_SLUG', message: 'slug is invalid (allowed: ^[\\w-]+$).' };
  }
  const ext = resolveExt(file.type);
  if (!ext) {
    return {
      code: 'UPLOAD_MIME',
      message: 'Only webp/jpeg/png (and optionally gif) images are allowed.',
    };
  }
  if (file.size > MAX_SIZE) {
    return { code: 'UPLOAD_SIZE', message: 'File exceeds the 5MB limit.' };
  }
  return null;
}

/**
 * Scan a directory for `<n>.<ext>` files and return the next sequence number
 * (max existing + 1). Returns 1 when the directory is missing/empty.
 */
export async function nextSeq(dir: string): Promise<number> {
  let max = 0;
  try {
    const entries = await fsp.readdir(dir);
    for (const entry of entries) {
      const m = entry.match(/^(\d+)\.[a-zA-Z0-9]+$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
  } catch {
    // Directory does not exist yet — max stays 0.
  }
  return max + 1;
}

/**
 * Persist a single image file to disk and return its web-accessible path.
 * Throws an Error carrying a `.code` property on validation failure.
 */
export async function save(file: UploadFileInput, type: UploadType, slug: string): Promise<string> {
  const err = validateUpload(file, type, slug);
  if (err) {
    const e = new Error(err.message) as Error & { code: string };
    e.code = err.code;
    throw e;
  }
  const ext = resolveExt(file.type) as string;
  const dir = path.join(PUBLIC_IMAGES_DIR, type, slug);

  // mkdir 755 so nginx (non-root worker) can traverse; recursive for new slug.
  await fsp.mkdir(dir, { recursive: true, mode: 0o755 });
  // Defend against umask stripping the execute bit on the directory.
  await fsp.chmod(dir, 0o755);

  const seq = await nextSeq(dir);
  const fileName = `${seq}.${ext}`;
  const fullPath = path.join(dir, fileName);

  const buf = Buffer.from(await file.arrayBuffer());
  // writeFile 644 then chmod 644 → nginx worker can read (prevents 403).
  await fsp.writeFile(fullPath, buf, { mode: 0o644 });
  await fsp.chmod(fullPath, 0o644);

  return `/images/${type}/${slug}/${fileName}`;
}
