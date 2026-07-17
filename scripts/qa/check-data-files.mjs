// QA: Verify crawler data files exist and meet minimum counts.
//   products.json  >= 20
//   categories.json == 10
//   blogs.json     >= 1
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.resolve('scripts/data');
const files = {
  products: path.join(DATA, 'products.json'),
  categories: path.join(DATA, 'categories.json'),
  blogs: path.join(DATA, 'blogs.json'),
};

let ok = true;
const report = {};

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    console.error(`MISSING FILE: ${file}`);
    report[name] = { exists: false };
    ok = false;
    continue;
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const len = Array.isArray(json) ? json.length : (json.products?.length ?? json.categories?.length ?? json.posts?.length ?? json.blogs?.length ?? 0);
  report[name] = { exists: true, length: len };
}

const pLen = report.products?.length ?? 0;
const cLen = report.categories?.length ?? 0;
const bLen = report.blogs?.length ?? 0;

if (pLen < 20) { ok = false; console.log(`FAIL products: ${pLen} < 20`); }
else console.log(`OK   products: ${pLen} (>=20)`);

if (cLen !== 10) { ok = false; console.log(`FAIL categories: ${cLen} != 10`); }
else console.log(`OK   categories: ${cLen} (==10)`);

if (bLen < 1) { ok = false; console.log(`FAIL blogs: ${bLen} < 1`); }
else console.log(`OK   blogs: ${bLen} (>=1)`);

console.log('\n' + (ok ? 'RESULT: PASS — data files meet minimums' : 'RESULT: FAIL — data file counts below spec'));
process.exit(ok ? 0 : 1);
