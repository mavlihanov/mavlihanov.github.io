export const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

export const icons = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m20.7 4.1-3.2 15.2c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.2-8.3c.4-.3-.1-.6-.6-.3L5 12.9.2 11.4c-1-.3-1-1 .2-1.5L19.2 2.6c.9-.3 1.7.2 1.5 1.5Z" transform="translate(1 1) scale(.94)" fill="currentColor"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>',
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
const formatVariantPrice = variant => `${variant.priceFrom ? 'от ' : ''}${formatMoney(variant.price)}`;
const positionCount = count => `${count} ${{one:'позиция',few:'позиции',many:'позиций',other:'позиции'}[new Intl.PluralRules('ru-RU').select(count)]}`;

export function serviceRow(service) {
  const minutes = service.variants.map(v => v.minutes).filter(v => v !== null);
  const duration = minutes.length ? `${minutes.join(' / ')} мин` : 'Уточним';
  const namedOptions = service.variants.some(variant => variant.label);
  const price = (namedOptions ? `от ${formatMoney(Math.min(...service.variants.map(variant => variant.price)))}` : service.variants.map(formatVariantPrice).join(' / ')) + ' ₽';
  const variants = namedOptions
    ? `<dl class="service-options">${service.variants.map(variant => `<div><dt>${escapeHtml(variant.label)}</dt><dd>${formatVariantPrice(variant)} ₽</dd></div>`).join('')}</dl>`
    : service.variants.length > 1 ? `<div class="service-variants">${service.variants.map(v => `<span><b>${v.minutes} мин</b><span>${formatVariantPrice(v)} ₽</span></span>`).join('')}</div>` : '';
  const unknownTime = minutes.length === 0 ? '<p class="service-time-note">Продолжительность уточняется при записи.</p>' : '';
  return `<details class="service" data-accordion data-service="${service.id}">
    <summary><span class="service-name">${escapeHtml(service.name)}</span><span class="service-duration" ${minutes.length ? '' : 'title="Продолжительность уточняется при записи"'}><span class="sr-only">Время: </span>${duration}</span><span class="service-price"><span class="sr-only">Стоимость: </span>${price}</span><span class="service-chevron">${icons.down}</span></summary>
    <div class="service-content"><div class="service-content-inner"><p>${escapeHtml(service.description)}</p>${variants}${unknownTime}</div></div>
  </details>`;
}

export function catalog(categories, basePath = '') {
  const nav = categories.map((c, index) => `<a href="#category-${c.id}" class="category-link" data-category="${c.id}" aria-controls="category-${c.id}"><span class="category-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="category-name">${escapeHtml(c.name)}</span><span class="category-indicator" aria-hidden="true">${icons.down}</span></a>`).join('');
  const panels = categories.map((c, index) => {
    const groups = [...new Set(c.services.map(s => s.group || ''))];
    return `<section class="category-panel" id="category-${c.id}" data-panel="${c.id}" aria-labelledby="heading-${c.id}">
      <div class="panel-heading"><div><span class="eyebrow">НАПРАВЛЕНИЕ ${String(index+1).padStart(2,'0')}</span><h3 id="heading-${c.id}" tabindex="-1">${escapeHtml(c.name)}</h3></div><span class="panel-count" aria-label="${positionCount(c.services.length)}">${String(c.services.length).padStart(2,'0')}</span></div>
      <div class="panel-intro-row"><p class="panel-intro">${escapeHtml(c.intro)}</p>${c.priceList ? `<a class="price-sheet-link" href="${basePath}/${escapeHtml(c.priceList)}" target="_blank" rel="noopener noreferrer">Прайс мастера ${icons.arrow}<span class="sr-only"> — откроется в новой вкладке</span></a>` : ''}</div>
      <div class="catalog-columns" aria-hidden="true"><span>ПРОЦЕДУРА</span><span>ВРЕМЯ</span><span>СТОИМОСТЬ</span><span></span></div>
      ${groups.map(group => `<div class="service-group">${group ? `<h4 class="service-group-heading">${escapeHtml(group)}</h4>` : ''}${c.services.filter(s => (s.group || '') === group).map(s => serviceRow(s)).join('')}</div>`).join('')}
    </section>`;
  }).join('');
  return `<div class="catalog-layout"><nav class="category-nav" id="category-picker" aria-label="Категории услуг">${nav}</nav><div class="catalog-main" id="selected-services"><div class="catalog-toolbar"><span data-current-category>${escapeHtml(categories[0].name)}</span><a href="#category-picker" data-catalog-back>${icons.grid} Все категории <span aria-hidden="true">↑</span></a></div><p class="sr-only" id="category-status" role="status" aria-live="polite" aria-atomic="true"></p><div id="catalog-panels">${panels}</div><p class="catalog-note">Продолжительность и цены с пометкой «от» уточним при записи. В раскрывающейся строке указаны описание и варианты стоимости — по длине волос или времени процедуры.</p></div></div>`;
}

export function faqRow(question, answer) {
  return `<details class="faq-item" data-accordion><summary><span>${escapeHtml(question)}</span><span class="service-chevron">${icons.down}</span></summary><div class="faq-answer"><p>${escapeHtml(answer)}</p></div></details>`;
}
