/**
 * download-images.mjs — Download scraped images into /public/images so the
 * site serves them locally (no remote image domains needed).
 *
 * Reads scripts/data/products.json + blogs.json (with source URLs), downloads
 * each image, rewrites the `images` / `image` fields to local paths, and writes
 * the JSON back.
 *
 * Run AFTER `npm run scrape`: `npm run download:images`
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const PUBLIC_DIR = join(__dirname, '..', 'public');

const CONCURRENCY = 4;
const TIMEOUT = 30000;

function extFromUrl(url) {
  const m = url.match(/\.(webp|jpg|jpeg|png|gif)(?:\?.*)?$/i);
  return m ? m[1].toLowerCase() : 'jpg';
}

async function downloadOne(url, dest) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QtechScraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

async function main() {
  const productsPath = join(DATA_DIR, 'products.json');
  const blogsPath = join(DATA_DIR, 'blogs.json');
  if (!existsSync(productsPath)) {
    console.error('products.json not found. Run `npm run scrape` first.');
    process.exit(1);
  }

  const products = JSON.parse(readFileSync(productsPath, 'utf-8'));
  const blogs = existsSync(blogsPath) ? JSON.parse(readFileSync(blogsPath, 'utf-8')) : [];

  let downloaded = 0;
  const pool = new Set();

  // Wrap a download task so the in-flight promise set is pruned when it settles,
  // keeping the active concurrency bounded at CONCURRENCY.
  const startTask = (task) => {
    const p = task();
    pool.add(p);
    p.finally(() => pool.delete(p));
    return p;
  };

  for (const product of products) {
    const dir = join(PUBLIC_DIR, 'images', 'products', product.slug);
    mkdirSync(dir, { recursive: true });
    const localImages = [];
    for (let i = 0; i < (product.images || []).length; i++) {
      const url = product.images[i];
      const ext = extFromUrl(url);
      const rel = `/images/products/${product.slug}/${i + 1}.${ext}`;
      const dest = join(PUBLIC_DIR, 'images', 'products', product.slug, `${i + 1}.${ext}`);
      localImages.push(rel);
      startTask(() =>
        downloadOne(url, dest)
          .then(() => {
            downloaded++;
          })
          .catch((e) => console.warn(`  img fail ${product.slug}/${i + 1}: ${e.message}`))
      );
      if (pool.size >= CONCURRENCY) {
        await Promise.race(pool);
      }
    }
    product.images = localImages;
  }

  for (const blog of blogs) {
    if (!blog.image) continue;
    const ext = extFromUrl(blog.image);
    const rel = `/images/blog/${blog.slug}.${ext}`;
    const dest = join(PUBLIC_DIR, 'images', 'blog', `${blog.slug}.${ext}`);
    mkdirSync(join(PUBLIC_DIR, 'images', 'blog'), { recursive: true });
    startTask(() =>
      downloadOne(blog.image, dest)
        .then(() => {
          downloaded++;
          blog.image = rel;
        })
        .catch((e) => console.warn(`  blog img fail ${blog.slug}: ${e.message}`))
    );
    if (pool.size >= CONCURRENCY) {
      await Promise.race(pool);
    }
  }

  await Promise.all(pool);

  writeFileSync(productsPath, JSON.stringify(products, null, 2));
  writeFileSync(blogsPath, JSON.stringify(blogs, null, 2));

  console.log(`Downloaded ${downloaded} images. Local paths written back to JSON.`);
}

main().catch((e) => {
  console.error('Download failed:', e);
  process.exit(1);
});
