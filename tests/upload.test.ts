import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import * as UploadService from '@/lib/upload';

const { mockStore } = vi.hoisted(() => ({ mockStore: {} as Record<string, string> }));

// Normalize a path so the in-memory store is platform-independent: backslashes
// (emitted by path.join on Windows) collapse to forward slashes, matching the
// forward-slash keys used by the test fixtures.
const norm = (p: string): string => String(p).replace(/\\/g, '/');

vi.mock('node:fs', () => ({
  promises: {
    access: vi.fn(async (p: string) => {
      if (!(norm(p) in mockStore)) throw new Error('ENOENT');
    }),
    readFile: vi.fn(async (p: string) => mockStore[norm(p)]),
    writeFile: vi.fn(async (p: string, data: Buffer | string) => {
      mockStore[norm(p)] = data.toString();
    }),
    copyFile: vi.fn(async (s: string, d: string) => {
      mockStore[norm(d)] = mockStore[norm(s)];
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

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
});

describe('resolveExt', () => {
  it('maps MIME to extension', () => {
    expect(UploadService.resolveExt('image/jpeg')).toBe('jpg');
    expect(UploadService.resolveExt('image/png')).toBe('png');
    expect(UploadService.resolveExt('image/gif')).toBe('gif');
    expect(UploadService.resolveExt('image/webp')).toBe('webp');
  });
  it('returns null for disallowed MIME', () => {
    expect(UploadService.resolveExt('application/json')).toBeNull();
    expect(UploadService.resolveExt('text/plain')).toBeNull();
  });
});

describe('validateUpload', () => {
  it('rejects bad type', () => {
    expect(UploadService.validateUpload({ type: 'image/png', size: 1 }, 'bogus', 'rose')).toMatchObject({
      code: 'UPLOAD_TYPE',
    });
  });
  it('rejects bad slug', () => {
    expect(
      UploadService.validateUpload({ type: 'image/png', size: 1 }, 'products', 'bad slug!')
    ).toMatchObject({ code: 'UPLOAD_SLUG' });
  });
  it('rejects bad mime', () => {
    expect(UploadService.validateUpload({ type: 'text/plain', size: 1 }, 'products', 'rose')).toMatchObject({
      code: 'UPLOAD_MIME',
    });
  });
  it('rejects oversize', () => {
    expect(
      UploadService.validateUpload({ type: 'image/png', size: 6 * 1024 * 1024 }, 'products', 'rose')
    ).toMatchObject({ code: 'UPLOAD_SIZE' });
  });
  it('accepts a valid request', () => {
    expect(UploadService.validateUpload({ type: 'image/webp', size: 10 }, 'blog', 'my-post')).toBeNull();
  });
});

describe('nextSeq', () => {
  it('returns max existing index + 1', async () => {
    const dir = path.join(process.cwd(), 'public', 'images', 'products', 'seqtest');
    // Normalize keys to match the mock store's forward-slash convention.
    mockStore[norm(path.join(dir, '1.webp'))] = 'x';
    mockStore[norm(path.join(dir, '3.png'))] = 'x';
    expect(await UploadService.nextSeq(dir)).toBe(4);
  });
  it('returns 1 when directory is empty', async () => {
    const dir = path.join(process.cwd(), 'public', 'images', 'products', 'empty');
    expect(await UploadService.nextSeq(dir)).toBe(1);
  });
});

describe('save', () => {
  it('returns the web path and writes the file', async () => {
    const p = await UploadService.save(
      { type: 'image/png', size: 100, arrayBuffer: async () => new ArrayBuffer(8) },
      'products',
      'rose'
    );
    expect(p).toBe('/images/products/rose/1.png');
  });

  it('throws with a stable code on invalid MIME', async () => {
    await expect(
      UploadService.save(
        { type: 'text/plain', size: 1, arrayBuffer: async () => new ArrayBuffer(1) },
        'products',
        'rose'
      )
    ).rejects.toMatchObject({ code: 'UPLOAD_MIME' });
  });

  it('derives the extension from MIME, ignoring the client file name', async () => {
    const p = await UploadService.save(
      { type: 'image/jpeg', size: 100, arrayBuffer: async () => new ArrayBuffer(8) },
      'blog',
      'post-1'
    );
    expect(p).toBe('/images/blog/post-1/1.jpg');
  });
});
