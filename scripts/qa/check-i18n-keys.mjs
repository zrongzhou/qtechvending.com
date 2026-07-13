// QA: Verify that src/messages/{en,zh,ar}.json have identical flattened key sets.
// A missing key in zh/ar would cause a raw (untranslated) key to show in the UI.
import fs from 'node:fs';
import path from 'node:path';

const MSG_DIR = path.resolve('src/messages');
const LANGS = ['en', 'zh', 'ar'];

function flatten(obj, prefix = '', out = new Set()) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    out.add(prefix);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      out.add(key);
    }
  }
  return out;
}

const sets = {};
for (const l of LANGS) {
  const file = path.join(MSG_DIR, `${l}.json`);
  if (!fs.existsSync(file)) {
    console.error(`MISSING FILE: ${file}`);
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  sets[l] = flatten(json);
}

const en = sets.en;
let ok = true;

console.log(`en flat keys: ${en.size}`);
for (const l of ['zh', 'ar']) {
  const missing = [...en].filter((k) => !sets[l].has(k));
  const extra = [...sets[l]].filter((k) => !en.has(k));
  console.log(`\n[${l}] flat keys: ${sets[l].size}`);
  if (missing.length) {
    ok = false;
    console.log(`  MISSING (in en, absent in ${l}): ${missing.length}`);
    console.log('   ' + missing.slice(0, 30).join('\n   '));
  }
  if (extra.length) {
    ok = false;
    console.log(`  EXTRA (in ${l}, absent in en): ${extra.length}`);
    console.log('   ' + extra.slice(0, 30).join('\n   '));
  }
  if (!missing.length && !extra.length) {
    console.log('  OK: key set identical to en');
  }
}

console.log('\n' + (ok ? 'RESULT: PASS — all three i18n key sets are identical' : 'RESULT: FAIL — key sets differ'));
process.exit(ok ? 0 : 1);
