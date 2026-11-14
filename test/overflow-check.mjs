import { chromium } from 'playwright';

const sizes = [
  [320, 568],
  [360, 800],
  [390, 667],
  [390, 844],
  [430, 932],
  [1280, 800],
];

const browser = await chromium.launch();
let failed = false;
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-date="2027-01-02"]');
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  const jan = await page.$('[data-date="2027-01-09"]');
  console.log(w + 'x' + h, 'overflow', overflow, 'jan09', !!jan);
  if (overflow > 0) failed = true;
  await page.close();
}
await browser.close();
if (failed) process.exit(1);
console.log('overflow-check: ok');