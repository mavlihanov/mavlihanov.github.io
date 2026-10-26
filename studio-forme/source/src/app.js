// Progressive enhancement: the complete catalogue and native details work without JavaScript.
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const categoryLinks = [...document.querySelectorAll('[data-category]')];
const panels = [...document.querySelectorAll('[data-panel]')];
const categorySelect = document.querySelector('#category-select');
const searchInput = document.querySelector('#service-search');
const searchStatus = document.querySelector('#search-status');
const searchEmpty = document.querySelector('#search-empty');
const clearSearch = document.querySelector('.search-clear');
let selectedCategory = panels[0]?.dataset.panel || '';

function normalize(value) {
  return value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
}

function filterCatalogue({ announce = true } = {}) {
  const query = normalize(searchInput.value);
  const words = query.split(/\s+/).filter(Boolean);
  let matchingRows = 0;
  const querying = query.length > 0;
  document.querySelector('.catalog-main').classList.toggle('is-searching', querying);
  for (const panel of panels) {
    let matchesInPanel = 0;
    for (const row of panel.querySelectorAll('[data-service]')) {
      const isMatch = !querying || words.every(word => normalize(row.dataset.search).includes(word));
      row.hidden = !isMatch;
      if (isMatch) matchesInPanel += 1;
    }
    panel.hidden = querying ? matchesInPanel === 0 : panel.dataset.panel !== selectedCategory;
    for (const group of panel.querySelectorAll('.service-group')) {
      group.hidden = [...group.querySelectorAll('[data-service]')].every(row => row.hidden);
    }
    if (!panel.hidden) matchingRows += matchesInPanel;
  }
  for (const link of categoryLinks) {
    if (!querying && link.dataset.category === selectedCategory) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  clearSearch.hidden = !querying;
  searchEmpty.hidden = matchingRows !== 0;
  categorySelect.disabled = querying;
  if (announce) {
    searchStatus.textContent = querying
      ? `По запросу «${searchInput.value.trim()}» найдено процедур: ${matchingRows}.`
      : `Выбрано направление: ${categorySelect.selectedOptions[0].textContent}. Позиций: ${matchingRows}.`;
  }
}

function selectCategory(id, { scroll = false } = {}) {
  if (!panels.some(panel => panel.dataset.panel === id)) return;
  const changed = selectedCategory !== id || searchInput.value !== '';
  selectedCategory = id;
  categorySelect.value = id;
  searchInput.value = '';
  filterCatalogue();
  const panel = panels.find(panel => panel.dataset.panel === id);
  if (changed && !prefersReducedMotion.matches && typeof panel.animate === 'function') {
    panel.animate(
      [{ opacity: .15, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 240, easing: 'cubic-bezier(.22,.7,.22,1)' }
    );
  }
  if (scroll) {
    document.querySelector('#services').scrollIntoView({ behavior: prefersReducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }
}

for (const link of categoryLinks) {
  link.addEventListener('click', event => {
    event.preventDefault();
    selectCategory(link.dataset.category);
  });
}
for (const link of document.querySelectorAll('[data-category-jump]')) {
  link.addEventListener('click', event => {
    event.preventDefault();
    selectCategory(link.dataset.categoryJump, { scroll: true });
  });
}
categorySelect.addEventListener('change', () => selectCategory(categorySelect.value));
searchInput.addEventListener('input', () => filterCatalogue());
for (const button of document.querySelectorAll('[data-reset-search]')) {
  button.addEventListener('click', () => {
    searchInput.value = '';
    filterCatalogue();
    searchInput.focus({ preventScroll: true });
  });
}
const hashCategory = location.hash.startsWith('#category-') ? location.hash.slice(10) : null;
if (hashCategory && panels.some(panel => panel.dataset.panel === hashCategory)) {
  selectedCategory = hashCategory;
  categorySelect.value = selectedCategory;
}
filterCatalogue({ announce: false });

// Real-height animations keep all surrounding rows in flow, including on fast repeated taps.
const accordionStates = new WeakMap();
for (const details of document.querySelectorAll('[data-accordion]')) {
  const summary = details.querySelector(':scope > summary');
  summary.addEventListener('click', event => {
    if (prefersReducedMotion.matches || typeof details.animate !== 'function') return;
    event.preventDefault();
    const previous = accordionStates.get(details);
    const willOpen = previous ? !previous.willOpen : !details.open;
    const startHeight = details.getBoundingClientRect().height;
    if (previous?.animation) {
      previous.animation.oncancel = null;
      previous.animation.onfinish = null;
      previous.animation.cancel();
    }
    details.style.height = '';
    details.style.overflow = '';
    const closedHeight = summary.getBoundingClientRect().height + 1;
    details.open = true;
    const expandedHeight = details.getBoundingClientRect().height;
    details.style.overflow = 'hidden';
    const animation = details.animate(
      [{ height: `${startHeight}px` }, { height: `${willOpen ? expandedHeight : closedHeight}px` }],
      { duration: 340, easing: 'cubic-bezier(.22,.7,.22,1)' }
    );
    accordionStates.set(details, { animation, willOpen });
    animation.onfinish = () => {
      if (accordionStates.get(details)?.animation !== animation) return;
      details.open = willOpen;
      details.style.height = '';
      details.style.overflow = '';
      accordionStates.delete(details);
    };
    animation.oncancel = () => {
      details.style.height = '';
      details.style.overflow = '';
    };
  });
}

// Navigation remains a small in-flow dropdown; it never captures or locks page scrolling.
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-nav');
function closeMenu({ restoreFocus = false } = {}) {
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  if (restoreFocus) menuButton.focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
mobileMenu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu({ restoreFocus: true });
});
document.addEventListener('click', event => {
  if (!mobileMenu.hidden && !document.querySelector('.site-header').contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: .06, rootMargin: '0px 0px -18px 0px' });
  for (const element of document.querySelectorAll('[data-reveal]')) revealObserver.observe(element);
} else {
  document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
}

const header = document.querySelector('#site-header');
let scrollFramePending = false;
window.addEventListener('scroll', () => {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(() => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
    scrollFramePending = false;
  });
}, { passive: true });

root.classList.add('js');
