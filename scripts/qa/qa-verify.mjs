/**
 * QA verification script (Edward / software-qa-engineer).
 * Validates:
 *   F. i18n top-level key consistency across en/zh/ar
 *   E. trilingual data completeness in products/categories/blogs
 *
 * Pure static checks — reads JSON files, no DB, no server.
 * Run: node scripts/qa/qa-verify.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const MSG_DIR = join(ROOT, 'src', 'messages');
const DATA_DIR = join(ROOT, 'scripts', 'data');

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

let failures = 0;
const log = (...a) => console.log(...a);

// ---------- F. i18n key consistency ----------
log('\n=== F. i18n top-level key consistency ===');
const en = loadJson(join(MSG_DIR, 'en.json'));
const zh = loadJson(join(MSG_DIR, 'zh.json'));
const ar = loadJson(join(MSG_DIR, 'ar.json'));
const enKeys = Object.keys(en).sort();
const zhKeys = Object.keys(zh).sort();
const arKeys = Object.keys(ar).sort();

log(`en top-level keys: ${enKeys.length}`);
log(`zh top-level keys: ${zhKeys.length}`);
log(`ar top-level keys: ${arKeys.length}`);

const set = (arr) => new Set(arr);
const enSet = set(enKeys);
const zhSet = set(zhKeys);
const arSet = set(arKeys);

const missingInZh = enKeys.filter((k) => !zhSet.has(k));
const missingInAr = enKeys.filter((k) => !arSet.has(k));
const extraInZh = zhKeys.filter((k) => !enSet.has(k));
const extraInAr = arKeys.filter((k) => !enSet.has(k));

if (missingInZh.length) {
  failures++;
  log('FAIL missing in zh.json:', missingInZh);
} else log('PASS: every en key present in zh.json');
if (missingInAr.length) {
  failures++;
  log('FAIL missing in ar.json:', missingInAr);
} else log('PASS: every en key present in ar.json');
if (extraInZh.length) {
  failures++;
  log('FAIL extra keys in zh.json not in en.json:', extraInZh);
} else log('PASS: no extra keys in zh.json');
if (extraInAr.length) {
  failures++;
  log('FAIL extra keys in ar.json not in en.json:', extraInAr);
} else log('PASS: no extra keys in ar.json');

// Verify the specific keys used by the new home sections exist in all three
const requiredHomeKeys = [
  'home.badge', 'home.hero.title', 'home.hero.subtitle', 'home.hero.ctaBrowse',
  'home.hero.ctaContact', 'home.hero.stat1Label', 'home.hero.stat2Label',
  'home.hero.stat3Label', 'home.hero.featuredLabel',
  'home.categories.title', 'home.categories.subtitle', 'home.categories.productCount', 'home.categories.viewAll',
  'home.featured.title', 'home.featured.subtitle', 'home.featured.viewAll', 'home.featured.viewDetails',
  'home.advantages.title', 'home.advantages.factoryDirect', 'home.advantages.factoryDirectDesc',
  'home.advantages.selfService', 'home.advantages.selfServiceDesc',
  'home.advantages.oem', 'home.advantages.oemDesc',
  'home.advantages.globalShipping', 'home.advantages.globalShippingDesc',
  'home.partners.title', 'home.partners.subtitle',
];
const missingHome = requiredHomeKeys.filter((k) => !(enSet.has(k) && zhSet.has(k) && arSet.has(k)));
if (missingHome.length) {
  failures++;
  log('FAIL new-section i18n keys missing in some locale:', missingHome);
} else log('PASS: all new-section i18n keys present in en/zh/ar');

// ---------- E. trilingual data completeness ----------
log('\n=== E. trilingual data completeness ===');

const BAD = (v) => !v || typeof v !== 'string' || v.trim() === '' || v.trim() === 'NO_EN';

function checkI18nObj(obj, label) {
  if (typeof obj === 'string') {
    // seed allows string; toI18n() will normalize. Treat as acceptable-but-note.
    return { ok: true, note: 'string (normalized by seed.toI18n)' };
  }
  if (typeof obj !== 'object' || obj === null) {
    return { ok: false, reason: 'not an object/string' };
  }
  const en = obj.en, zh = obj.zh, ar = obj.ar;
  const bad = [];
  if (BAD(en)) bad.push('en');
  if (BAD(zh)) bad.push('zh');
  if (BAD(ar)) bad.push('ar');
  if (bad.length) return { ok: false, reason: `empty/NO_EN in ${bad.join(',')}` };
  return { ok: true };
}

// Products
const products = loadJson(join(DATA_DIR, 'products.json'));
let pBad = 0;
const pSamples = [];
products.forEach((p, i) => {
  const r = checkI18nObj(p.name, 'name');
  if (!r.ok) { pBad++; log(`  product[${i}] ${p.slug}: name ${r.reason}`); }
  if (i < 3) pSamples.push({ slug: p.slug, name: p.name });
});
log(`products.json: ${products.length} total, ${pBad} with bad name. Sample names:`);
pSamples.forEach((s) => log(`   - ${s.slug}\n     en: ${s.name.en}\n     zh: ${s.name.zh}\n     ar: ${s.name.ar}`));
if (pBad > 0) failures++;

// Categories
const categories = loadJson(join(DATA_DIR, 'categories.json'));
let cBad = 0;
categories.forEach((c) => {
  const r = checkI18nObj(c.name, 'name');
  if (!r.ok) { cBad++; log(`  category ${c.slug}: name ${r.reason}`); }
});
const cSamples = categories.slice(0, 2).map((c) => ({ slug: c.slug, name: c.name }));
log(`categories.json: ${categories.length} total, ${cBad} with bad name. Sample:`);
cSamples.forEach((s) => log(`   - ${s.slug}: en="${s.name.en}" zh="${s.name.zh}" ar="${s.name.ar}"`));
if (cBad > 0) failures++;

// Blogs
const blogs = loadJson(join(DATA_DIR, 'blogs.json'));
let bBad = 0;
blogs.forEach((b) => {
  const r = checkI18nObj(b.title, 'title');
  if (!r.ok) { bBad++; log(`  blog ${b.slug}: title ${r.reason}`); }
});
const bSamples = blogs.slice(0, 2).map((b) => ({ slug: b.slug, title: b.title }));
log(`blogs.json: ${blogs.length} total, ${bBad} with bad title. Sample:`);
bSamples.forEach((s) => log(`   - ${s.slug}: en="${s.title.en}" zh="${s.title.zh}" ar="${s.title.ar}"`));
if (bBad > 0) failures++;

// toI18n behavior check (read from seed.mjs logic reproduced)
log('\n=== E. toI18n() behavior (reproduced from seed.mjs) ===');
function toI18n(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return { en: value, zh: value, ar: value };
  if (typeof value === 'object') {
    const o = value;
    const en = typeof o.en === 'string' && o.en ? o.en : typeof o.zh === 'string' ? o.zh : typeof o.ar === 'string' ? o.ar : '';
    return { en, zh: typeof o.zh === 'string' && o.zh ? o.zh : en, ar: typeof o.ar === 'string' && o.ar ? o.ar : en };
  }
  return undefined;
}
const tStr = toI18n('Hello');
const tObj = toI18n({ en: 'A', zh: '乙', ar: 'ج' });
const tPartial = toI18n({ en: 'Only EN' });
const tNull = toI18n(null);
log('  toI18n("Hello")        =>', JSON.stringify(tStr), tStr.en === 'Hello' && tStr.zh === 'Hello' && tStr.ar === 'Hello' ? 'OK' : 'FAIL');
log('  toI18n({en,zh,ar})      =>', JSON.stringify(tObj), (tObj.en === 'A' && tObj.zh === '乙' && tObj.ar === 'ج') ? 'OK' : 'FAIL');
log('  toI18n({en:"Only EN"})  =>', JSON.stringify(tPartial), (tPartial.zh === 'Only EN' && tPartial.ar === 'Only EN') ? 'OK (zh/ar fall back to en)' : 'FAIL');
log('  toI18n(null)            =>', JSON.stringify(tNull), tNull === undefined ? 'OK' : 'FAIL');
if (!(tStr.en === 'Hello' && tObj.en === 'A' && tPartial.zh === 'Only EN' && tNull === undefined)) failures++;

log(`\n=== SUMMARY: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'} ===`);
process.exit(failures === 0 ? 0 : 1);
