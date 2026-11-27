/* AGNIVEDA — shared script. Loaded on every page with: <script src="script.js" defer></script> */
(function () {
  'use strict';

  /* ==========================================================
     CONFIG — the ONLY place you need to edit later.
     Leave a value empty ('') and that feature stays hidden/disabled.
     ========================================================== */
  var CONFIG = {
    contact: {
      email: '',      // e.g. 'hello@yourdomain.com'
      phone: '',      // e.g. '+91XXXXXXXXXX'
      whatsapp: '',   // digits only with country code, e.g. '91XXXXXXXXXX'
      instagram: '',  // full URL, e.g. 'https://instagram.com/yourpage'
      address: ''     // plain text
    },
    products: [
      {
        id: 'bilona-ghee',
        name: 'AGNIVEDA Bilona Ghee',
        tag: 'Traditional bilona',
        short: 'Hand-churned bilona ghee made from the milk of our own family animals.',
        description: 'Made the traditional way: milk from our own animals is set into curd, churned by the bilona method into fresh makkhan, then heated slowly until golden ghee separates.',
        sizes: [],          // e.g. ['500 ml', '1 L'] — if empty, no size selector is shown
        images: [],         // e.g. ['ghee-1.jpg', 'ghee-2.jpg'] — files in the main repo folder
        amazon: '',         // paste your real Amazon product URL
        flipkart: '',       // paste your real Flipkart product URL
        details: ''         // e.g. ingredients, net quantity, shelf life — copy from your final label
      }
    ]
  };

  /* Built-in illustrations so nothing ever looks broken */
  var JAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="b" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#ffe9a3"/><stop offset="1" stop-color="#ff8a1f"/></radialGradient><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f6b72d"/><stop offset=".5" stop-color="#ffd966"/><stop offset="1" stop-color="#e0950f"/></linearGradient></defs><rect width="400" height="400" fill="url(#b)"/><rect x="130" y="92" width="140" height="34" rx="8" fill="#0b2a1c"/><path d="M118 126h164c14 24 20 54 20 86v90c0 22-14 38-36 38H134c-22 0-36-16-36-38v-90c0-32 6-62 20-86z" fill="url(#g)" stroke="#0b2a1c" stroke-width="6"/><rect x="132" y="196" width="136" height="96" rx="12" fill="#0b2a1c"/><text x="200" y="236" text-anchor="middle" font-family="Georgia,serif" font-size="19" font-weight="700" fill="#ffd966" letter-spacing="3">AGNIVEDA</text><text x="200" y="262" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#fff7e3" letter-spacing="2">BILONA GHEE</text></svg>');
  var PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><radialGradient id="p" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#ffd966"/><stop offset="1" stop-color="#0b2a1c"/></radialGradient></defs><rect width="800" height="600" fill="url(#p)"/><path d="M400 200c60 90 90 130 90 180a90 90 0 0 1-180 0c0-50 30-90 90-180z" fill="#fff7e3" opacity=".85"/></svg>');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Image safety net (temporary photos that fail to load) ---------- */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.failed) {
      t.dataset.failed = '1';
      t.src = t.dataset.jar ? JAR : PLACEHOLDER;
    }
  }, true);

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- Products ---------- */
  function getProduct(id) {
    for (var i = 0; i < CONFIG.products.length; i++) if (CONFIG.products[i].id === id) return CONFIG.products[i];
    return null;
  }
  function imgs(p) { return p.images && p.images.length ? p.images : [JAR]; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var PRICE_NOTE = 'Live price shown on Amazon and Flipkart';

  function renderCards() {
    $$('[data-products]').forEach(function (box) {
      var limit = parseInt(box.dataset.limit, 10) || CONFIG.products.length;
      box.innerHTML = CONFIG.products.slice(0, limit).map(function (p, i) {
        return '<article class="product-card reveal" data-tilt style="--delay:' + (i * 0.1) + 's">' +
          '<span class="product-tag">' + esc(p.tag) + '</span>' +
          '<a class="product-media" href="product.html?p=' + p.id + '" aria-label="View ' + esc(p.name) + '">' +
          '<img src="' + esc(imgs(p)[0]) + '" alt="' + esc(p.name) + '" loading="lazy" data-jar="1"></a>' +
          '<div class="product-info"><h3>' + esc(p.name) + '</h3><p>' + esc(p.short) + '</p>' +
          '<span class="price-note">' + PRICE_NOTE + '</span>' +
          '<div class="product-actions"><a class="btn btn-dark" href="product.html?p=' + p.id + '">View details</a>' +
          '<button class="btn btn-gold" data-add="' + p.id + '">Add to cart</button></div></div></article>';
      }).join('');
    });
  }

  function marketBtn(url, cls, label) {
    return url
      ? '<a class="btn ' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">Buy on ' + label + '</a>'
      : '<span class="btn ' + cls + ' disabled" aria-disabled="true">' + label + ' link coming soon</span>';
  }

  function renderProductPage() {
    var box = $('#product-detail');
    if (!box) return;
    var id = new URLSearchParams(location.search).get('p');
    var p = getProduct(id) || CONFIG.products[0];
    document.title = p.name + ' | AGNIVEDA';
    var list = imgs(p), size = p.sizes[0] || '', qty = 1;

    box.innerHTML =
      '<div class="pd-layout">' +
      '<div class="pd-gallery reveal"><div class="pd-main"><img id="pd-img" src="' + esc(list[0]) + '" alt="' + esc(p.name) + '" data-jar="1"></div>' +
      (list.length > 1 ? '<div class="pd-thumbs">' + list.map(function (s, i) {
        return '<button type="button" class="' + (i ? '' : 'active') + '" data-thumb="' + esc(s) + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(s) + '" alt="" data-jar="1"></button>';
      }).join('') + '</div>' : '') + '</div>' +
      '<div class="pd-info reveal" style="--delay:.1s">' +
      '<span class="eyebrow">' + esc(p.tag) + '</span><h1 style="font-size:clamp(2.2rem,5vw,3.6rem)">' + esc(p.name) + '</h1>' +
      '<p class="lead">' + esc(p.description) + '</p>' +
      '<p class="price-note">' + PRICE_NOTE + '</p>' +
      (p.sizes.length ? '<div><strong>Size</strong><div class="size-options" style="margin-top:.6rem">' + p.sizes.map(function (s, i) {
        return '<button type="button" class="' + (i ? '' : 'active') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>';
      }).join('') + '</div></div>' : '') +
      '<div><strong>Quantity</strong><div style="margin-top:.6rem"><div class="qty"><button type="button" data-q="-1" aria-label="Decrease">&minus;</button><output id="pd-qty">1</output><button type="button" data-q="1" aria-label="Increase">+</button></div></div></div>' +
      '<div class="buy-row"><button class="btn btn-gold btn-block" id="pd-add" type="button">Add to cart</button>' +
      '<div class="buy-market">' + marketBtn(p.amazon, 'btn-amz', 'Amazon') + marketBtn(p.flipkart, 'btn-fk', 'Flipkart') + '</div>' +
      '<p class="note">Marketplace buttons open the official listing in a new tab.</p></div>' +
      '<div class="accordion"><details open><summary>How it is made</summary><p>Milk from our own animals is set into curd, churned the bilona way into makkhan, and heated slowly until golden ghee separates. <a href="bilona.html" style="color:var(--ember);text-decoration:underline">See the full journey</a>.</p></details>' +
      '<details><summary>Our family promise</summary><p>Har boond mein parampara: a family-rooted brand bringing traditional ghee-making to your kitchen.</p></details>' +
      (p.details ? '<details><summary>Product details</summary><p>' + esc(p.details) + '</p></details>' : '') + '</div>' +
      '</div></div>';

    box.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.thumb) {
        $('#pd-img').src = t.dataset.thumb;
        $$('.pd-thumbs button', box).forEach(function (b) { b.classList.toggle('active', b === t); });
      } else if (t.dataset.size) {
        size = t.dataset.size;
        $$('.size-options button', box).forEach(function (b) { b.classList.toggle('active', b === t); });
      } else if (t.dataset.q) {
        qty = Math.min(99, Math.max(1, qty + parseInt(t.dataset.q, 10)));
        $('#pd-qty').textContent = qty;
      } else if (t.id === 'pd-add') {
        addToCart(p.id, size, qty);
      }
    });
    initReveal();
  }

  /* ---------- Cart ---------- */
  var KEY = 'agniveda_cart_v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* storage blocked */ } }
  var cart = load();

  function addToCart(id, size, qty) {
    var found = cart.filter(function (i) { return i.id === id && i.size === (size || ''); })[0];
    if (found) found.qty = Math.min(99, found.qty + qty); else cart.push({ id: id, size: size || '', qty: qty });
    save(cart); renderCart(true); toast('Added to cart');
  }
  function totalQty() { return cart.reduce(function (n, i) { return n + i.qty; }, 0); }

  function buildDrawer() {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="drawer-overlay" data-cart-close></div>' +
      '<aside class="drawer" aria-label="Shopping cart" aria-hidden="true">' +
      '<div class="drawer-head"><h3>Your cart</h3><button type="button" data-cart-close aria-label="Close cart">&times;</button></div>' +
      '<div class="drawer-body" id="cart-body"></div>' +
      '<div class="drawer-foot" id="cart-foot"></div></aside>';
    while (wrap.firstChild) body.appendChild(wrap.firstChild);
  }

  function renderCart(bump) {
    var count = totalQty();
    $$('.cart-count').forEach(function (c) {
      c.textContent = count;
      c.classList.toggle('show', count > 0);
      if (bump && count) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    });
    var bodyEl = $('#cart-body'), foot = $('#cart-foot');
    if (!bodyEl) return;
    if (!cart.length) {
      bodyEl.innerHTML = '<div class="cart-empty"><p style="margin:0 auto 1.2rem">Your cart is empty. Golden ghee is waiting.</p><a class="btn btn-gold" href="shop.html">Browse the shop</a></div>';
      foot.innerHTML = '';
      return;
    }
    bodyEl.innerHTML = cart.map(function (it, idx) {
      var p = getProduct(it.id) || CONFIG.products[0];
      return '<div class="cart-item"><img src="' + esc(imgs(p)[0]) + '" alt="" data-jar="1">' +
        '<div><h4>' + esc(p.name) + '</h4>' + (it.size ? '<small>' + esc(it.size) + '</small>' : '') +
        '<div class="qty"><button type="button" data-cq="-1" data-i="' + idx + '" aria-label="Decrease">&minus;</button><output>' + it.qty + '</output><button type="button" data-cq="1" data-i="' + idx + '" aria-label="Increase">+</button></div></div>' +
        '<button type="button" class="cart-remove" data-rm="' + idx + '">Remove</button></div>';
    }).join('');
    var p0 = getProduct(cart[0].id) || CONFIG.products[0];
    foot.innerHTML =
      '<p class="note">Final price, delivery and payment happen securely on the marketplace you choose.</p>' +
      marketBtn(p0.amazon, 'btn-amz btn-block', 'Amazon') + marketBtn(p0.flipkart, 'btn-fk btn-block', 'Flipkart') +
      '<button type="button" class="cart-remove" data-clear style="justify-self:center">Clear cart</button>';
  }

  function toggleCart(open) {
    body.classList.toggle('cart-open', open);
    var d = $('.drawer'); if (d) d.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) renderCart(false);
  }

  /* ---------- Reveal on scroll ---------- */
  var io;
  function initReveal() {
    var els = $$('.reveal:not(.in), .step:not(.in)');
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    io = io || new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 3D tilt ---------- */
  function initTilt() {
    if (!window.matchMedia('(hover: hover)').matches || reduceMotion) return;
    $$('[data-tilt]').forEach(function (el) {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = '1';
      var max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', function () { el.style.removeProperty('--ry'); el.style.removeProperty('--rx'); });
    });
  }

  /* ---------- Hero particles (rising golden drops) ---------- */
  function initParticles() {
    var box = $('.hero-particles');
    if (!box || reduceMotion) return;
    var n = window.innerWidth > 700 ? 26 : 14;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'particle';
      s.style.left = (Math.random() * 100) + '%';
      s.style.setProperty('--s', (5 + Math.random() * 9).toFixed(1) + 'px');
      s.style.setProperty('--d', (7 + Math.random() * 8).toFixed(1) + 's');
      s.style.setProperty('--dl', (-Math.random() * 12).toFixed(1) + 's');
      s.style.setProperty('--x', ((Math.random() - 0.5) * 120).toFixed(0) + 'px');
      box.appendChild(s);
    }
  }

  /* ---------- Scroll effects: header, hero parallax, bilona thread ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, header = $('.site-header');
    if (header) header.classList.toggle('scrolled', y > 40 || body.dataset.header === 'solid');
    var bg = $('.hero-bg');
    if (bg && !reduceMotion && y < window.innerHeight * 1.2) bg.style.transform = 'translate3d(0,' + (y * 0.25).toFixed(1) + 'px,0) scale(1.08)';
    $$('.journey').forEach(function (j) {
      var fill = $('.thread-fill', j); if (!fill) return;
      var r = j.getBoundingClientRect(), mid = window.innerHeight * 0.55;
      var p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      fill.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    });
    ticking = false;
  }

  /* ---------- Contact page ---------- */
  function initContact() {
    var c = CONFIG.contact;
    var fmt = {
      email: function (v) { return 'mailto:' + v; },
      phone: function (v) { return 'tel:' + v.replace(/\s/g, ''); },
      whatsapp: function (v) { return 'https://wa.me/' + v.replace(/\D/g, ''); },
      instagram: function (v) { return v; },
      address: null
    };
    Object.keys(fmt).forEach(function (k) {
      $$('[data-contact-row="' + k + '"]').forEach(function (row) {
        if (!c[k]) { row.hidden = true; return; }
        row.hidden = false;
        var v = $('[data-contact-value]', row); if (v) v.textContent = c[k];
        var a = $('a', row); if (a && fmt[k]) { a.href = fmt[k](c[k]); if (k !== 'email' && k !== 'phone') { a.target = '_blank'; a.rel = 'noopener noreferrer'; } }
      });
    });
    var form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      if (!c.email) { toast('Email is not set up yet. Please try again soon.'); return; }
      var sub = encodeURIComponent('AGNIVEDA enquiry from ' + (d.get('name') || 'website visitor'));
      var msg = encodeURIComponent('Name: ' + d.get('name') + '\nPhone: ' + (d.get('phone') || '-') + '\n\n' + d.get('message'));
      location.href = 'mailto:' + c.email + '?subject=' + sub + '&body=' + msg;
      toast('Opening your email app');
    });
  }

  /* ---------- Init ---------- */
  function init() {
    // Active nav link
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === 'product.html') file = 'shop.html';
    $$('.nav-links a').forEach(function (a) {
      var h = (a.getAttribute('href') || '').toLowerCase();
      if (h === file || (file === '' && h === 'index.html')) a.classList.add('active');
    });

    // Mobile menu
    var mt = $('.menu-toggle');
    if (mt) {
      mt.addEventListener('click', function () {
        var open = body.classList.toggle('menu-open');
        mt.setAttribute('aria-expanded', open);
      });
      $$('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { body.classList.remove('menu-open'); }); });
    }

    buildDrawer();
    renderCards();
    renderProductPage();
    renderCart(false);
    initParticles();
    initContact();
    initReveal();
    initTilt();

    // Global clicks: add to cart, open/close cart, quantity, remove
    document.addEventListener('click', function (e) {
      var t = e.target.closest('button, a, [data-cart-close]');
      if (!t) return;
      if (t.dataset.add) { var p = getProduct(t.dataset.add); addToCart(t.dataset.add, p && p.sizes[0] || '', 1); }
      else if (t.classList.contains('cart-btn')) toggleCart(true);
      else if (t.hasAttribute('data-cart-close')) toggleCart(false);
      else if (t.dataset.cq) {
        var it = cart[+t.dataset.i]; if (!it) return;
        it.qty += parseInt(t.dataset.cq, 10);
        if (it.qty < 1) cart.splice(+t.dataset.i, 1);
        it && it.qty > 99 && (it.qty = 99);
        save(cart); renderCart(false);
      }
      else if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); save(cart); renderCart(false); }
      else if (t.hasAttribute('data-clear')) { cart = []; save(cart); renderCart(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { toggleCart(false); body.classList.remove('menu-open'); }
    });
    window.addEventListener('storage', function (e) { if (e.key === KEY) { cart = load(); renderCart(false); } });
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', onScroll);

    $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
    onScroll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
