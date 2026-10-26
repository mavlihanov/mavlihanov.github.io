import { readFile, writeFile, mkdir, copyFile, readdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { renderPage } from '../src/template.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(project, 'data/catalog.json'), 'utf8'));
const seo = JSON.parse(await readFile(path.join(project, 'data/seo.json'), 'utf8'));
const origin = (process.env.SITE_URL || seo.origin).replace(/\/+$/, '');
const siteUrl = new URL(`${origin}/`);
if (siteUrl.protocol !== 'https:' || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) {
  throw new Error('SITE_URL must be a public HTTPS URL without credentials, query or fragment.');
}
const basePath = siteUrl.pathname.replace(/\/$/, '');
await mkdir(path.join(project, 'dist/assets'), { recursive: true });
const css = await readFile(path.join(project, 'src/styles.css'));
const js = await readFile(path.join(project, 'src/app.js'));
const cssName = `styles.${createHash('sha256').update(css).digest('hex').slice(0,12)}.css`;
const jsName = `app.${createHash('sha256').update(js).digest('hex').slice(0,12)}.js`;
for (const name of await readdir(path.join(project, 'dist'))) {
  if (/^(styles|app)\.[a-f0-9]{12}\.(css|js)$/.test(name) && ![cssName, jsName].includes(name)) {
    await unlink(path.join(project, 'dist', name));
  }
}
await writeFile(path.join(project, 'dist', cssName), css);
await writeFile(path.join(project, 'dist', jsName), js);
await writeFile(path.join(project, 'dist/index.html'), renderPage(data, origin, seo)
  .replace(`href="${basePath}/styles.css"`, `href="${basePath}/${cssName}"`)
  .replace(`src="${basePath}/app.js"`, `src="${basePath}/${jsName}"`));
await copyFile(path.join(project, 'src/styles.css'), path.join(project, 'dist/styles.css'));
await copyFile(path.join(project, 'src/app.js'), path.join(project, 'dist/app.js'));
await writeFile(path.join(project, 'dist/.nojekyll'), '');
await writeFile(path.join(project, 'dist/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(project, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
await writeFile(path.join(project, 'dist/_headers'), `/assets/*\n  Cache-Control: public, max-age=604800\n/${cssName}\n  Cache-Control: public, max-age=31536000, immutable\n/${jsName}\n  Cache-Control: public, max-age=31536000, immutable\n/styles.css\n  Cache-Control: public, max-age=3600\n/app.js\n  Cache-Control: public, max-age=3600\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`);
const services = data.categories.reduce((sum, category) => sum + category.services.length, 0);
console.log(`Built Studio Forme: ${data.categories.length} categories, ${services} service rows. Static HTML, no third-party runtime.`);
