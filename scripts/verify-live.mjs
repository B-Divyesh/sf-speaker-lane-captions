import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const origin = process.env.VERIFY_ORIGIN || 'https://speaker-lane-captions.sociobot.in';
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const root = await fetch(`${origin}/`, { cache: 'no-store' });
const rootText = await root.text();
check(root.status === 200, `root returned ${root.status}`);
check(rootText.includes('<title>Caption Lanes'), 'live root is not Caption Lanes');
check(rootText.includes('rel="canonical" href="https://speaker-lane-captions.sociobot.in/"'), 'live root is missing its canonical URL');
check(rootText.includes('property="og:image"') && rootText.includes('name="twitter:card"'), 'live root is missing social metadata');

const demo = await fetch(`${origin}/demo`, { cache: 'no-store' });
const demoText = await demo.text();
check(demo.status === 200, `demo returned ${demo.status}`);
check(demoText.includes('Try it with sample data'), 'demo route did not receive the app shell');

const missing = await fetch(`${origin}/does-not-exist-repair-5`, { cache: 'no-store' });
const missingText = await missing.text();
check(missing.status === 404, `unknown route returned ${missing.status}, expected 404`);
check(missingText.includes('Page not found.'), 'unknown route did not receive the designed 404 page');

const favicon = await fetch(`${origin}/favicon.ico`, { cache: 'no-store' });
check(favicon.status === 200, `favicon returned ${favicon.status}`);
check((favicon.headers.get('content-type') || '').startsWith('image/'), 'favicon is not served as an image');

for (let attempt = 1; attempt <= 10; attempt += 1) {
  const checkout = await fetch('https://api.sociobot.in/api/v1/products/speaker-lane-captions/checkout', { redirect: 'manual' });
  check(checkout.status === 303, `checkout attempt ${attempt} returned ${checkout.status}, expected 303`);
  check((checkout.headers.get('location') || '').startsWith('https://checkout.dodopayments.com/'), `checkout attempt ${attempt} did not redirect to hosted Dodo checkout`);
}

const csp = root.headers.get('content-security-policy') || '';
const permissions = root.headers.get('permissions-policy') || '';
check(csp.includes("default-src 'self'") && csp.includes("frame-ancestors 'none'"), 'live CSP is missing required restrictions');
check(permissions.includes('microphone=(self)') && permissions.includes('camera=()'), 'live Permissions-Policy is missing required restrictions');
check(root.headers.get('x-frame-options') === 'DENY', 'live X-Frame-Options is not DENY');

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }))).flat();
}

for (const path of await files('dist')) {
  if (path.endsWith('staticwebapp.config.json')) continue;
  const name = relative('dist', path).split('\\').join('/');
  const response = await fetch(`${origin}/${name}`, { cache: 'no-store' });
  check(response.status === 200, `${name} returned ${response.status}`);
  if (response.status === 200) {
    const localHash = createHash('sha256').update(await readFile(path)).digest('hex');
    const liveHash = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
    check(localHash === liveHash, `${name} does not match the deployed artifact`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log('Live checkout, favicon, response policy, and deployed artifact identity passed.');
