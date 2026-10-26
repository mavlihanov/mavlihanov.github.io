export const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

export const icons = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m20.7 4.1-3.2 15.2c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.2-8.3c.4-.3-.1-.6-.6-.3L5 12.9.2 11.4c-1-.3-1-1 .2-1.5L19.2 2.6c.9-.3 1.7.2 1.5 1.5Z" transform="translate(1 1) scale(.94)" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="1.4"/><path d="m15 15 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8.1 3.5 2 4.5-2.3 2a15 15 0 0 0 6.2 6.2l2-2.3 4.5 2v3.2c0 .8-.7 1.4-1.5 1.4C10.5 20 4 13.5 3.5 5c0-.8.6-1.5 1.4-1.5h3.2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 1c0 10-5 15-15 15 10 0 15 5 15 15 0-10 5-15 15-15C21 16 16 11 16 1Z" stroke="currentColor" stroke-width="1"/></svg>'
};

export const mark = `<svg viewBox="0 0 120 140" fill="none" aria-hidden="true" class="brand-mark"><path d="M39 42 4 78c7 26 22 42 52 52-23-23-31-53-17-88Z" fill="currentColor"/><path d="m81 42 35 36c-7 26-22 42-52 52 23-23 31-53 17-88Z" fill="currentColor"/><path d="M60 8c-7 0-10 5-9 11 0 5 2 8 5 10l-2 9-10 6-5 27 4 2 7-24 2 18-5 14c-4 12 0 23 8 33l4 13c0-25-4-33 3-44 8-12 11-19 5-29l1-8 8 24 4-2-7-26-10-5-2-8c5-3 7-8 6-13-1-5-3-8-7-8Z" fill="currentColor"/><path d="M68 74c-1 12-10 24-8 53 9-19 18-40 8-53Z" fill="#ce99d9"/></svg>`;

export function logo() {
  return `<a class="brand" href="#top" aria-label="Студия Форме — на главную">${mark}<span class="brand-text"><span>СТУДИЯ ФОРМЕ</span><small>САЛОН КРАСОТЫ</small></span></a>`;
}

export function booking(label = 'Записаться в Telegram', className = 'button button-primary', salon) {
  return `<a class="${className}" href="${salon.telegram}" target="_blank" rel="noopener noreferrer">${label}<span class="button-icon">${icons.arrow}</span><span class="sr-only"> — откроется в новой вкладке</span></a>`;
}

const formatMoney = price => new Intl.NumberFormat('ru-RU').format(price);

export function serviceRow(service, category) {
  const minutes = service.variants.map(v => v.minutes).filter(v => v !== null);
  const duration = minutes.length ? `${minutes.join(' / ')} мин` : 'Уточним';
  const price = service.variants.map(v => formatMoney(v.price)).join(' / ') + ' ₽';
  const variants = service.variants.length > 1 ? `<div class="service-variants">${service.variants.map(v => `<span><b>${v.minutes} мин</b><span>${formatMoney(v.price)} ₽</span></span>`).join('')}</div>` : '';
  const unknownTime = minutes.length === 0 ? '<p class="service-time-note">Продолжительность уточняется при записи.</p>' : '';
  return `<details class="service" data-accordion data-service="${service.id}" data-search="${escapeHtml(`${service.name} ${category.name} ${service.group || ''}`.toLocaleLowerCase('ru-RU'))}">
    <summary><span class="service-name">${escapeHtml(service.name)}</span><span class="service-duration" ${minutes.length ? '' : 'title="Продолжительность уточняется при записи"'}><span class="sr-only">Время: </span>${duration}</span><span class="service-price"><span class="sr-only">Стоимость: </span>${price}</span><span class="service-chevron">${icons.down}</span></summary>
    <div class="service-content"><div class="service-content-inner"><p>${escapeHtml(service.description)}</p>${variants}${unknownTime}</div></div>
  </details>`;
}

