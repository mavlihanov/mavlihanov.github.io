import { booking, catalog, faqRow, icons, logo, mark, escapeHtml as e } from './components.mjs';

export function renderPage(data, origin, seo = {}) {
 const {salon, categories} = data;
 const basePath = new URL(`${origin}/`).pathname.replace(/\/$/, '');
 const title = seo.title || 'Студия Форме — салон красоты в Боброво';
 const description = seo.description || 'Парикмахер, маникюр, педикюр, массаж, уход за лицом и телом, лазерная эпиляция, брови, ресницы и пирсинг. Боброво, ул. Лесная, 2. Запись в Telegram.';
 const verification = [
   seo.googleSiteVerification ? `<meta name="google-site-verification" content="${e(seo.googleSiteVerification)}">` : '',
   seo.yandexVerification ? `<meta name="yandex-verification" content="${e(seo.yandexVerification)}">` : ''
 ].filter(Boolean).join('\n');
 const prices = categories.flatMap(category => category.services.flatMap(service => service.variants.map(variant => variant.price)));
 const money = value => new Intl.NumberFormat('ru-RU').format(value);
 const hasStartingPrices = categories.some(category => category.services.some(service => service.variants.some(variant => variant.priceFrom)));
 const createOffer = (service, variant) => ({
   '@type':'Offer',
   name:service.name + (variant.label ? ` — ${variant.label}` : variant.minutes ? ` — ${variant.minutes} мин` : ''),
   ...(variant.priceFrom ? {priceSpecification:{'@type':'PriceSpecification',minPrice:variant.price,priceCurrency:'RUB'}} : {price:variant.price}),
   priceCurrency:'RUB',
   itemOffered:{'@type':'Service',name:service.name,description:service.description}
 });
 const jsonld = {
  '@context':'https://schema.org', '@type':'BeautySalon', '@id':`${origin}/#salon`, name:salon.name,
  url:origin, telephone:salon.phoneHref, image:`${origin}/assets/hero-1536.webp`,
  priceRange:hasStartingPrices ? `от ${money(Math.min(...prices))} ₽` : `${money(Math.min(...prices))}–${money(Math.max(...prices))} ₽`,
  address:{'@type':'PostalAddress',streetAddress:'ул. Лесная, 2',addressLocality:'Боброво',addressCountry:'RU'},
  sameAs:[salon.telegram], hasOfferCatalog:{'@type':'OfferCatalog',name:'Услуги Студии Форме',itemListElement:categories.map(category => ({'@type':'OfferCatalog',name:category.name,itemListElement:category.services.flatMap(service=>service.variants.map(variant=>createOffer(service,variant)))}))}
 };
 return `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#100c11"><meta name="color-scheme" content="dark">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}"><link rel="canonical" href="${origin}/">
${verification}
<meta property="og:site_name" content="${e(salon.name)}">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:title" content="Студия Форме — красота в гармонии с вами"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${origin}/"><meta property="og:image" content="${origin}/assets/hero-1536.webp"><meta property="og:image:width" content="1536"><meta property="og:image:height" content="1024"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${basePath}/assets/forme-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${basePath}/assets/forme-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="${basePath}/assets/hero-1536.webp" imagesrcset="${basePath}/assets/hero-768.webp 768w, ${basePath}/assets/hero-1200.webp 1200w, ${basePath}/assets/hero-1536.webp 1536w" imagesizes="100vw">
<link rel="stylesheet" href="${basePath}/styles.css"><script src="${basePath}/app.js" type="module"></script>
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g,'\\u003c')}</script>
</head><body>
<a class="skip-link" href="#main">Перейти к содержимому</a>
<header class="site-header" id="site-header"><div class="header-inner">${logo()}
<nav class="desktop-nav" aria-label="Главная навигация"><a href="#services">Услуги и цены</a><a href="#about">О студии</a><a href="#visit">Ваш визит</a><a href="#contacts">Контакты</a></nav>
<div class="header-actions"><a class="header-catalog" href="#services">Услуги ${icons.down}</a>${booking('Записаться','button button-small button-outline',salon)}<button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div>
</div><nav id="mobile-nav" class="mobile-nav" aria-label="Мобильная навигация" hidden><a href="#services">Услуги и цены <span>01</span></a><a href="#about">О студии <span>02</span></a><a href="#visit">Ваш визит <span>03</span></a><a href="#contacts">Контакты <span>04</span></a><a href="tel:${salon.phoneHref}" class="mobile-nav-phone">${salon.phone}</a></nav></header>
<main id="main">
<section class="hero" id="top" aria-labelledby="hero-title">
<picture class="hero-picture"><img src="${basePath}/assets/hero-1536.webp" srcset="${basePath}/assets/hero-768.webp 768w, ${basePath}/assets/hero-1200.webp 1200w, ${basePath}/assets/hero-1536.webp 1536w" sizes="100vw" alt="" width="1536" height="1024" fetchpriority="high" decoding="async"></picture><div class="hero-shade"></div>
<div class="hero-inner container"><div class="hero-copy"><p class="eyebrow hero-eyebrow"><span class="tiny-spark">✧</span> САЛОН КРАСОТЫ В БОБРОВО</p><h1 id="hero-title">Красота<br>в гармонии<br><em>с вами.</em></h1><p class="hero-description">Волосы. Ногти. Лицо и тело.<span class="hero-description-extra">Пространство, где всё внимание — вам.</span></p><div class="hero-actions"><a class="button button-primary hero-catalog-link" href="#services">Услуги и цены ${icons.down}</a>${booking('Записаться в Telegram','button button-outline',salon)}</div></div>
</div>
</section>
<section class="services section container" id="services" aria-labelledby="services-title"><div class="section-label" data-reveal><span class="eyebrow">01 / УСЛУГИ И ЦЕНЫ</span><span class="section-line"></span></div><div class="catalog-title-row"><h2 id="services-title">Услуги <em>и цены.</em></h2><p class="catalog-description">Выберите категорию — откроется список услуг.</p></div>
${catalog(categories, basePath)}
<div class="catalog-cta" data-reveal><div><span class="eyebrow">МЫ РЯДОМ</span><h3>Поможем выбрать <em>ваш уход.</em></h3><p>Расскажите о своих пожеланиях в Telegram.</p></div>${booking('Написать в Telegram','button button-primary',salon)}</div></section>
<div class="brand-ribbon" aria-hidden="true"><span>БЕРЕЖНО К СЕБЕ</span>${icons.star}<span>ВНИМАНИЕ К ДЕТАЛЯМ</span>${icons.star}<span>В ГАРМОНИИ С ВАМИ</span></div>
<section class="about section container" id="about" aria-labelledby="about-title"><div class="section-label" data-reveal><span class="eyebrow">02 / ФИЛОСОФИЯ ФОРМЕ</span><span class="section-line"></span></div><div class="about-layout"><div data-reveal><h2 id="about-title">В основе красоты —<br><em>ваше ощущение<br>себя.</em></h2><p class="about-caption">СТУДИЯ ФОРМЕ <span>·</span> БОБРОВО</p></div><div class="about-copy" data-reveal><p class="lead">Побыть наедине с собой.<br>Выдохнуть. Почувствовать заботу.</p><p>В «Форме» можно выбрать свой ритм: обновить стрижку и цвет, сделать маникюр или педикюр, выбрать уход за лицом или массаж. Все направления собраны в одном пространстве.</p><p>Начните с того, что важно вам сейчас. А мы поможем разобраться в процедурах и выбрать удобное время.</p><a class="text-link" href="#services">Найти свой ритуал ${icons.arrow}</a></div></div></section>
<section class="visit section" id="visit" aria-labelledby="visit-title"><div class="container"><div class="section-label" data-reveal><span class="eyebrow">03 / ВАШ ВИЗИТ</span><span class="section-line"></span></div><div class="visit-title" data-reveal><h2 id="visit-title">Чуть ближе<br><em>к себе.</em></h2><p>Всего одно сообщение.<br>Остальное обсудим лично.</p></div><div class="visit-steps"><article data-reveal><span class="step-number">01</span><h3>Напишите нам</h3><p>Откроется личный Telegram салона. Расскажите, какая процедура вас интересует, или попросите помочь с выбором.</p></article><article data-reveal><span class="step-number">02</span><h3>Выберите время</h3><p>В переписке согласуем день и время, уточним длительность и ответим на вопросы о подготовке.</p></article><article data-reveal><span class="step-number">03</span><h3>Приходите в Форме</h3><p>Ждём вас по адресу: Боброво, улица Лесная, 2. Оставьте суету за дверью — это ваше время.</p></article></div></div></section>
<section class="faq section container" aria-labelledby="faq-title"><div class="faq-intro" data-reveal><span class="eyebrow">ДЕТАЛИ ПЕРЕД ВСТРЕЧЕЙ</span><h2 id="faq-title">Возможно,<br><em>вы хотели спросить.</em></h2><p>Остались вопросы?<br>Обсудим их лично в Telegram.</p><a class="text-link" href="${salon.telegram}" target="_blank" rel="noopener noreferrer">Задать вопрос ${icons.arrow}</a></div><div class="faq-list" data-reveal>
${faqRow('Как записаться на процедуру?','Нажмите общую кнопку записи — откроется личный Telegram салона @SYRA100. Напишите, какая процедура вас интересует, и мы согласуем время в переписке. Если Telegram неудобен, позвоните: +7 (980) 099-64-02.')}
${faqRow('Что выбрать для первого посещения?','Расскажите в Telegram, какого ухода вам хочется и сколько времени вы готовы выделить. Поможем разобраться в направлениях и обсудим подходящий формат до записи.')}
${faqRow('Как узнать продолжительность процедуры?','Время указано в строке услуги, если оно есть в прайсе. Пометка «Уточним» означает, что длительность нужно согласовать при записи. Если показаны два времени и две цены, они соответствуют друг другу по порядку.')}
${faqRow('Почему у некоторых услуг указана цена «от»?','У стрижки, окрашивания в один тон и мелирования предусмотрены варианты по длине волос — они показаны в раскрывающейся строке. Пометка «от» означает начальную стоимость. Итоговую цену выбранной услуги уточните у мастера при записи.')}
${faqRow('Нужно ли готовиться к посещению?','Это зависит от выбранной процедуры. При записи уточните рекомендации у специалиста и сообщите об особенностях, которые важно учесть. Мы ответим на вопросы перед визитом.')}
</div></section>
<section class="contacts section" id="contacts" aria-labelledby="contacts-title"><div class="contact-glow" aria-hidden="true"></div><div class="container contact-layout"><div class="contact-copy" data-reveal><span class="eyebrow">04 / ДО ВСТРЕЧИ В СТУДИИ</span><h2 id="contacts-title">Ваше место<br><em>для себя.</em></h2><div class="contact-details"><div class="contact-address">${icons.pin}<div><span class="eyebrow">НАШ АДРЕС</span><address>${salon.address}</address><a class="text-link contact-route" href="https://yandex.ru/maps/?text=${encodeURIComponent(salon.address)}" target="_blank" rel="noopener noreferrer">Построить маршрут ${icons.arrow}</a></div></div><div class="contact-phone">${icons.phone}<div><span class="eyebrow">МЫ НА СВЯЗИ</span><a href="tel:${salon.phoneHref}">${salon.phone}</a></div></div></div>${booking('Записаться в Telegram','button button-primary',salon)}<p class="contact-note">Напишите нам — подберём удобное время.</p></div><div class="contact-art" aria-hidden="true"><span class="contact-art-ring ring-one"></span><span class="contact-art-ring ring-two"></span>${mark}<span class="contact-art-word">forme</span><span class="contact-art-caption">В ГАРМОНИИ С ВАМИ</span></div></div></section>
</main><footer class="site-footer"><div class="container footer-main">${logo()}<p>Красота в гармонии с вами.</p><a href="#top" class="back-to-top">Наверх ${icons.arrow}</a></div><div class="container footer-bottom"><span>© 2026 Студия Форме</span><span>Боброво · Лесная, 2</span><a href="${salon.telegram}" target="_blank" rel="noopener noreferrer">Telegram @SYRA100 ↗</a></div></footer>
<div class="mobile-booking"><a class="mobile-booking-catalog" href="#services">${icons.grid}<span>Все услуги</span></a><a class="button button-primary" href="${salon.telegram}" target="_blank" rel="noopener noreferrer">Записаться ${icons.telegram}</a></div>
</body></html>`;
}
