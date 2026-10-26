import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(project, 'data/catalog.json'), 'utf8'));
const seo = JSON.parse(await readFile(path.join(project, 'data/seo.json'), 'utf8'));
const origin = (process.env.SITE_URL || seo.origin).replace(/\/+$/, '');
const basePath = new URL(`${origin}/`).pathname.replace(/\/$/, '');
const html = await readFile(path.join(project, 'dist/index.html'), 'utf8');
const css = await readFile(path.join(project, 'dist/styles.css'), 'utf8');
assert.equal(data.salon.telegram, 'https://t.me/SYRA100');
assert.equal(data.salon.phoneHref, '+79800996402');
assert.equal(data.salon.address, 'Боброво, ул. Лесная, 2');
assert.equal(data.categories.length, 9);
const services = data.categories.flatMap(category => category.services);
assert.equal(services.length, 49);
assert.equal(new Set(services.map(service => service.id)).size, services.length);
assert.equal(services.find(service => service.id === 'laser-full-body').variants[0].price, 5999);
assert.equal(services.find(service => service.id === 'laser-face').variants[0].price, 1500);
assert.equal(services.find(service => service.id === 'navel').variants[0].price, 3000);
assert.equal(services.find(service => service.id === 'brows-lashes').variants[0].price, 3500);
assert.equal(services.find(service => service.id === 'lashes').variants[0].price, 2500);
assert.equal(services.find(service => service.id === 'spider').variants[0].price, 2000);
assert.equal(services.find(service => service.id === 'spider').variants[0].minutes, 30);
assert.equal(services.find(service => service.id === 'g8').variants[1].minutes, 50);
assert.equal(services.find(service => service.id === 'indiba-zone').variants[1].price, 4900);
assert.equal(services.find(service => service.id === 'endospheres-body').variants[1].price, 2900);
assert.equal(services.find(service => service.id === 'five-procedures').variants[0].minutes, 60);
for (const service of services) {
  assert.ok(service.name && service.description);
  for (const variant of service.variants) {
    assert.ok(Number.isInteger(variant.price) && variant.price > 0);
    assert.ok(variant.minutes === null || Number.isInteger(variant.minutes) && variant.minutes > 0);
  }
}
assert.doesNotMatch(services.map(s => s.name).join('\n'), /маникюр|педикюр/i);
assert.equal((html.match(/data-service=/g) || []).length, 49);
assert.doesNotMatch(html, /href="#"|lorem|placeholder\.com|coming soon/i);
assert.doesNotMatch(html.match(/<details class="service"[\s\S]*?<\/details>/g).join(''), /href="https:\/\/t\.me\//);
assert.match(css, /prefers-reduced-motion/);
assert.match(html, /<html lang="ru">/);
assert.ok(html.includes(`<title>${seo.title}</title>`));
assert.ok(html.includes(`<link rel="canonical" href="${origin}/">`));
assert.doesNotMatch(html, /<meta[^>]+(?:name="robots"[^>]+content="[^"]*noindex|name="(?:google-site-verification|yandex-verification)"[^>]+content="(?:null|undefined|)")/i);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML id');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Missing anchor: ${match[1]}`);
const assets = new Set([...html.matchAll(/\b(?:src|href)="(\/[^"?]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/\b(?:srcset|imagesrcset)="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) assets.add(candidate.trim().split(/\s+/)[0]);
}
for (const asset of assets) {
  assert.ok(asset.startsWith(`${basePath}/`), `Asset escapes deployment directory: ${asset}`);
  assert.ok((await stat(path.join(project, 'dist', asset.slice(basePath.length + 1)))).isFile(), `Missing ${asset}`);
}
for (const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
  const asset = new URL(match[1], `${origin}/styles.css`).pathname;
  assert.ok(asset.startsWith(`${basePath}/`), `CSS asset escapes deployment directory: ${asset}`);
  assert.ok((await stat(path.join(project, 'dist', asset.slice(basePath.length + 1)))).isFile(), `Missing CSS asset ${asset}`);
}
assert.ok((await readFile(path.join(project, 'dist/sitemap.xml'), 'utf8')).includes(`<loc>${origin}/</loc>`));
const structuredData = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(structuredData.hasOfferCatalog.itemListElement.length, 9);
assert.equal(structuredData.telephone, '+79800996402');
assert.equal(structuredData.url, origin);
assert.equal(structuredData.image, `${origin}/assets/hero-1536.webp`);
console.log(`Validated ${services.length} services, prices, durations, anchors, assets, SEO data and direct booking links.`);
