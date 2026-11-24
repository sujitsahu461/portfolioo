/*
 * GitHub section: one compact profile card plus the contribution graph.
 * Loads /api/github (real public data for github.com/sujitsahu461) when the section is about to
 * scroll into view. Every value comes from the API response and is escaped before it enters the
 * DOM. If the request fails the section says so and links to the profile.
 */
(function () {
  'use strict';

  var root = document.getElementById('ghRoot');
  if (!root) return;
  var PROFILE = 'https://github.com/sujitsahu461';
  var LINKEDIN = 'https://www.linkedin.com/in/sujit-kumar-sahu-60b80531a';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }
  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    var u = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    for (var i = 0; i < u.length; i++) {
      if (s >= u[i][0]) { var n = Math.floor(s / u[i][0]); return n + ' ' + u[i][1] + (n > 1 ? 's' : '') + ' ago'; }
    }
    return 'just now';
  }
  function num(n) { return Number(n).toLocaleString('en-US'); }

  function card(d) {
    var p = d.profile, c = d.commits && d.commits[0];
    var stats = [];
    if (d.calendar) stats.push([d.calendar.total, 'Contributions, last year']);
    stats.push([p.publicRepos, 'Repositories'], [p.followers, 'Followers'], [new Date(p.since).getUTCFullYear(), 'Member since']);
    return '<article class="gh-card">' +
      '<a class="gh-id" href="' + esc(p.url || PROFILE) + '" target="_blank" rel="noopener noreferrer" data-gh-link>' +
        '<img src="' + esc(p.avatar) + '&s=120" alt="" width="60" height="60" loading="lazy" referrerpolicy="no-referrer">' +
        '<span><strong>' + esc(d.user) + '</strong><small>' + esc(p.bio || '') + '</small></span><i class="fab fa-github" aria-hidden="true"></i></a>' +
      '<ul class="gh-stats-mini">' + stats.map(function (s) {
        return '<li><b>' + esc(num(s[0])) + '</b><span>' + esc(s[1]) + '</span></li>';
      }).join('') + '</ul>' +
      (c ? '<p class="gh-last"><span>Latest commit</span> <a href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer" data-gh-link>' + esc(c.message) + '</a><small>' + esc(c.repo) + ' · ' + esc(ago(c.at)) + '</small></p>' : '') +
      '<div class="gh-actions"><a class="btn btn-primary" href="' + esc(p.url || PROFILE) + '" target="_blank" rel="noopener noreferrer" data-gh-link>OPEN GITHUB <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>' +
      '<a class="btn btn-outline" href="' + LINKEDIN + '" target="_blank" rel="noopener noreferrer" data-gh-link><i class="fab fa-linkedin-in" aria-hidden="true"></i> LINKEDIN</a></div>' +
    '</article>';
  }

  function heatmap(cal) {
    if (!cal || !cal.days.length) return '';
    var days = cal.days, cells = '', monthRow = '', lastMonth = -1;
    var firstDow = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
    days.forEach(function (day, i) {
      var dt = new Date(day.date + 'T00:00:00Z');
      var col = Math.floor((i + firstDow) / 7) + 1;
      var row = ((i + firstDow) % 7) + 1;
      if (dt.getUTCDay() === 0 || i === 0) {
        var m = dt.getUTCMonth();
        if (m !== lastMonth) { monthRow += '<span class="gh-month" style="grid-column:' + col + '">' + MONTHS[m] + '</span>'; lastMonth = m; }
      }
      var label = (day.count ? day.count + ' contribution' + (day.count > 1 ? 's' : '') : 'No contributions') + ' on ' + fmtDate(day.date);
      cells += '<span class="gh-cell" data-l="' + day.level + '" style="grid-column:' + col + ';grid-row:' + row + '" title="' + esc(label) + '" role="img" aria-label="' + esc(label) + '"></span>';
    });
    return '<div class="gh-block"><h3 class="gh-h">Contribution graph <small>' + esc(num(cal.total)) + ' in the last year</small></h3>' +
      '<div class="gh-scroll" tabindex="0" role="group" aria-label="Contribution graph for the last year, scroll sideways on small screens">' +
      '<div class="gh-months">' + monthRow + '</div><div class="gh-grid">' + cells + '</div></div>' +
      '<div class="gh-legend" aria-hidden="true"><span>Less</span><i class="gh-cell" data-l="0"></i><i class="gh-cell" data-l="1"></i><i class="gh-cell" data-l="2"></i><i class="gh-cell" data-l="3"></i><i class="gh-cell" data-l="4"></i><span>More</span></div></div>';
  }

  function render(d) {
    root.innerHTML = '<div class="gh-compact' + (d.calendar ? '' : ' gh-solo') + '">' + card(d) + heatmap(d.calendar) + '</div>' +
      '<p class="gh-updated">Live from GitHub · refreshed ' + esc(ago(d.fetchedAt)) + '</p>';
    root.querySelectorAll('[data-gh-link]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (typeof gtag === 'function') gtag('event', 'github_link_click', { event_category: 'Outbound Links', event_label: a.href });
      });
    });
  }

  function fail() {
    root.innerHTML = '<p class="gh-state">Could not load live GitHub data right now. ' +
      '<a href="' + PROFILE + '" target="_blank" rel="noopener noreferrer">Open github.com/sujitsahu461</a> to see the activity directly.</p>';
  }

  var started = false;
  function load() {
    if (started) return;
    started = true;
    var direct = function () {
      return fetch('/api/github', { headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    };
    // the loading screen already asked for the data; reuse it, and only ask again if that failed
    var first = window.__ghPrefetch ? window.__ghPrefetch.then(function (d) { return d || direct(); }) : direct();
    first.then(render).catch(fail);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
    }, { rootMargin: '900px 0px' });
    io.observe(root);
  } else {
    load();
  }
})();
