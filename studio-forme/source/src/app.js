// The full catalogue and native details remain usable without JavaScript.
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const categoryLinks = [...document.querySelectorAll('[data-category]')];
const panels = [...document.querySelectorAll('[data-panel]')];
const categoryPicker = document.querySelector('#category-picker');
const catalogMain = document.querySelector('#selected-services');
const categoryStatus = document.querySelector('#category-status');
const currentCategory = document.querySelector('[data-current-category]');
let selectedCategory = panels[0]?.dataset.panel || '';
let panelTransition;

function selectCategory(id, { scroll = false, remember = false, announce = true, focus = false } = {}) {
  const panel = panels.find(item => item.dataset.panel === id);
  const link = categoryLinks.find(item => item.dataset.category === id);
  if (!panel || !link) return;
  const changed = selectedCategory !== id;
  selectedCategory = id;
  panelTransition?.cancel();
  for (const item of panels) item.hidden = item !== panel;
  for (const item of categoryLinks) {
    if (item === link) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  }
  const name = link.querySelector('.category-name').textContent;
  currentCategory.textContent = name;
  if (announce) categoryStatus.textContent = `Категория: ${name}. Процедур: ${panel.querySelectorAll('[data-service]').length}.`;
  if (remember) history.replaceState(null, '', `#category-${id}`);
  if (changed && !prefersReducedMotion.matches && typeof panel.animate === 'function') {
    panelTransition = panel.animate(
      [{ opacity: .2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 220, easing: 'cubic-bezier(.22,.7,.22,1)' }
    );
  }
  if (focus) panel.querySelector('h3').focus({ preventScroll: true });
  if (scroll) catalogMain.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
}

for (const link of categoryLinks) {
  link.addEventListener('click', event => {
    event.preventDefault();
    selectCategory(link.dataset.category, { scroll: true, remember: true, focus: true });
  });
}
document.querySelector('[data-catalog-back]').addEventListener('click', event => {
  event.preventDefault();
  categoryPicker.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  categoryLinks.find(link => link.dataset.category === selectedCategory)?.focus({ preventScroll: true });
});
function categoryFromHash() {
  return location.hash.startsWith('#category-') ? location.hash.slice(10) : null;
}
const initialCategory = categoryFromHash();
selectCategory(panels.some(panel => panel.dataset.panel === initialCategory) ? initialCategory : selectedCategory, { announce: false });
window.addEventListener('hashchange', () => {
  const id = categoryFromHash();
  if (id) selectCategory(id, { scroll: true });
});

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
document.querySelector('.site-header').addEventListener('click', event => {
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
