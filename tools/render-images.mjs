// Renders the placeholder 3D images into /images.
// Usage: node tools/render-images.mjs   (needs Playwright + Chromium)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer(async (req, res) => {
  try {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const shots = ['excavator', 'loader', 'truck', 'materials', 'earthworks', 'glass', 'planet'];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('console', (m) => m.type() === 'error' && console.error(m.text()));
for (const s of shots) {
  await page.goto(`http://localhost:${port}/tools/shots.html?shot=${s}`);
  await page.waitForSelector('body[data-done="1"]', { timeout: 60000 });
  const buf = await page.locator('canvas').screenshot({ type: 'jpeg', quality: 82 });
  writeFileSync(path.join(root, 'images', `${s}.jpg`), buf);
  console.log('rendered', s, buf.length);
}
await browser.close();
server.close();
