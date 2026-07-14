import http from 'node:http';

function get(u) {
  return new Promise((r) => {
    const q = http.get(u, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => r({ s: res.statusCode, b }));
    });
    q.on('error', (e) => r({ s: 0, b: String(e) }));
    q.setTimeout(15000, () => { q.destroy(); r({ s: 0, b: 'TIMEOUT' }); });
  });
}

const BASE = 'http://127.0.0.1:3000';

(async () => {
  const c = await get(`${BASE}/en/contact`);
  const low = c.b.toLowerCase();
  const fields = ['name', 'email', 'phone', 'company', 'country', 'product', 'subject', 'message'];
  const missing = fields.filter((f) => !low.includes(f));
  console.log('CONTACT /en/contact status:', c.s);
  console.log('  contact 8 fields present:', missing.length === 0 ? 'YES (all 8)' : 'MISSING ' + JSON.stringify(missing));
  console.log('  required-star present:', /text-red-500[^>]*>\*/i.test(c.b) ? 'YES' : 'n/a');

  for (const api of ['/api/products', '/api/blogs', '/api/categories']) {
    const a = await get(`${BASE}${api}`);
    let j = null;
    try { j = JSON.parse(a.b); } catch { /* ignore */ }
    console.log(api, 'status:', a.s, '->', a.s === 200 ? JSON.stringify(j) : '(non-json)');
  }
})();
