/*
 * Pager: shows one section at a time instead of one very long page.
 *
 * Every section keeps its anchor (#about, #work, ...), so deep links, the nav bar and the
 * flight-path rail all still work. Switching pages scrolls to the top of the new page, keeps
 * browser Back/Forward working, and adds Previous/Next buttons at the end of each page.
 * If this script fails to load, the site simply stays a normal long page.
 */
(function () {
  'use strict';

  var PAGES = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'work', label: 'Work' },
    { id: 'github', label: 'GitHub' },
    { id: 'contact', label: 'Contact' }
  ];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var els = {};
  PAGES.forEach(function (p) { els[p.id] = document.getElementById(p.id); });
  if (!els.hero) return;                       // unexpected markup: leave the page alone

  var current = -1;

  function indexFromHash() {
    var id = (location.hash || '').replace(/^#/, '').split('/')[0];
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].id === id) return i;
    return 0;
  }

  function markNav(id) {
    document.querySelectorAll('.nav-link, .submenu-item').forEach(function (a) {
      var h = a.getAttribute('href') || '';
      var on = h === '#' + id;
      if (a.classList.contains('nav-link')) a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var active = document.querySelector('.nav-link.active');
    if (active && window.innerWidth <= 768 && active.scrollIntoView) {
      active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
    }
  }

  function toTop() {
    if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }

  function show(id, opts) {
    opts = opts || {};
    var idx = -1;
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].id === id) idx = i;
    if (idx < 0) idx = 0;
    var page = PAGES[idx];

    if (idx === current) { toTop(); return; }
    current = idx;
    window.__pageIndex = idx;

    PAGES.forEach(function (p) {
      var el = els[p.id];
      if (!el) return;
      var on = p.id === page.id;
      el.classList.toggle('is-active', on);
      if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
    });
    markNav(page.id);
    document.body.setAttribute('data-page', page.id);
    updateBar();
    toTop();

    if (opts.push !== false) {
      try { history.pushState({ page: page.id }, '', '#' + page.id); } catch (e) { location.hash = page.id; }
    }
    document.dispatchEvent(new CustomEvent('pagechange', { detail: { id: page.id, index: idx } }));

    // layout changed: let scroll-driven animations re-measure once the new page is on screen
    requestAnimationFrame(function () {
      if (window.ScrollTrigger && window.ScrollTrigger.refresh) window.ScrollTrigger.refresh();
    });
    if (typeof gtag === 'function') gtag('event', 'page_switch', { event_category: 'Navigation', event_label: page.id });
  }

  var bar = null;
  function buildBar() {
    bar = document.createElement('nav');
    bar.className = 'pager-bar';
    bar.setAttribute('aria-label', 'Portfolio pages');
    var dots = PAGES.map(function (p) {
      return '<a class="pager-dot" href="#' + p.id + '" aria-label="' + p.label + '" title="' + p.label + '"><span></span></a>';
    }).join('');
    bar.innerHTML =
      '<a class="pager-step pager-prev" href="#" aria-label="Previous page"><i class="fas fa-arrow-left" aria-hidden="true"></i><b></b></a>' +
      '<div class="pager-dots">' + dots + '</div>' +
      '<span class="pager-count" aria-live="polite"></span>' +
      '<a class="pager-step pager-next" href="#" aria-label="Next page"><b></b><i class="fas fa-arrow-right" aria-hidden="true"></i></a>';
    document.body.appendChild(bar);
  }
  function updateBar() {
    if (!bar) return;
    var prev = PAGES[current - 1], next = PAGES[current + 1];
    var p = bar.querySelector('.pager-prev'), n = bar.querySelector('.pager-next');
    p.style.visibility = prev ? 'visible' : 'hidden';
    n.style.visibility = next ? 'visible' : 'hidden';
    if (prev) { p.setAttribute('href', '#' + prev.id); p.querySelector('b').textContent = prev.label; p.setAttribute('aria-label', 'Previous page: ' + prev.label); }
    if (next) { n.setAttribute('href', '#' + next.id); n.querySelector('b').textContent = next.label; n.setAttribute('aria-label', 'Next page: ' + next.label); }
    bar.querySelectorAll('.pager-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === current);
      if (i === current) d.setAttribute('aria-current', 'page'); else d.removeAttribute('aria-current');
    });
    bar.querySelector('.pager-count').textContent = (current + 1) + ' / ' + PAGES.length;
  }

  // Long lists start short, with a button to show the rest.
  function compactList(gridId, itemSelector, keep, noun) {
    var grid = typeof gridId === 'string' ? document.querySelector(gridId) : gridId;
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll(itemSelector));
    if (items.length <= keep + 1) return;
    items.forEach(function (it, i) { if (i >= keep) it.hidden = true; });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline page-more';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Show all ' + items.length + ' ' + noun;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      items.forEach(function (it, i) { if (i >= keep) it.hidden = open; });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      btn.textContent = open ? 'Show all ' + items.length + ' ' + noun : 'Show fewer ' + noun;
      if (window.ScrollTrigger && window.ScrollTrigger.refresh) window.ScrollTrigger.refresh();
    });
    grid.parentNode.insertBefore(btn, grid.nextSibling);
  }

  // Take over in-page links before the smooth-scroll handlers see them.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = (a.getAttribute('href') || '').replace(/^#/, '').split('/')[0];
    if (!els[id]) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    show(id);
  }, true);

  window.addEventListener('popstate', function () { show(PAGES[indexFromHash()].id, { push: false }); });
  window.addEventListener('hashchange', function () { show(PAGES[indexFromHash()].id, { push: false }); });

  document.body.classList.add('paged');
  document.documentElement.classList.add('paged-js');
  if (reduced) document.documentElement.classList.add('paged-reduced');
  compactList('#work .projects-grid', '.project-card', 6, 'projects');
  // certificates are rendered by script.js on DOMContentLoaded, so shorten that list afterwards
  document.addEventListener('DOMContentLoaded', function () { compactList('#certsGridPage', '.cert-card-page', 6, 'certificates'); });
  buildBar();
  show(PAGES[indexFromHash()].id, { push: false });

  window.__pager = { show: show, pages: PAGES, current: function () { return current; } };
})();
