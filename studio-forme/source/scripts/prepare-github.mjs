import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const project = fileURLToPath(new URL('../', import.meta.url));
const siteUrl = 'https://mavlihanov.github.io/studio-forme';
const output = path.join(project, 'github-publication');
const siteDirectory = path.join(output, 'studio-forme');
const sourceDirectory = path.join(siteDirectory, 'source');
const env = { ...process.env, SITE_URL: siteUrl };
for (const script of ['scripts/build.mjs', 'scripts/validate.mjs']) {
  const result = spawnSync(process.execPath, [script], { cwd: project, env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
await rm(output, { recursive: true, force: true });
await mkdir(sourceDirectory, { recursive: true });
await cp(path.join(project, 'dist'), siteDirectory, { recursive: true });
await rm(path.join(siteDirectory, '_headers'), { force: true });
for (const entry of ['src', 'scripts', 'data', 'package.json']) {
  await cp(path.join(project, entry), path.join(sourceDirectory, entry), { recursive: true });
}
await mkdir(path.join(sourceDirectory, 'dist'), { recursive: true });
await cp(path.join(project, 'dist/assets'), path.join(sourceDirectory, 'dist/assets'), { recursive: true });
for (const directory of [path.join(siteDirectory, 'assets'), path.join(sourceDirectory, 'dist/assets')]) {
  for (const name of await readdir(directory)) {
    if (name.endsWith('.woff')) await rm(path.join(directory, name));
  }
}
const seo = JSON.parse(await readFile(path.join(sourceDirectory, 'data/seo.json'), 'utf8'));
seo.origin = siteUrl;
await writeFile(path.join(sourceDirectory, 'data/seo.json'), JSON.stringify(seo, null, 2) + '\n');
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(siteDirectory, 'README.md'), `# Студия Форме\n\nСайт: ${siteUrl}/\n\nСтатический сайт салона: 9 категорий, 49 процедур, 55 вариантов продолжительности и цены. Запись: https://t.me/SYRA100.\n\nГотовые файлы сайта находятся в этой папке. Исходные компоненты, каталог, сборка и проверки — в папке source. Установка зависимостей не требуется.\n\n## Обновление\n\nВ папке source выполните npm run build и npm run check. После успешной проверки перенесите содержимое source/dist в родительскую папку studio-forme и отправьте изменения в main. GitHub Pages публикует статические файлы из корня main.\n\nФайл _headers относится к исходному хостингу и не применяется на GitHub Pages. Свои серверные обработчики, вход в ChatGPT, внешние шрифты и сторонние скрипты сайту не требуются.\n\nОбложка создана ImageGen как редакционный образ бренда; она не изображает помещение, сотрудника или результат процедуры. Лицензии шрифтов находятся в assets/FONT_LICENSES.txt.\n`);
const files = [];
async function collect(directory, prefix = '') {
  for (const item of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const name = prefix + item.name;
    if (item.isDirectory()) await collect(path.join(directory, item.name), name + '/');
    else files.push(name);
  }
}
await collect(output);
console.log(`Prepared ${files.length} files for ${siteUrl}/ in ${output}`);
