/**
 * scrape.mjs — Scrape the source WordPress/WooCommerce site
 * (www.qtechvending.com) into structured JSON for seeding.
 *
 * Output:
 *   scripts/data/categories.json  [{ slug, name, icon, description }]
 *   scripts/data/products.json    [{ slug, sku, name, shortDescription, description, images[], specs[], categories[] }]
 *   scripts/data/blogs.json       [{ slug, title, excerpt, content, publishedAt, image }]
 *
 * Only ENGLISH source content is captured (the trilingual UI falls back to
 * English where zh/ar translations are not yet provided — see ARCH §8⑤).
 *
 * Run: `npm run scrape`
 */
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
mkdirSync(DATA_DIR, { recursive: true });

const BASE = process.env.SOURCE_URL || 'https://www.qtechvending.com';
const FETCH_TIMEOUT = 20000;

// Emoji icons for the 11 categories (fallback; override if source provides one).
const CATEGORY_ICONS = {
  'all-machines': '🏭',
  'fresh-flower-vending-machine': '🌸',
  'pizza-vending-machine': '🍕',
  'cotton-candy-machine': '🍬',
  'fruit-vegetable-egg-vending-machine': '🥚',
  'sugar-cane-juice-vending-machine': '🥤',
  'ice-maker-vending-machine': '🧊',
  'coffee-vending-machine': '☕',
  'french-fry-vending-machine': '🍟',
  'bubble-tea-vending-machine': '🧋',
  'popcorn-vending-machine': '🍿',
};

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QtechScraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function slugFromUrl(url, segment) {
  // segment e.g. 'product' or 'product-category'
  const re = new RegExp(`/index\\.php/${segment}/([^/]+)/?`);
  const m = url.match(re);
  return m ? m[1] : '';
}

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function extractImages($) {
  const imgs = new Set();
  $('div.woocommerce-product-gallery img, img.wp-post-image, .flex-control-thumbs img, .woocommerce-product-gallery__image img')
    .each((_, el) => {
      const src =
        $(el).attr('data-large_image') ||
        $(el).attr('data-src') ||
        $(el).attr('src');
      if (src && src.startsWith('http') && !/cropped-|logo|favicon/i.test(src)) {
        imgs.add(src);
      }
    });
  return [...imgs].slice(0, 8);
}

function extractSpecs($) {
  const specs = [];
  const table = $('table.shop_attributes').first();
  if (table.length) {
    table.find('tr').each((_, tr) => {
      const param = clean($(tr).find('th').text());
      const value = clean($(tr).find('td').text());
      if (param && value) specs.push({ param, value });
    });
  }
  if (!specs.length) {
    // Fallback: look for any <table> inside the description panel.
    $('.woocommerce-Tabs-panel--description table tr').each((_, tr) => {
      const cells = $(tr).find('th, td');
      if (cells.length >= 2) {
        const param = clean($(cells[0]).text());
        const value = clean($(cells[1]).text());
        if (param && value) specs.push({ param, value });
      }
    });
  }
  return specs;
}

async function scrapeCategories() {
  const xml = await fetchHtml(`${BASE}/wp-sitemap-taxonomies-product_cat-1.xml`);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('product-category'));
  const categories = [];
  for (const url of urls) {
    const slug = slugFromUrl(url, 'product-category');
    if (!slug) continue;
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      const name = clean($('.woocommerce-products-header__title').first().text() || $('h1').first().text());
      const description = clean($('.term-description').first().text());
      categories.push({
        slug,
        name: name || slug,
        icon: CATEGORY_ICONS[slug] || '🏷️',
        description: description || '',
        order: categories.length,
      });
      console.log(`  category: ${slug}`);
    } catch (e) {
      console.warn(`  skip category ${slug}: ${e.message}`);
    }
  }
  return categories;
}

async function scrapeProducts() {
  const xml = await fetchHtml(`${BASE}/wp-sitemap-posts-product-1.xml`);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('/product/'));
  const products = [];
  let i = 0;
  for (const url of urls) {
    const slug = slugFromUrl(url, 'product');
    if (!slug) continue;
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      const name = clean($('h1.product_title').first().text() || $('h1').first().text());
      const descHtml = $('.woocommerce-Tabs-panel--description').first().html() || $('.description').first().html() || '';
      const description = clean($('.woocommerce-Tabs-panel--description').first().text() || $('.description').first().text());
      const shortDescription = clean($('.woocommerce-product-details__short-description').first().text()) || (description.split('. ')[0] || '');
      const images = extractImages($);
      const specs = extractSpecs($);
      const categories = $('.posted_in a, .product_meta .posted_in a')
        .map((_, el) => {
          const href = $(el).attr('href') || '';
          const s = slugFromUrl(href, 'product-category');
          return s && s !== 'all-machines' ? s : null;
        })
        .get()
        .filter(Boolean);
      const skuRaw = clean($('.sku').first().text());
      const sku = skuRaw || `QTV-${String(++i).padStart(3, '0')}`;
      products.push({
        slug,
        sku,
        name: name || slug,
        shortDescription,
        description,
        descriptionHtml: descHtml,
        images,
        specs,
        categories: [...new Set(categories)],
        order: i,
      });
      console.log(`  product: ${slug} (${images.length} imgs, ${specs.length} specs, cats: ${categories.join(',')})`);
    } catch (e) {
      console.warn(`  skip product ${slug}: ${e.message}`);
    }
  }
  return products;
}

async function scrapeBlogs() {
  const xml = await fetchHtml(`${BASE}/wp-sitemap-posts-post-1.xml`);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('/index.php/20'));
  const blogs = [];
  for (const url of urls) {
    const slug = url.replace(/\/$/, '').split('/').pop();
    if (!slug) continue;
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      const title = clean($('.entry-title').first().text() || $('h1').first().text());
      const contentHtml = $('.entry-content').first().html() || '';
      const content = clean($('.entry-content').first().text());
      const excerpt = clean($('.entry-summary').first().text()) || content.slice(0, 200);
      const dateMatch = url.match(/\/index\.php\/(\d{4})\/(\d{2})\/(\d{2})\//);
      const publishedAt = dateMatch
        ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
        : new Date().toISOString().slice(0, 10);
      const image =
        $('.entry-content img.wp-post-image').first().attr('src') ||
        $('.wp-post-image').first().attr('src') ||
        $('meta[property="og:image"]').attr('content') ||
        '';
      blogs.push({
        slug,
        title: title || slug,
        excerpt,
        content,
        contentHtml,
        publishedAt,
        image: image.startsWith('http') ? image : '',
      });
      console.log(`  blog: ${slug} (${publishedAt})`);
    } catch (e) {
      console.warn(`  skip blog ${slug}: ${e.message}`);
    }
  }
  return blogs;
}

async function main() {
  console.log('Scraping categories...');
  const categories = await scrapeCategories();
  console.log('Scraping products...');
  const products = await scrapeProducts();
  console.log('Scraping blogs...');
  const blogs = await scrapeBlogs();

  writeFileSync(join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
  writeFileSync(join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
  writeFileSync(join(DATA_DIR, 'blogs.json'), JSON.stringify(blogs, null, 2));

  console.log('\nDone.');
  console.log(`  categories: ${categories.length}`);
  console.log(`  products:   ${products.length}`);
  console.log(`  blogs:      ${blogs.length}`);
}

main().catch((e) => {
  console.error('Scrape failed:', e);
  process.exit(1);
});
