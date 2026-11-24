/*
 * Galaxy fly-through background.
 *
 * Scrolling the page flies a camera through space. Each page section is a planet:
 * it grows as you approach the section and sweeps past as you leave it.
 *
 * What makes it look like real space:
 *  - planets are procedurally textured spheres (continents and clouds, banded gas giants,
 *    cratered rock, ice giants) lit from one sun, with a terminator and thin atmosphere
 *  - a Milky Way band with dust lanes and faint nebulae at infinite distance
 *  - stars use real spectral colours and a power-law brightness spread, no twinkle
 *    (there is no air to twinkle in), with diffraction spikes on only the brightest few
 *  - near stars fly past in 3D; far stars stay put, so you read depth
 *
 * Plain Canvas 2D, no library. Respects prefers-reduced-motion (one still frame that
 * follows scroll), pauses when the tab is hidden, exposes destroy().
 */
(function () {
  'use strict';

  // type picks the surface generator; r is the planet radius in px at unit scale
  var SECTIONS = [
    { id: 'hero', name: 'Home', type: 'earth', seed: 3, r: 62, atm: '90,150,255' },
    { id: 'about', name: 'About', type: 'mars', seed: 11, r: 46, atm: '200,120,80' },
    { id: 'education', name: 'Education', type: 'ice', seed: 5, r: 64, atm: '140,215,235' },
    { id: 'experience', name: 'Experience', type: 'jupiter', seed: 7, r: 96 },
    { id: 'skills', name: 'Skills', type: 'saturn', seed: 2, r: 74, ring: true },
    { id: 'certificates', name: 'Certificates', type: 'venus', seed: 9, r: 58, atm: '255,215,150' },
    { id: 'work', name: 'Work', type: 'neptune', seed: 4, r: 66, atm: '90,130,255' },
    { id: 'github', name: 'GitHub', type: 'moon', seed: 13, r: 42 },
    { id: 'contact', name: 'Contact', type: 'earth', seed: 21, r: 54, atm: '110,170,255' }
  ];

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SP = 1000;          // world distance between two planets
  var DEPTH = 2400;       // how far ahead stars are drawn
  var FOCAL = 620;
  var LIGHT = norm3(-0.62, -0.42, 0.66);   // the sun is up-left and slightly behind the camera
  var STAR_COLORS = [      // O/B, A, F, G, K, M — real spectral class colours, weighted by how often they read
    [155, 176, 255, 0.08], [202, 215, 255, 0.10], [248, 247, 255, 0.17],
    [255, 244, 234, 0.22], [255, 210, 161, 0.25], [255, 175, 115, 0.18]
  ];

  window.__galaxyActive = true;

  var canvas = document.createElement('canvas');
  canvas.id = 'galaxyBg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0, dpr = 1;
  var stars = [];
  var farLayer = null, bgTex = null, bgReady = false;
  var planets = SECTIONS.map(function (s, i) {
    var side = i % 2 === 0 ? 1 : -1;
    return {
      i: i, s: s, side: side,
      z: i * SP + 320,
      x: side * (0.34 + (i % 3) * 0.03),
      y: (i % 3 - 1) * 0.07,
      r: s.r, tex: null, ringTex: null, born: 0,
      sx: 0, sy: 0, sr: 0, vis: false
    };
  });

  var centers = [];
  var camF = 0, targetF = 0, vel = 0, lastZ = 0, lastT = 0;
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  var running = false, raf = 0, hovered = -1;
  var drawMs = 0, drawn = 0;        // average cost of one painted frame, for the performance check
  var quality = 1, slowRun = 0;     // 1 = full resolution; drops toward 0.6 if frames keep running long
  var dirty = true, lastCam = -1, lastMx = 0, lastMy = 0;

  /* ---------- maths ---------- */
  function norm3(x, y, z) { var l = Math.sqrt(x * x + y * y + z * z); return [x / l, y / l, z / l]; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function sstep(a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function mix3(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }

  function hash3(i, j, k) { var n = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return n - Math.floor(n); }
  function noise3(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    var a = mix(mix(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), mix(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v);
    var b = mix(mix(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), mix(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v);
    return mix(a, b, w);
  }
  function fbm(x, y, z, oct) {
    var s = 0, a = 0.5, f = 1;
    for (var o = 0; o < oct; o++) { s += a * noise3(x * f, y * f, z * f); f *= 2.03; a *= 0.5; }
    return s;
  }

  /* ---------- planet surfaces ---------- */
  // returns [r,g,b] plus, via out.atm, whether the surface is glossy; p is a point on the unit sphere
  function surface(type, seed, px, py, pz, lat) {
    var n, c, t;
    switch (type) {
      case 'earth': {
        n = fbm(px * 1.9 + seed, py * 1.9, pz * 1.9 + seed, 5);
        var iceCap = sstep(0.82, 0.9, Math.abs(lat) + (fbm(px * 6, py * 6, pz * 6 + seed, 3) - 0.5) * 0.12);
        if (n > 0.52) {
          var e = Math.min(1, (n - 0.52) * 4.2);
          c = mix3([46, 104, 52], [128, 108, 66], sstep(0.1, 0.7, e));
          c = mix3(c, [206, 196, 170], sstep(0.82, 1, e) * 0.8);
          var dry = sstep(0.55, 0.9, fbm(px * 2.4 + 5, py * 2.4, pz * 2.4, 3) + (1 - Math.abs(lat)) * -0.2 + 0.1);
          c = mix3(c, [150, 126, 78], dry * 0.55);
        } else {
          t = sstep(0.28, 0.52, n);
          c = mix3([7, 26, 78], [22, 84, 160], t);
        }
        c = mix3(c, [236, 242, 248], iceCap);
        var cl = sstep(0.5, 0.78, fbm(px * 3.6 + seed * 2, py * 3.1, pz * 3.6, 5));
        c = mix3(c, [250, 252, 255], cl * 0.9);
        return c;
      }
      case 'mars': {
        n = fbm(px * 2.6 + seed, py * 2.6, pz * 2.6, 5);
        c = mix3([176, 92, 52], [112, 56, 34], sstep(0.35, 0.65, n));
        var dark = sstep(0.55, 0.72, fbm(px * 1.3 + 3, py * 1.3, pz * 1.3, 4));
        c = mix3(c, [64, 36, 28], dark * 0.65);
        c = mix3(c, [232, 224, 214], sstep(0.9, 0.96, Math.abs(lat)));
        return c;
      }
      case 'moon': {
        n = fbm(px * 3.2 + seed, py * 3.2, pz * 3.2, 6);
        var maria = sstep(0.5, 0.62, fbm(px * 1.2 + 9, py * 1.2, pz * 1.2, 4));
        var g = 118 + (n - 0.5) * 140;
        c = [g, g * 0.985, g * 0.96];
        var crater = Math.abs(noise3(px * 11 + seed, py * 11, pz * 11) - 0.5);
        g = sstep(0.0, 0.07, crater);
        c = mix3([c[0] * 0.55, c[1] * 0.55, c[2] * 0.55], c, 0.45 + 0.55 * g);
        return mix3(c, [c[0] * 0.55, c[1] * 0.58, c[2] * 0.62], maria * 0.7);
      }
      case 'jupiter': case 'saturn': {
        var warp = fbm(px * 2.2 + seed, py * 5, pz * 2.2, 5);
        var band = 0.5 + 0.5 * Math.sin((lat * 9 + warp * 3.2) * Math.PI);
        var fine = fbm(px * 3 + 2, py * 22, pz * 3, 4);
        if (type === 'jupiter') {
          c = mix3([142, 88, 58], [230, 206, 172], band);
          c = mix3(c, [192, 120, 82], sstep(0.55, 0.8, fine) * 0.5);
          c = mix3(c, [246, 238, 224], sstep(0.7, 0.9, fine) * 0.3);
          // one storm
          var sx = px - 0.35, sy = lat + 0.32, sd = Math.sqrt(sx * sx * 1.6 + sy * sy * 5);
          c = mix3(c, [176, 70, 48], (1 - sstep(0.05, 0.16, sd)) * 0.85);
        } else {
          c = mix3([196, 168, 112], [234, 214, 164], band * 0.8 + fine * 0.2);
          c = mix3(c, [176, 150, 100], sstep(0.55, 0.85, fine) * 0.35);
        }
        return c;
      }
      case 'ice': {
        n = fbm(px * 1.6 + seed, py * 7, pz * 1.6, 4);
        c = mix3([110, 190, 212], [170, 226, 236], sstep(0.3, 0.7, n));
        return mix3(c, [220, 244, 248], sstep(0.82, 0.96, Math.abs(lat)) * 0.4);
      }
      case 'neptune': {
        var w = fbm(px * 2 + seed, py * 6, pz * 2, 5);
        c = mix3([30, 58, 168], [64, 110, 220], sstep(0.3, 0.7, w));
        c = mix3(c, [210, 226, 250], sstep(0.72, 0.9, fbm(px * 5, py * 14, pz * 5 + seed, 4)) * 0.55);
        var s2x = px + 0.3, s2y = lat - 0.18, s2 = Math.sqrt(s2x * s2x * 1.4 + s2y * s2y * 4.5);
        return mix3(c, [14, 28, 110], (1 - sstep(0.04, 0.15, s2)) * 0.8);
      }
      case 'venus': {
        var sw = fbm(px * 2 + seed, py * 2 + fbm(px * 3, py * 3, pz * 3, 3) * 1.6, pz * 2, 5);
        c = mix3([206, 168, 96], [244, 226, 176], sstep(0.3, 0.7, sw));
        return mix3(c, [176, 134, 80], sstep(0.62, 0.85, sw) * 0.35);
      }
    }
    return [128, 128, 128];
  }

  // Runs rowFn(row) for every row, yielding to the browser every ~8 ms so the page never janks.
  // Work happens only in the browser's idle time, so animations on the page stay smooth.
  function whenIdle(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 400 });
    else setTimeout(fn, 30);
  }
  function sliceRows(total, rowFn, done) {
    var r = 0;
    (function chunk(deadline) {
      var budget = deadline && deadline.timeRemaining ? Math.max(2, Math.min(6, deadline.timeRemaining())) : 3;
      var t = performance.now();
      do { rowFn(r++); } while (r < total && performance.now() - t < budget);
      if (r < total) whenIdle(chunk); else done();
    })();
  }
  function introActive() { return document.body.classList.contains('intro-active'); }

  function buildSphere(def, S, cb) {
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var x = cv.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    var A = 0.24, ca = Math.cos(A), sa = Math.sin(A);
    var atm = def.atm ? def.atm.split(',').map(Number) : null;
    sliceRows(S, function (py) {
      for (var px = 0; px < S; px++) {
        var nx = (px + 0.5) / S * 2 - 1, ny = (py + 0.5) / S * 2 - 1, r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;
        var r = Math.sqrt(r2), nz = Math.sqrt(1 - r2);
        var qx = nx * ca + ny * sa, qy = -nx * sa + ny * ca;
        var c = surface(def.type, def.seed, qx, qy, nz, qy);
        // lighting: lambert with a soft terminator, a little ambient, limb darkening
        var dif = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
        var shade = 0.025 + 0.975 * sstep(-0.1, 0.8, dif);
        shade *= 0.82 + 0.18 * nz;
        var rr = c[0] * shade, gg = c[1] * shade, bb = c[2] * shade;
        if (atm) {
          var rim = Math.pow(1 - nz, 2.6) * (0.2 + 0.8 * Math.max(0, dif + 0.25)) * 0.9;
          rr += atm[0] * rim; gg += atm[1] * rim; bb += atm[2] * rim;
        }
        if (def.type === 'earth' && c[2] > c[0] * 1.5) {   // sun glint on open ocean
          var spec = Math.pow(Math.max(0, dif), 28) * 0.35 * (1 - Math.min(1, c[0] / 180));
          rr += 255 * spec; gg += 255 * spec; bb += 255 * spec;
        }
        var a = r > 0.985 ? 1 - (r - 0.985) / 0.015 : 1;
        var o = (py * S + px) * 4;
        d[o] = Math.min(255, rr); d[o + 1] = Math.min(255, gg); d[o + 2] = Math.min(255, bb); d[o + 3] = a * 255;
      }
    }, function () { x.putImageData(img, 0, 0); cb(cv); });
  }

  function buildRing(S, cb) {   // face-on ring, drawn later squashed into an ellipse
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var x = cv.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    var inner = 0.5, outer = 1.0;
    sliceRows(S, function (py) {
      for (var px = 0; px < S; px++) {
        var nx = (px + 0.5) / S * 2 - 1, ny = (py + 0.5) / S * 2 - 1, r = Math.sqrt(nx * nx + ny * ny);
        if (r < inner || r > outer) continue;
        var t = (r - inner) / (outer - inner);
        var dens = 0.35 + 0.65 * fbm(t * 38, 3.1, 7.7, 3);
        dens *= sstep(0, 0.04, t) * (1 - sstep(0.94, 1, t));
        if (t > 0.58 && t < 0.64) dens *= 0.08;           // a gap, like the Cassini division
        if (t > 0.28 && t < 0.32) dens *= 0.5;
        var tone = 0.78 + 0.22 * noise3(t * 60, 1.3, 2.2);
        var o = (py * S + px) * 4;
        d[o] = 214 * tone; d[o + 1] = 190 * tone; d[o + 2] = 150 * tone; d[o + 3] = Math.min(235, dens * 255);
      }
    }, function () { x.putImageData(img, 0, 0); cb(cv); });
  }

  /* ---------- deep-space background ---------- */
  function buildBackground(cb) {
    var TW = 640, TH = 360, cv = document.createElement('canvas');
    cv.width = TW; cv.height = TH;
    var x = cv.getContext('2d'), img = x.createImageData(TW, TH), d = img.data;
    var ang = -0.5, ca = Math.cos(ang), sa = Math.sin(ang), row = 0;
    (function chunk() {
      var end = Math.min(TH, row + 8);
      for (; row < end; row++) {
        for (var px = 0; px < TW; px++) {
          var u = px / TW - 0.5, v = row / TH - 0.5;
          var dist = (u * sa - v * ca * (TH / TW)) * 1.0;
          var along = u * ca + v * sa * (TH / TW);
          var band = Math.exp(-(dist * dist) / 0.012);
          var cloud = fbm(u * 5 + 3, v * 5, 1.7, 5);
          var lane = sstep(0.5, 0.72, fbm(u * 9 + 1, v * 9 + 4, 5.3, 4));
          var core = 0.55 + 0.45 * Math.exp(-(along * along) / 0.18);
          var mw = band * (0.35 + 0.9 * cloud) * (1 - 0.8 * lane * Math.min(1, band * 1.6)) * core * 0.34;
          // faint nebula wash outside the band
          var neb = sstep(0.56, 0.82, fbm(u * 2.4 + 7, v * 2.4 + 2, 9.1, 5));
          var nm = fbm(u * 3 + 11, v * 3, 2.2, 3);
          var nr = mix(40, 170, nm), ng = mix(70, 60, nm), nb = mix(150, 120, nm);
          var warm = mix(0.55, 1, Math.min(1, band * 1.4));
          var r = 255 * warm * mw * 0.95 + nr * neb * 0.16;
          var g = 232 * warm * mw * 0.92 + ng * neb * 0.16;
          var b = 200 * mw * (0.8 + 0.2 * (1 - warm)) + 160 * mw * (1 - warm) + nb * neb * 0.16;
          var o = (row * TW + px) * 4;
          d[o] = Math.min(255, r); d[o + 1] = Math.min(255, g); d[o + 2] = Math.min(255, b); d[o + 3] = 255;
        }
      }
      if (row < TH) whenIdle(chunk);
      else { x.putImageData(img, 0, 0); cb(cv); }
    })();
  }

  function pickStarColor() {
    var t = Math.random(), acc = 0;
    for (var i = 0; i < STAR_COLORS.length; i++) { acc += STAR_COLORS[i][3]; if (t <= acc) return STAR_COLORS[i]; }
    return STAR_COLORS[3];
  }

  // far stars: baked once per size into an offscreen canvas, denser along the Milky Way
  function buildFarLayer() {
    var cv = document.createElement('canvas');
    cv.width = Math.round(W * 1.2 * dpr); cv.height = Math.round(H * 1.2 * dpr);
    var x = cv.getContext('2d');
    x.scale(dpr, dpr);
    var w = W * 1.2, h = H * 1.2, n = W < 600 ? 520 : 1100, ang = -0.5;
    var nx = Math.sin(ang), ny = -Math.cos(ang) * (h / w);
    var spikes = 0;
    for (var i = 0; i < n; i++) {
      var px = Math.random() * w, py = Math.random() * h;
      var u = px / w - 0.5, v = py / h - 0.5;
      var dist = u * nx + v * ny * (w / h);
      var keep = 0.22 + 0.78 * Math.exp(-(dist * dist) / 0.02);   // thicker in the band
      if (Math.random() > keep) { i--; if (i < -n * 4) break; continue; }
      var mag = Math.pow(Math.random(), 5.5);              // few bright, many faint
      var c = pickStarColor();
      var size = 0.45 + mag * 1.9, a = 0.25 + mag * 0.75;
      x.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')';
      x.beginPath(); x.arc(px, py, size * 0.5 + 0.2, 0, 6.2832); x.fill();
      if (mag > 0.55) {                                    // soft halo
        var g = x.createRadialGradient(px, py, 0, px, py, size * 4);
        g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.35)');
        g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        x.fillStyle = g; x.fillRect(px - size * 4, py - size * 4, size * 8, size * 8);
      }
      if (mag > 0.8 && spikes < 7) {                       // diffraction spikes on the brightest few only
        spikes++;
        var len = 9 + mag * 14;
        x.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.5)'; x.lineWidth = 0.6;
        x.beginPath(); x.moveTo(px - len, py); x.lineTo(px + len, py); x.moveTo(px, py - len); x.lineTo(px, py + len); x.stroke();
      }
    }
    farLayer = cv;
  }

  function makeStars() {
    var n = W < 480 ? 90 : W < 900 ? 140 : 230;
    stars = [];
    for (var k = 0; k < n; k++) {
      var c = pickStarColor();
      stars.push({
        x: rand(-1.7, 1.7) * W, y: rand(-1.7, 1.7) * H, z: Math.random() * DEPTH,
        col: c[0] + ',' + c[1] + ',' + c[2], m: 0.4 + Math.pow(Math.random(), 3) * 0.9
      });
    }
  }

  /* ---------- layout and sizing ---------- */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (!W || !H) return;   // hidden or not laid out yet; the next resize event rebuilds
    dpr = Math.min(window.devicePixelRatio || 1, W < 600 ? 1 : 1.5) * quality;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    makeStars();
    buildFarLayer();
    buildBackLayer();
    measure();
    dirty = true;
    if (!running || reduced) draw();
  }

  function measure() {
    centers = SECTIONS.map(function (s) {
      var el = document.getElementById(s.id);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;   // anchor: where the section begins
    });
    var last = 0;
    centers = centers.map(function (c) { if (c == null) c = last; last = c; return c; });
  }

  function progress() {
    if (window.__pager) return window.__pageIndex || 0;   // paged mode: one planet per page
    var y = window.scrollY;   // f is exactly i when section i's top reaches the top of the screen
    if (!centers.length || y <= centers[0]) return 0;
    for (var i = 0; i < centers.length - 1; i++) {
      if (y <= centers[i + 1]) return i + (y - centers[i]) / ((centers[i + 1] - centers[i]) || 1);
    }
    return centers.length - 1;
  }

  /* ---------- drawing ---------- */
  var backLayer = null, backScale = 1.32, backPR = 1;

  // Compose the backdrop once per size. Drawing five layers (and a full-screen gradient) every
  // frame was the most expensive part of the page; one 1:1 image copy is nearly free.
  function buildBackLayer() {
    if (!W || !H || !farLayer) { backLayer = null; return; }
    backPR = Math.min(dpr, 1.5);
    var bw = Math.round(W * backScale * backPR), bh = Math.round(H * backScale * backPR);
    var cv = document.createElement('canvas');
    cv.width = bw; cv.height = bh;
    var x = cv.getContext('2d');
    x.fillStyle = '#04050a';
    x.fillRect(0, 0, bw, bh);
    if (bgReady && bgTex) {
      x.globalCompositeOperation = 'lighter';
      x.drawImage(bgTex, 0, 0, bw, bh);
      x.globalCompositeOperation = 'source-over';
    }
    var fw = W * 1.2 * backPR, fh = H * 1.2 * backPR;
    x.drawImage(farLayer, (bw - fw) / 2, (bh - fh) / 2, fw, fh);
    // the sun's glow bleeding in from the up-left, where the planets are lit from
    var cx = (bw - W * backPR) / 2 - W * 0.06 * backPR, cy = (bh - H * backPR) / 2 - H * 0.1 * backPR;
    var gr = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6 * backPR);
    gr.addColorStop(0, 'rgba(255,236,205,0.16)');
    gr.addColorStop(0.35, 'rgba(255,214,170,0.05)');
    gr.addColorStop(1, 'rgba(255,214,170,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, bw, bh);
    backLayer = cv;
  }

  function drawBackground() {
    if (!backLayer) { ctx.fillStyle = '#04050a'; ctx.fillRect(0, 0, W, H); return; }
    var bw = W * backScale, bh = H * backScale;
    var mX = (bw - W) / 2, mY = (bh - H) / 2;                 // spare margin on each side
    var ox = -mX - Math.max(-mX, Math.min(mX, camF * 10 + mx * 9));
    var oy = -mY + Math.max(-mY, Math.min(mY, camF * 5 - my * 6));
    ctx.drawImage(backLayer, ox, oy, bw, bh);
  }

  function drawStars(camZ) {
    var streak = reduced ? 0 : Math.min(Math.abs(vel) * 2.2, 60);
    var dir = vel >= 0 ? 1 : -1;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var dz = (((s.z - camZ) % DEPTH) + DEPTH) % DEPTH;
      if (dz < 20) continue;
      var k = FOCAL / dz;
      var px = W / 2 + (s.x - mx * 60) * k, py = H / 2 + (s.y - my * 40) * k;
      if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
      var a = Math.min(1, (1 - dz / DEPTH) * 1.5) * s.m;
      var size = 0.5 + k * 1.1 * s.m;
      if (streak > 1) {
        var k2 = FOCAL / (dz + dir * streak);
        ctx.strokeStyle = 'rgba(' + s.col + ',' + (a * 0.85).toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.6, size * 0.7);
        ctx.beginPath(); ctx.moveTo(px, py);
        ctx.lineTo(W / 2 + (s.x - mx * 60) * k2, H / 2 + (s.y - my * 40) * k2); ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(' + s.col + ',' + a.toFixed(3) + ')';
        ctx.fillRect(px, py, size, size);
      }
    }
  }

  function drawRing(p, sx, sy, rs, back) {
    var half = rs / 0.5 * 1.0;           // ring image half-size so the planet sits at 0.44 of it
    half = rs / 0.4;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-0.36);
    ctx.scale(1, 0.26);
    ctx.beginPath();
    if (back) ctx.rect(-half, -half, half * 2, half); else ctx.rect(-half, 0, half * 2, half);
    ctx.clip();
    ctx.drawImage(p.ringTex, -half, -half, half * 2, half * 2);
    ctx.restore();
  }

  function drawPlanet(p, camZ, now) {
    var dz = p.z - camZ;
    p.vis = false;
    if (!p.tex || dz < 60 || dz > 2600) return;
    var k = FOCAL / dz;
    var sx = W / 2 + p.x * W * (k / 2) * (W < 700 ? 0.9 : 1) - mx * 60 * k;
    var sy = H / 2 + p.y * H * (k / 2) - my * 40 * k;
    var rs = p.r * k * (W < 700 ? 0.8 : 1);
    var span = rs * (p.s.ring ? 5.2 : 2.6);
    if (sx < -span || sx > W + span) return;
    p.sx = sx; p.sy = sy; p.sr = rs; p.vis = true;

    var fade = Math.min(1, (2600 - dz) / 900) * Math.min(1, (dz - 60) / 220) * Math.min(1, (now - p.born) / 700);
    var near = Math.max(0, Math.min(1, 1 - (dz - 320) / 700));
    ctx.save();
    ctx.globalAlpha = fade;

    if (p.s.atm) {                        // thin atmosphere glow, brightest on the sunward side
      var g = ctx.createRadialGradient(sx + rs * LIGHT[0] * -0.12, sy + rs * LIGHT[1] * -0.12, rs * 0.96, sx, sy, rs * 1.22);
      g.addColorStop(0, 'rgba(' + p.s.atm + ',0.32)');
      g.addColorStop(1, 'rgba(' + p.s.atm + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, rs * 1.22, 0, 6.2832); ctx.fill();
    }
    if (p.s.ring) drawRing(p, sx, sy, rs, true);
    ctx.drawImage(p.tex, sx - rs, sy - rs, rs * 2, rs * 2);
    if (p.s.ring) drawRing(p, sx, sy, rs, false);

    if (hovered === p.i) {
      ctx.strokeStyle = 'rgba(0,240,255,0.9)'; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.arc(sx, sy, rs * 1.35, 0, 6.2832); ctx.stroke();
      ctx.setLineDash([]);
    }

    var la = Math.max(near, hovered === p.i ? 1 : 0) * fade;
    if (la > 0.05 && rs > 14) {
      ctx.globalAlpha = la;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 ' + Math.round(Math.max(11, Math.min(15, rs * 0.17))) + 'px Orbitron, sans-serif';
      var lx = Math.max(64, Math.min(W - 64, sx)), ly = sy + rs * (p.s.ring ? 1.7 : 1.3) + 16;
      ctx.fillText(p.s.name.toUpperCase(), lx, ly);
      ctx.fillStyle = 'rgba(0,240,255,1)';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText('SECTOR 0' + (p.i + 1), lx, ly + 16);
    }
    ctx.restore();
  }

  function draw(now) {
    now = now || performance.now();
    if (!W || !H) return;
    drawBackground();
    var camZ = camF * SP;
    drawStars(camZ);
    var order = planets.slice().sort(function (a, b) { return b.z - a.z; });
    for (var i = 0; i < order.length; i++) drawPlanet(order[i], camZ, now);
    updateRail();
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = Math.min(0.1, Math.max(0.001, (now - lastT) / 1000));
    lastT = now;
    targetF = progress();
    camF += (targetF - camF) * (1 - Math.exp(-dt * 7));
    var z = camF * SP;
    vel += ((z - lastZ) / (dt * 60) - vel) * (1 - Math.exp(-dt * 14));
    lastZ = z;
    mx += (tmx - mx) * (1 - Math.exp(-dt * 3));
    my += (tmy - my) * (1 - Math.exp(-dt * 3));
    var fading = false;
    for (var q = 0; q < planets.length; q++) if (planets[q].tex && now - planets[q].born < 800) { fading = true; break; }   // a planet is fading in
    var moved = dirty || fading || Math.abs(camF - lastCam) > 0.00012 || Math.abs(mx - lastMx) > 0.0007 || Math.abs(my - lastMy) > 0.0007 || Math.abs(vel) > 0.02;
    if (moved && !introActive()) {       // idle page = no painting at all; nothing is visible behind the loader either
      var t0 = performance.now();
      draw(now);
      drawMs += (performance.now() - t0 - drawMs) * 0.1; drawn++;
      lastCam = camF; lastMx = mx; lastMy = my; dirty = false;
      // adaptive quality: if painted frames keep taking over 45 ms, render at a lower resolution
      if (dt > 0.045 && !document.hidden) { if (++slowRun > 40 && quality > 0.6) { quality = Math.max(0.6, quality * 0.8); slowRun = 0; resize(); } }
      else if (slowRun > 0) slowRun--;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced || running) return;
    running = true;
    lastZ = camF * SP;
    lastT = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  var stillPending = false;
  function stillUpdate() {
    if (stillPending) return;
    stillPending = true;
    requestAnimationFrame(function () {
      stillPending = false;
      camF = progress();
      vel = 0;
      draw();
    });
  }

  /* ---------- asset building, spread over idle time so the page never janks ---------- */
  function buildAssets() {
    // Two passes: a quick low-res set so every planet exists almost at once, then sharp
    // textures rebuilt in the background, nearest planet first, so nothing looks blurry up close.
    var lo = 160, hi = W < 600 ? 384 : 512;
    function pass(list, size, ringSize, next) {
      var k = 0;
      (function step() {
        if (k >= list.length) { if (next) next(); return; }
        var p = list[k++];
        buildSphere(p.s, size, function (cv) {
          p.tex = cv;
          if (!p.born) p.born = performance.now();
          dirty = true;
          if (reduced) draw();
          if (p.s.ring) buildRing(ringSize, function (rc) { p.ringTex = rc; step(); });
          else step();
        });
      })();
    }
    pass(planets.slice(), lo, 320, function () {
      // sharp textures wait until the intro has finished, then rebuild nearest planet first
      (function waitForIntro() {
        if (introActive()) { setTimeout(waitForIntro, 300); return; }
        var byDistance = planets.slice().sort(function (a, b) { return Math.abs(a.i - camF) - Math.abs(b.i - camF); });
        pass(byDistance, hi, hi * 1.5, null);
      })();
    });
    buildBackground(function (cv) { bgTex = cv; bgReady = true; buildBackLayer(); dirty = true; if (reduced) draw(); });
  }

  /* ---------- flight-path rail ---------- */
  var rail, railItems = [], activeIdx = -1;
  function buildRail() {
    rail = document.createElement('nav');
    rail.className = 'galaxy-rail';
    rail.setAttribute('aria-label', 'Flight path');
    SECTIONS.forEach(function (s) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.className = 'galaxy-rail-item';
      a.innerHTML = '<span class="galaxy-rail-label">' + s.name + '</span><span class="galaxy-rail-dot"></span>';
      a.addEventListener('click', function (e) {
        var el = document.getElementById(s.id);
        if (!el) return;
        e.preventDefault();
        if (window.__pager) window.__pager.show(s.id);
        else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      });
      rail.appendChild(a);
      railItems.push(a);
    });
    document.body.appendChild(rail);
  }
  function updateRail() {
    var idx = Math.max(0, Math.min(SECTIONS.length - 1, Math.round(camF)));
    if (idx === activeIdx) return;
    activeIdx = idx;
    railItems.forEach(function (a, i) {
      a.classList.toggle('active', i === idx);
      if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- pointer ---------- */
  var INTERACTIVE = 'a,button,input,textarea,select,label,summary,[role="button"],.timeline-content,.cert-card-page,.skill-card,.project-card,.experience-card,.highlight-item,.navbar,.sai-panel,form,img,p,h1,h2,h3,li,.gh-block,.gh-stat';
  function hit(x, y) {
    for (var i = planets.length - 1; i >= 0; i--) {
      var p = planets[i];
      if (p.vis && Math.hypot(x - p.sx, y - p.sy) < p.sr * 1.25 && p.sr > 14) return p.i;
    }
    return -1;
  }
  function onMove(e) {
    tmx = (e.clientX / W - 0.5) * 2;
    tmy = (e.clientY / H - 0.5) * 2;
    var free = !(e.target.closest && e.target.closest(INTERACTIVE));
    var h = free ? hit(e.clientX, e.clientY) : -1;
    if (h !== hovered) {
      hovered = h;
      dirty = true;
      document.documentElement.style.cursor = h >= 0 ? 'pointer' : '';
    }
  }
  function onClick(e) {
    if (hovered < 0) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    var el = document.getElementById(SECTIONS[hovered].id);
    if (window.__pager) window.__pager.show(SECTIONS[hovered].id);
    else if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  function onVisibility() { if (document.hidden) stop(); else { dirty = true; start(); } }

  var ro = null;
  function init() {
    buildRail();
    resize();
    setTimeout(buildAssets, 300);     // let the page and the intro start first
    window.addEventListener('resize', resize, { passive: true });
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { measure(); if (reduced) stillUpdate(); });
      ro.observe(document.body);
    }
    window.addEventListener('load', measure);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('click', onClick);
    document.addEventListener('pagechange', function () { dirty = true; if (reduced) stillUpdate(); });
    if (reduced) {
      window.addEventListener('scroll', stillUpdate, { passive: true });
      stillUpdate();
    } else {
      document.addEventListener('mousemove', onMove, { passive: true });
      start();
    }
  }

  window.__galaxy = {
    state: function () {
      return { drawMs: +drawMs.toFixed(2), drawn: drawn, camF: camF, vel: vel, W: W, H: H, bgReady: bgReady, planets: planets.map(function (p) { return [p.s.id, !!p.tex, p.vis, Math.round(p.sx), Math.round(p.sy), Math.round(p.sr)]; }) };
    },
    destroy: function () {
      stop();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', stillUpdate);
      window.removeEventListener('load', measure);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', onClick);
      document.documentElement.style.cursor = '';
      if (rail) rail.remove();
      canvas.remove();
      farLayer = bgTex = null;
      planets.forEach(function (p) { p.tex = p.ringTex = null; });
      window.__galaxyActive = false;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
