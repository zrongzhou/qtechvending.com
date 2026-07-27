/**
 * Browser rendering check for the FIXED sitemap XML.
 *
 * Why not the live URL? The production CDN still serves the OLD (broken) version
 * (verified via curl: it still contains xmlns:xhtml + <xhtml:link>). So we serve
 * the locally-generated FIXED xml (scripts/qa/sitemap-out.xml) over HTTP with the
 * exact production headers and let headless Chrome render it.
 *
 * A correct fix => Chrome shows the collapsible XML tree
 * ("This XML file does not appear to have any style information associated with it.
 *  The document tree is shown below.") and emits <xml-root>/<xml-element> tree nodes.
 * The OLD broken version (xhtml namespace) => Chrome shows plain text URLs only.
 */
import http from 'node:http';
import fs from 'node:fs';
import { chromium } from 'playwright';

const xmlPath = 'scripts/qa/sitemap-out.xml';
const xml = fs.readFileSync(xmlPath, 'utf8');

const server = http.createServer((_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/xml',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  });
  res.end(xml);
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/sitemap.xml`;
console.log('SERVING', url);

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.screenshot({ path: 'scripts/qa/sitemap-browser.png', fullPage: true });

  const bodyText = await page.evaluate(() => document.body.innerText || '');
  const hasTreeHeader =
    /does not appear to have any style information/i.test(bodyText) ||
    /document tree is shown below/i.test(bodyText);

  // The canonical signal: Chrome's XML-tree view prints the "document tree is
  // shown below" header. The OLD broken version (xhtml namespace) shows plain
  // text URLs and this header is ABSENT. This header is authoritative.
  // (Internal tree element names vary per Chrome build, so we don't rely on them.)
  const plainTextOnly =
    !hasTreeHeader && /https:\/\/www\.qtechvending\.com/.test(bodyText) && !/<urlset/.test(bodyText);

  console.log('TREE_HEADER_PRESENT=' + hasTreeHeader);
  console.log('BODY_TEXT_HEAD=' + JSON.stringify(bodyText.slice(0, 260)));

  if (hasTreeHeader && !plainTextOnly) {
    console.log('BROWSER_XML_TREE_OK');
  } else if (plainTextOnly) {
    console.log('BROWSER_PLAIN_TEXT_DETECTED');
  } else {
    console.log('BROWSER_RENDER_UNCLEAR');
  }
} finally {
  await browser.close();
  server.close();
}