export function catalog(categories) {
  const nav = categories.map((c, index) => `<a href="#category-${c.id}" class="category-link" data-category="${c.id}"><span class="category-number">${String(index+1).padStart(2,'0')}</span><span>${escapeHtml(c.name)}</span><span class="category-indicator">↗</span></a>`).join('');
  const options = categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  const panels = categories.map((c, index) => {
    const groups = [...new Set(c.services.map(s => s.group || ''))];
    return `<section class="category-panel" id="category-${c.id}" data-panel="${c.id}" aria-labelledby="heading-${c.id}">
      <div class="panel-heading"><div><span class="eyebrow">НАПРАВЛЕНИЕ ${String(index+1).padStart(2,'0')}</span><h3 id="heading-${c.id}">${escapeHtml(c.name)}</h3></div><span class="panel-count" aria-label="${c.services.length} позиций">${String(c.services.length).padStart(2,'0')}</span></div>
      <p class="panel-intro">${escapeHtml(c.intro)}</p>
      <div class="catalog-columns" aria-hidden="true"><span>ПРОЦЕДУРА</span><span>ВРЕМЯ</span><span>СТОИМОСТЬ</span><span></span></div>
      ${groups.map(group => `<div class="service-group">${group ? `<h4 class="service-group-heading">${escapeHtml(group)}</h4>` : ''}${c.services.filter(s => (s.group || '') === group).map(s => serviceRow(s,c)).join('')}</div>`).join('')}
    </section>`;
  }).join('');
  return `<div class="catalog-layout"><aside class="catalog-sidebar"><nav class="category-nav" aria-label="Направления услуг">${nav}</nav><p class="sidebar-note">Ваше время.<br>Ваш выбор.<br><em>Ваша Форме.</em></p></aside><div class="catalog-main"><div class="mobile-category"><label for="category-select">Направление</label><div class="select-wrap"><select id="category-select">${options}</select>${icons.down}</div></div><p class="search-status sr-only" id="search-status" role="status" aria-live="polite" aria-atomic="true"></p><div id="catalog-panels">${panels}</div><div class="search-empty" id="search-empty" hidden>${icons.star}<h3>Давайте попробуем иначе</h3><p>По этому запросу ничего не нашлось.<br>Попробуйте название процедуры или зоны.</p><button type="button" class="text-link" data-reset-search>Сбросить поиск <span>↗</span></button></div><p class="catalog-note">Если время не указано в прайсе, уточним его при записи. При двух вариантах цена соответствует выбранной продолжительности.</p></div></div>`;
}

export function faqRow(question, answer) {
  return `<details class="faq-item" data-accordion><summary><span>${escapeHtml(question)}</span><span class="service-chevron">${icons.down}</span></summary><div class="faq-answer"><p>${escapeHtml(answer)}</p></div></details>`;
}

export const lineArt = {
  face: `<svg viewBox="0 0 260 260" fill="none" aria-hidden="true"><path d="M164 236c-19-16-36-27-36-47 0-13 3-20 3-20-28-4-40-18-41-43l-15-2c-5 0-6-4-2-9l17-24c0-38 21-62 58-62 46 0 71 38 63 79-5 28-30 39-34 66-3 20 5 36 21 53" stroke="currentColor" stroke-width="1.15"/><path d="M91 91c11-6 19-6 26-2m-23 17c7 4 12 4 19-1m-24 38c7 4 15 4 22-1m19 27c22-6 34-16 42-30" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/><ellipse cx="140" cy="130" rx="105" ry="107" stroke="currentColor" opacity=".2" transform="rotate(-24 140 130)"/></svg>`,
  body: `<svg viewBox="0 0 260 260" fill="none" aria-hidden="true"><path d="M125 22c-10 35-29 40-29 68 0 24 14 31 12 51-2 22-27 36-27 64 0 16 8 27 19 37m57-221c7 26 10 42 5 61-4 18-12 31-10 48 3 22 22 43 23 68 0 18-4 32-10 45" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M109 142c11 8 27 12 43 6m-21-51c-5 5-5 11-2 15m-22 75c11 12 20 29 19 51" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="130" cy="131" rx="87" ry="114" stroke="currentColor" opacity=".2" transform="rotate(28 130 131)"/></svg>`,
  details: `<svg viewBox="0 0 260 260" fill="none" aria-hidden="true"><path d="M67 117c20-27 51-39 92-29 17 4 29 14 41 26-27 19-53 26-79 19-23-6-39-12-54-16Z" stroke="currentColor" stroke-width="1.2"/><path d="M82 94c24-19 63-24 95-10m-91 33 4 13m13-7 2 15m14-11v15m16-13-2 14m16-15-4 13m18-18-6 13m17-20-6 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M139 95c-9 0-17 8-17 17s8 17 17 17 17-8 17-17-8-17-17-17Z" stroke="currentColor" stroke-width="1.2"/><path d="m95 174 33-21 34 21-34 44-33-44Zm0 0h67m-34-21-12 21 12 44 13-44-13-21Z" stroke="currentColor" stroke-width="1.1"/><circle cx="133" cy="127" r="102" stroke="currentColor" opacity=".2"/></svg>`
};
