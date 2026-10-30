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
assert.equal(data.categories.length, 12);
assert.equal(new Set(data.categories.map(category => category.id)).size, 12);
const services = data.categories.flatMap(category => category.services);
assert.equal(services.length, 69);
assert.equal(services.flatMap(service => service.variants).length, 81);
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
    assert.ok(variant.priceFrom === undefined || typeof variant.priceFrom === 'boolean');
    assert.ok(variant.label === undefined || typeof variant.label === 'string' && variant.label.trim());
  }
  if (service.variants.some(variant => variant.label)) {
    assert.ok(service.variants.every(variant => variant.label && variant.minutes === null));
  }
}
const expectedNewPrices = {
  'hair-cut': [[1000, 'Короткие волосы', false], [1500, 'Средние волосы', false], [1800, 'Длинные волосы', true]],
  'hair-single-color': [[3500, 'Короткие волосы', false], [4500, 'Средние волосы', false], [5500, 'Длинные волосы', true]],
  'hair-highlights': [[4500, 'Короткие волосы', false], [6000, 'Средние волосы', false], [6500, 'Длинные волосы', true]],
  'hair-complex-color': [[12000, '', true]], 'hair-blow-dry': [[2000, '', true]],
  'hair-hairstyle': [[4500, '', true]], 'hair-perm': [[4000, '', true]], 'hair-care': [[3000, '', true]],
  'nails-combined': [[800, '', false]], 'nails-level-color': [[2500, '', false]],
  'nails-gel-strength': [[2700, '', false]], 'nails-gel': [[1000, '', false]],
  'nails-gel-polish': [[1000, '', false]], 'nails-french': [[500, '', false]],
  'nails-design': [[100, '', true]], 'nails-repair': [[150, '', false]],
  'nails-spa-hands': [[500, '', false]], 'pedicure-no-coat': [[2000, '', false]],
  'pedicure-color': [[2800, '', false]], 'nails-spa-feet': [[800, '', false]]
};
for (const [id, expected] of Object.entries(expectedNewPrices)) {
  const service = services.find(service => service.id === id);
  assert.ok(service, `Missing new service: ${id}`);
  assert.ok(service.variants.every(variant => variant.minutes === null), `Invented duration: ${id}`);
  assert.deepEqual(service.variants.map(variant => [variant.price, variant.label || '', Boolean(variant.priceFrom)]), expected, `Price-list mismatch: ${id}`);
}
assert.equal((html.match(/data-service=/g) || []).length, 69);
assert.equal((html.match(/data-category=/g) || []).length, 12);
assert.doesNotMatch(html, /null мин|undefined мин/);
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
assert.equal(structuredData.hasOfferCatalog.itemListElement.length, 12);
const offers = structuredData.hasOfferCatalog.itemListElement.flatMap(category => category.itemListElement);
assert.equal(offers.length, 81);
for (const service of services) for (const variant of service.variants) {
  const name = service.name + (variant.label ? ` — ${variant.label}` : variant.minutes ? ` — ${variant.minutes} мин` : '');
  const offer = offers.find(offer => offer.name === name && offer.itemOffered.description === service.description);
  assert.ok(offer, `Missing structured offer: ${name}`);
  if (variant.priceFrom) {
    assert.equal(offer.price, undefined);
    assert.equal(offer.priceSpecification.minPrice, variant.price);
    assert.equal(offer.priceSpecification.priceCurrency, 'RUB');
  } else assert.equal(offer.price, variant.price);
}
assert.equal(structuredData.priceRange, 'от 100 ₽');
assert.equal(structuredData.telephone, '+79800996402');
assert.equal(structuredData.url, origin);
assert.equal(structuredData.image, `${origin}/assets/hero-1536.webp`);
console.log(`Validated ${services.length} services, prices, durations, anchors, assets, SEO data and direct booking links.`);
