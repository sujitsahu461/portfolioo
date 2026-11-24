/*
 * Orbital clock: Sujit's local time (India Standard Time, UTC+5:30, no daylight saving).
 *
 * There are no hands. Three planets travel three orbits: Saturn is the hour, Earth is the minute
 * and Mars is the second, the same planets that fly past in the galaxy background. The digital
 * time sits in the middle. Everything shown is computed from the visitor's own clock, so nothing
 * is invented and no server is needed.
 *
 * The animation loop only runs while the clock is on screen and the tab is visible, and falls
 * back to one tick per second under prefers-reduced-motion.
 */
(function () {
  'use strict';

  var dock = document.getElementById('dock');
  var face = document.getElementById('clockFace');
  if (!dock || !face) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IST_MS = 19800000;
  var NS = 'http://www.w3.org/2000/svg';
  var C = 300;
  var R_SEC = 268, R_MIN = 212, R_HOUR = 156;
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var refs = {};

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function pt(r, deg) { var a = deg * Math.PI / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; }

  function grad(defs, tag, id, attrs, stops) {
    var g = el(tag, Object.assign({ id: id }, attrs), defs);
    stops.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1] }, g); });
  }

  function planet(parent, kind) {
    var g = el('g', {}, parent);
    var size = kind === 'hour' ? 13 : kind === 'min' ? 10 : 7;
    var glowColor = kind === 'hour' ? 'rgba(236,190,90,0.45)' : kind === 'min' ? 'rgba(80,160,255,0.45)' : 'rgba(255,110,70,0.45)';
    el('circle', { r: size * 2.1, fill: glowColor, filter: 'url(#ocGlow)' }, g);
    el('circle', { r: size, fill: 'url(#oc-' + kind + ')' }, g);
    if (kind === 'hour') el('ellipse', { rx: size * 1.9, ry: size * 0.55, fill: 'none', stroke: 'rgba(250,224,160,0.9)', 'stroke-width': 1.6, transform: 'rotate(-24)' }, g);
    if (kind === 'min') el('path', { d: 'M-4 -5 q4 -3 7 1 q-2 4 -6 3 z M1 3 q4 0 5 3 q-4 2 -6 -1 z', fill: 'rgba(120,210,140,0.75)' }, g);
    return g;
  }

  function orbit(svg, R, opts) {
    el('circle', { cx: C, cy: C, r: R, fill: 'none', stroke: 'rgba(255,255,255,0.11)', 'stroke-width': 1 }, svg);
    var n = opts.ticks, step = 360 / n;
    for (var i = 0; i < n; i++) {
      var major = i % opts.majorEvery === 0;
      var a = pt(R - (major ? 7 : 3.5), i * step), b = pt(R + (major ? 7 : 3.5), i * step);
      el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: major ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.22)', 'stroke-width': major ? 1.6 : 0.9, 'stroke-linecap': 'round' }, svg);
    }
    opts.labels.forEach(function (l) {
      var p = pt(R + 21, l[1]);
      var t = el('text', { x: p[0], y: p[1] + 3.5, 'text-anchor': 'middle', fill: 'rgba(214,224,246,0.7)', 'font-size': opts.size || 10, 'font-family': 'JetBrains Mono, monospace', 'letter-spacing': '1' }, svg);
      t.textContent = l[0];
    });
    var circ = 2 * Math.PI * R;
    var arc = el('circle', { cx: C, cy: C, r: R, fill: 'none', stroke: opts.stroke, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: 'rotate(-90 ' + C + ' ' + C + ')', 'stroke-dasharray': '0 ' + circ }, svg);
    return { arc: arc, circ: circ };
  }

  function build() {
    var svg = el('svg', { viewBox: '0 0 600 600', 'aria-hidden': 'true', focusable: 'false' });
    var defs = el('defs', {}, svg);
    grad(defs, 'radialGradient', 'oc-hour', { cx: '0.35', cy: '0.3', r: '0.8' }, [['0', '#fff3cf'], ['0.55', '#e9b44c'], ['1', '#6b4a12']]);
    grad(defs, 'radialGradient', 'oc-min', { cx: '0.35', cy: '0.3', r: '0.8' }, [['0', '#bfe3ff'], ['0.5', '#2f7fe0'], ['1', '#0a2a66']]);
    grad(defs, 'radialGradient', 'oc-sec', { cx: '0.35', cy: '0.3', r: '0.8' }, [['0', '#ffc8a8'], ['0.5', '#d4552a'], ['1', '#5a2010']]);
    grad(defs, 'linearGradient', 'ocArcSec', { x1: '0', y1: '0', x2: '1', y2: '1' }, [['0', '#00f0ff'], ['1', '#c800ff']]);
    var f = el('filter', { id: 'ocGlow', x: '-80%', y: '-80%', width: '260%', height: '260%' }, defs);
    el('feGaussianBlur', { stdDeviation: '4' }, f);

    var m4 = [['00', 0], ['15', 90], ['30', 180], ['45', 270]];
    refs.sec = orbit(svg, R_SEC, { ticks: 60, majorEvery: 5, labels: m4, stroke: 'url(#ocArcSec)' });
    refs.min = orbit(svg, R_MIN, { ticks: 60, majorEvery: 5, labels: m4, stroke: 'rgba(90,160,255,0.85)' });
    refs.hour = orbit(svg, R_HOUR, { ticks: 12, majorEvery: 3, labels: [['12', 0], ['3', 90], ['6', 180], ['9', 270]], stroke: 'rgba(236,190,90,0.9)', size: 12 });

    // the "now" marker at 12 o'clock
    el('path', { d: 'M ' + C + ' ' + (C - R_SEC - 36) + ' l -5 -9 h 10 z', fill: 'rgba(0,240,255,0.9)' }, svg);

    refs.pHour = planet(svg, 'hour');
    refs.pMin = planet(svg, 'min');
    refs.pSec = planet(svg, 'sec');
    face.appendChild(svg);
  }

  /* ───────────── readout ───────────── */
  var dEl = document.getElementById('clockDigital');
  var dateEl = document.getElementById('clockDate');
  var phaseEl = document.getElementById('clockPhase');
  var diffEl = document.getElementById('clockDiff');
  var digits = null, lastSecond = -1, lastMinute = -1;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function buildDigital() {
    if (!dEl) return;
    dEl.innerHTML = '<span data-h>--</span><i>:</i><span data-m>--</span><i>:</i><span data-s>--</span>';
    digits = { h: dEl.querySelector('[data-h]'), m: dEl.querySelector('[data-m]'), s: dEl.querySelector('[data-s]') };
  }

  function phaseOf(h) {
    if (h >= 5 && h < 12) return ['fa-sun', 'Morning in Odisha'];
    if (h >= 12 && h < 17) return ['fa-sun', 'Afternoon in Odisha'];
    if (h >= 17 && h < 21) return ['fa-cloud-sun', 'Evening in Odisha'];
    return ['fa-moon', 'Night in Odisha'];
  }

  function difference() {
    var mine = -new Date().getTimezoneOffset();
    var diff = 330 - mine;
    var own = '';
    try { own = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); } catch (e) { /* ignore */ }
    if (diff === 0) return 'Same time as yours' + (own ? ' (' + own + ')' : '');
    var hrs = Math.floor(Math.abs(diff) / 60), m = Math.abs(diff) % 60;
    var span = ((hrs ? hrs + 'h ' : '') + (m ? m + 'm' : '')).trim();
    return 'Your time ' + own + ' · Sujit is ' + span + (diff > 0 ? ' ahead' : ' behind');
  }

  function updateReadout(d) {
    var h = d.getUTCHours(), m = d.getUTCMinutes(), s = d.getUTCSeconds();
    if (digits && s !== lastSecond) {
      digits.h.textContent = pad(h); digits.m.textContent = pad(m); digits.s.textContent = pad(s);
      lastSecond = s;
    }
    if (m !== lastMinute) {
      lastMinute = m;
      if (dateEl) dateEl.innerHTML = '<b>' + DAYS[d.getUTCDay()].toUpperCase() + '</b><span>' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()].toUpperCase() + ' ' + d.getUTCFullYear() + '</span>';
      var ph = phaseOf(h);
      if (phaseEl) phaseEl.innerHTML = '<i class="fas ' + ph[0] + '" aria-hidden="true"></i> ' + ph[1];
      if (diffEl) diffEl.textContent = difference();
    }
  }

  function place(g, r, deg) {
    var p = pt(r, deg);
    g.setAttribute('transform', 'translate(' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ')');
  }
  function arc(o, deg) { o.arc.setAttribute('stroke-dasharray', (deg / 360 * o.circ).toFixed(1) + ' ' + o.circ.toFixed(1)); }

  function updateOrbits(d, smooth) {
    var h = d.getUTCHours(), m = d.getUTCMinutes();
    var sec = d.getUTCSeconds() + (smooth ? d.getUTCMilliseconds() / 1000 : 0);
    var aS = sec * 6, aM = (m + sec / 60) * 6, aH = ((h % 12) + m / 60 + sec / 3600) * 30;
    place(refs.pSec, R_SEC, aS); place(refs.pMin, R_MIN, aM); place(refs.pHour, R_HOUR, aH);
    arc(refs.sec, aS); arc(refs.min, aM); arc(refs.hour, aH);
  }

  /* ───────────── loop: only while visible ───────────── */
  var raf = 0, timer = 0, onScreen = false;
  function istNow() { return new Date(Date.now() + IST_MS); }
  function tick() { var d = istNow(); updateOrbits(d, !reduced); updateReadout(d); }
  function frame() { tick(); raf = requestAnimationFrame(frame); }
  function start() {
    if (raf || timer || !onScreen || document.hidden) return;
    if (reduced) { tick(); timer = setInterval(tick, 1000); } else raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf); raf = 0;
    if (timer) clearInterval(timer); timer = 0;
  }

  build();
  buildDigital();
  tick();                                // correct from the first paint

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries.some(function (e) { return e.isIntersecting; });
      if (onScreen) start(); else stop();
    }, { rootMargin: '120px' }).observe(dock);
  } else { onScreen = true; start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
})();
