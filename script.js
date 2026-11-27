/* ==========================================================================
   AGNIVEDA — script.js
   Vanilla JS. No dependencies. Works on GitHub Pages.

   EDIT ONLY THE THREE CONFIG BLOCKS BELOW (SITE, CONTACT, PRODUCTS).
   Everything under "ENGINE" should not need changes.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     CONFIG 1 — SITE
     ====================================================================== */
  const SITE = {
    name: 'AGNIVEDA',
    tagline: 'Har boond mein parampara.',
    url: 'https://locviahq.github.io/agniveda/'
  };

  /* ======================================================================
     CONFIG 2 — CONTACT
     TODO: fill in real details. Leave '' to show an honest "coming soon".
     whatsapp: digits with country code, e.g. '91XXXXXXXXXX' (no + or spaces)
     ====================================================================== */
  const CONTACT = {
    whatsapp: '',
    email: ''
  };

  /* ======================================================================
     CONFIG 3 — PRODUCTS
     TODO: replace every placeholder below with confirmed information.
     - price: number in rupees (e.g. 999) or null if not confirmed yet.
              null = "Price coming soon" and Add to Cart is disabled.
     - amazonUrl / flipkartUrl: exact listing URL (must start with https://)
              or '' = "Coming soon" button.
     - images: [{ src: 'path-or-url', alt: 'description' }]. Empty = placeholder.
              Replace temporary photos with AGNIVEDA's own photographs.
     - info: verified facts only. '' = "will be added soon".
     ====================================================================== */
  const PRODUCTS = [
    {
      id: 'bilona-ghee',
      name: 'Traditional Bilona Ghee',              // TODO: confirm final product name
      tagline: 'Curd-bilona ghee from our family’s own animals',
      description:
        'Made with milk from our family’s own animals and prepared in the traditional curd-bilona way. ' +
        'A tradition from our home, shared with yours.',
      badge: '',                                    // e.g. 'New' — leave '' for none
      images: [
        // { src: 'ghee-jar.jpg', alt: 'AGNIVEDA bilona ghee jar' }   // TODO: add own photos
      ],
      variants: [
        {
          id: 'size-tbc',                           // TODO: e.g. 'size-500ml'
          label: 'Pack size to be announced',       // TODO: e.g. '500 ml'
          price: null,                              // TODO: real price in rupees
          inStock: true,
          amazonUrl: '',                            // TODO: exact Amazon listing URL
          flipkartUrl: ''                           // TODO: exact Flipkart listing URL
        }
      ],
      info: {
        ingredients: '',                            // TODO: verified ingredients
        storage: '',                                // TODO: verified storage instructions
        shelfLife: '',                              // TODO: verified shelf life
        about: ''                                   // TODO: any extra verified product notes
      }
    }
  ];

  /* ======================================================================
     ENGINE
     ====================================================================== */
  const STORAGE_KEY = 'agniveda_cart_v1';
  const MAX_QTY = 20;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isUrl = u => typeof u === 'string' && /^https:\/\//i.test(u.trim());
  const money = n => '₹' + Number(n).toLocaleString('en-IN');
  const getProduct = id => PRODUCTS.find(p => p.id === id);
  const getVariant = (p, vid) => (p ? p.variants.find(v => v.id === vid) : undefined);
  const canBuy = v => !!v && typeof v.price === 'number' && v.price > 0 && v.inStock !== false;
  const lineKey = (p, v) => p + '::' + v;
  const waDigits = () => String(CONTACT.whatsapp || '').replace(/\D/g, '');
  const waLink = text => 'https://wa.me/' + waDigits() + (text ? '?text=' + encodeURIComponent(text) : '');

  let cart = [];                // [{ p: productId, v: variantId, q: qty }]
  let memoryStore = null;       // fallback if localStorage is unavailable
  let navOpen = false;
  let cartOpen = false;
  let lastFocus = null;
  let toastTimer = null;
  let drawer, overlay, cartBody, cartFoot, toastEl;

  /* ---------- Storage ---------- */
  function sanitize(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    arr.forEach(it => {
      if (!it || typeof it !== 'object') return;
      const p = getProduct(it.p);
      const v = getVariant(p, it.v);
      if (!p || !v) return;
      const q = Math.max(1, Math.min(MAX_QTY, parseInt(it.q, 10) || 1));
      const existing = out.find(o => o.p === it.p && o.v === it.v);
      if (existing) existing.q = Math.min(MAX_QTY, existing.q + q);
      else out.push({ p: it.p, v: it.v, q: q });
    });
    return out;
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return sanitize(raw ? JSON.parse(raw) : []);
    } catch (e) { return sanitize(memoryStore || []); }
  }
  function save() {
    memoryStore = cart;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* private mode: memory only */ }
  }

  /* ---------- Derived cart data ---------- */
  function lines() {
    return cart.map(it => {
      const product = getProduct(it.p);
      const variant = getVariant(product, it.v);
      return product && variant ? { product, variant, q: it.q, key: lineKey(it.p, it.v) } : null;
    }).filter(Boolean);
  }
  const cartCount = () => cart.reduce((n, it) => n + it.q, 0);
  const subtotal = () => lines().reduce((s, l) => s + (canBuy(l.variant) ? l.variant.price * l.q : 0), 0);

  /* ---------- Cart actions ---------- */
  function addToCart(pid, vid, qty, opts) {
    const p = getProduct(pid), v = getVariant(p, vid);
    if (!p || !v || !canBuy(v)) { toast('This product is not available to add yet.'); return false; }
    const add = Math.max(1, Math.min(MAX_QTY, parseInt(qty, 10) || 1));
    const ex = cart.find(it => it.p === pid && it.v === vid);
    if (ex) ex.q = Math.min(MAX_QTY, ex.q + add);
    else cart.push({ p: pid, v: vid, q: add });
    save(); renderCart(true);
    if (opts && opts.open) openCart(); else toast(p.name + ' added to cart');
    return true;
  }
  function changeQty(key, delta) {
    const it = cart.find(i => lineKey(i.p, i.v) === key);
    if (!it) return;
    it.q = Math.max(1, Math.min(MAX_QTY, it.q + delta));
    save(); renderCart();
  }
  function removeLine(key) {
    cart = cart.filter(i => lineKey(i.p, i.v) !== key);
    save(); renderCart();
  }
  function clearCart() { cart = []; save(); renderCart(); }

  /* ---------- Templates ---------- */
  const JAR_SVG =
    '<svg viewBox="0 0 120 140" width="42%" aria-hidden="true" focusable="false">' +
    '<rect x="30" y="8" width="60" height="16" rx="5" fill="#2a1a10"/>' +
    '<path d="M24 30h72v82a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16z" fill="#fff" fill-opacity=".45"/>' +
    '<path d="M30 56h60v56a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12z" fill="#e8751a" fill-opacity=".85"/></svg>';

  function mediaInner(p, width, height) {
    const img = p.images && p.images[0];
    if (img && img.src) {
      return '<img src="' + esc(img.src) + '" alt="' + esc(img.alt || p.name) + '" loading="lazy" width="' + width + '" height="' + height + '">';
    }
    return '<span style="display:grid;place-items:center;width:100%;height:100%">' + JAR_SVG + '</span>';
  }

  function marketBtn(kind, url) {
    const label = kind === 'amazon' ? 'Amazon' : 'Flipkart';
    const cls = 'btn btn--' + kind + ' btn--sm';
    if (isUrl(url)) {
      return '<a class="' + cls + '" href="' + esc(url.trim()) + '" target="_blank" rel="noopener noreferrer">Buy on ' + label +
        '<span class="sr-only"> (opens in a new tab)</span></a>';
    }
    return '<span class="' + cls + ' is-coming" aria-disabled="true">' + label + ' · Coming soon</span>';
  }
  const marketButtons = v => marketBtn('amazon', v && v.amazonUrl) + marketBtn('flipkart', v && v.flipkartUrl);

  function priceRange(p) {
    const prices = p.variants.filter(canBuy).map(v => v.price);
    if (!prices.length) return '<span class="price price--tbd">Price coming soon</span>';
    const min = Math.min.apply(null, prices);
    return '<span class="price">' + (p.variants.length > 1 ? 'From ' : '') + money(min) + '</span>';
  }

  function cardHTML(p, i) {
    const single = p.variants.length === 1;
    const v0 = p.variants[0];
    const buyable = p.variants.some(canBuy);
    const href = 'product.html?id=' + encodeURIComponent(p.id);
    const tag = p.badge
      ? '<span class="badge">' + esc(p.badge) + '</span>'
      : (!buyable ? '<span class="badge badge--soon">Coming soon</span>' : '');
    const meta = p.variants.map(v => esc(v.label)).join(' · ');
    const actions = (single && canBuy(v0))
      ? '<button class="btn btn--primary btn--sm" type="button" data-add-to-cart data-product="' + esc(p.id) + '" data-variant="' + esc(v0.id) + '">Add to Cart</button>' +
        '<a class="btn btn--ghost btn--sm" href="' + href + '">View</a>'
      : '<a class="btn btn--dark btn--sm" style="grid-column:1/-1" href="' + href + '">View details</a>';
    return '<article class="product-card reveal" style="--d:' + (i * 0.1).toFixed(1) + 's">' +
      '<a class="product-card__media" href="' + href + '" aria-label="' + esc(p.name) + '">' +
      '<span class="product-card__tag">' + tag + '</span>' + mediaInner(p, 600, 600) + '</a>' +
      '<div class="product-card__body">' +
      '<h3 class="product-card__title"><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
      '<p class="product-card__meta">' + esc(p.tagline) + '</p>' +
      '<p class="product-card__meta">' + meta + '</p>' +
      '<div class="product-card__row">' + priceRange(p) + '</div>' +
      '<div class="product-card__actions">' + actions + '</div></div></article>';
  }

  function renderProducts() {
    $$('[data-product-grid]').forEach(grid => {
      const limit = parseInt(grid.getAttribute('data-limit'), 10) || PRODUCTS.length;
      grid.innerHTML = PRODUCTS.slice(0, limit).map(cardHTML).join('');
    });
    $$('[data-related-grid]').forEach(grid => {
      const current = new URLSearchParams(location.search).get('id') || (PRODUCTS[0] && PRODUCTS[0].id);
      const others = PRODUCTS.filter(p => p.id !== current).slice(0, 3);
      const section = grid.closest('[data-related-section]');
      if (!others.length) { if (section) section.hidden = true; return; }
      grid.innerHTML = others.map(cardHTML).join('');
    });
    observeReveals();
  }

  /* ---------- Product detail page ---------- */
  function renderPDP() {
    const root = $('[data-product-detail]');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const p = getProduct(id) || PRODUCTS[0];
    if (!p) return;

    let variantId = (p.variants.find(canBuy) || p.variants[0]).id;
    let qty = 1;
    document.title = p.name + ' | ' + SITE.name;

    const imgs = (p.images || []).filter(i => i && i.src);
    const gallery =
      '<div class="pdp__gallery"><div class="gallery__main" data-gallery-main>' + mediaInner(p, 900, 900) + '</div>' +
      (imgs.length > 1
        ? '<div class="gallery__thumbs">' + imgs.map((im, i) =>
            '<button class="gallery__thumb" type="button" data-thumb="' + i + '" aria-label="Show photo ' + (i + 1) + '" aria-current="' + (i === 0) + '">' +
            '<img src="' + esc(im.src) + '" alt="" loading="lazy" width="160" height="160"></button>').join('') + '</div>'
        : '') + '</div>';

    const soon = 'Verified details will be added here soon.';
    const acc = (title, body, open) =>
      '<details class="accordion"' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="accordion__body"><p>' + esc(body || soon) + '</p></div></details>';

    const info =
      '<div class="pdp__info">' +
      '<span class="eyebrow">' + esc(SITE.name) + '</span>' +
      '<h1 class="h-section">' + esc(p.name) + '</h1>' +
      '<p class="lead">' + esc(p.tagline) + '</p>' +
      '<span class="price pdp__price" data-pdp-price></span>' +
      '<p>' + esc(p.description) + '</p>' +
      '<div class="option-group"><span class="option-group__label" id="size-label">Pack size</span>' +
      '<div class="chips" role="group" aria-labelledby="size-label">' +
      p.variants.map(v => '<button class="chip" type="button" data-variant-chip="' + esc(v.id) + '" aria-pressed="false"' + (v.inStock === false ? ' disabled' : '') + '>' + esc(v.label) + '</button>').join('') +
      '</div></div>' +
      '<div class="option-group"><span class="option-group__label" id="qty-label">Quantity</span>' +
      '<div class="qty" role="group" aria-labelledby="qty-label">' +
      '<button class="qty__btn" type="button" data-qty="-1" aria-label="Decrease quantity">−</button>' +
      '<span class="qty__value" data-qty-value aria-live="polite">1</span>' +
      '<button class="qty__btn" type="button" data-qty="1" aria-label="Increase quantity">+</button></div></div>' +
      '<div class="pdp__buy">' +
      '<button class="btn btn--primary" type="button" data-pdp-add>Add to Cart</button>' +
      '<button class="btn btn--dark" type="button" data-pdp-buy>Buy Now</button>' +
      '<div class="market-buttons" data-pdp-market></div></div>' +
      '<p class="market-note">“Buy Now” adds this to your cart, where you can choose to complete your purchase on Amazon or Flipkart. Marketplace checkout happens on the marketplace you select, not on this website.</p>' +
      '<div class="mt-2">' +
      acc('Product details', p.info && p.info.about ? p.info.about : p.description, true) +
      acc('Ingredients', p.info && p.info.ingredients) +
      acc('Storage', p.info && p.info.storage) +
      acc('Shelf life', p.info && p.info.shelfLife) +
      '</div></div>';

    root.innerHTML = gallery + info;

    const priceEl = $('[data-pdp-price]', root);
    const marketEl = $('[data-pdp-market]', root);
    const addBtn = $('[data-pdp-add]', root);
    const buyBtn = $('[data-pdp-buy]', root);
    const qtyEl = $('[data-qty-value]', root);

    function update() {
      const v = getVariant(p, variantId);
      $$('[data-variant-chip]', root).forEach(c => c.setAttribute('aria-pressed', String(c.getAttribute('data-variant-chip') === variantId)));
      priceEl.innerHTML = canBuy(v) ? money(v.price * qty) : '<span class="price--tbd">Price coming soon</span>';
      const ok = canBuy(v);
      [addBtn, buyBtn].forEach(b => { b.disabled = !ok; });
      addBtn.textContent = ok ? 'Add to Cart' : (v && v.inStock === false ? 'Out of stock' : 'Coming soon');
      marketEl.innerHTML = marketButtons(v);
      qtyEl.textContent = qty;
    }

    root.addEventListener('click', e => {
      const chip = e.target.closest('[data-variant-chip]');
      if (chip && !chip.disabled) { variantId = chip.getAttribute('data-variant-chip'); update(); return; }
      const q = e.target.closest('[data-qty]');
      if (q) { qty = Math.max(1, Math.min(MAX_QTY, qty + parseInt(q.getAttribute('data-qty'), 10))); update(); return; }
      const thumb = e.target.closest('[data-thumb]');
      if (thumb) {
        const i = parseInt(thumb.getAttribute('data-thumb'), 10);
        const main = $('[data-gallery-main]', root);
        main.innerHTML = '<img src="' + esc(imgs[i].src) + '" alt="' + esc(imgs[i].alt || p.name) + '" width="900" height="900">';
        $$('[data-thumb]', root).forEach(t => t.setAttribute('aria-current', String(t === thumb)));
        return;
      }
      if (e.target.closest('[data-pdp-add]')) addToCart(p.id, variantId, qty);
      if (e.target.closest('[data-pdp-buy]')) addToCart(p.id, variantId, qty, { open: true });
    });
    update();
  }

  /* ---------- Cart drawer ---------- */
  function buildCartUI() {
    if ($('#cart-drawer')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="cart-overlay" data-cart-overlay></div>' +
      '<aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true" tabindex="-1" inert>' +
      '<div class="cart-drawer__head"><h2 class="cart-drawer__title" id="cart-title">Your Cart</h2>' +
      '<button class="icon-btn" type="button" data-cart-close aria-label="Close cart">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="cart-drawer__body" data-cart-body></div>' +
      '<div class="cart-drawer__foot" data-cart-foot hidden></div></aside>' +
      '<div class="toast" role="status" aria-live="polite" data-toast></div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    drawer = $('#cart-drawer'); overlay = $('[data-cart-overlay]');
    cartBody = $('[data-cart-body]'); cartFoot = $('[data-cart-foot]'); toastEl = $('[data-toast]');

    overlay.addEventListener('click', closeCart);
    $('[data-cart-close]').addEventListener('click', closeCart);

    drawer.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const item = btn.closest('[data-key]');
      const key = item && item.getAttribute('data-key');
      const action = btn.getAttribute('data-action');
      if (action === 'inc' || action === 'dec') {
        changeQty(key, action === 'inc' ? 1 : -1);
        refocus(key, action);
      } else if (action === 'remove') {
        removeLine(key);
      } else if (action === 'clear') {
        if (btn.dataset.armed === '1') clearCart();
        else {
          btn.dataset.armed = '1'; btn.textContent = 'Tap again to confirm';
          setTimeout(() => { if (btn.isConnected) { btn.dataset.armed = ''; btn.textContent = 'Clear cart'; } }, 3000);
        }
      }
    });

    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function refocus(key, action) {
    const item = $$('[data-key]', cartBody).find(el => el.getAttribute('data-key') === key);
    const btn = item && $('[data-action="' + action + '"]', item);
    if (btn) btn.focus();
  }

  function lineHTML(l) {
    const p = l.product, v = l.variant;
    const img = p.images && p.images[0];
    return '<li class="cart-item" data-key="' + esc(l.key) + '">' +
      '<div class="cart-item__img">' + (img && img.src ? '<img src="' + esc(img.src) + '" alt="" loading="lazy" width="78" height="78">' : '') + '</div>' +
      '<div><h3 class="cart-item__name">' + esc(p.name) + '</h3>' +
      '<p class="cart-item__meta">' + esc(v.label) + (canBuy(v) ? ' · ' + money(v.price) : '') + '</p>' +
      '<div class="cart-item__row">' +
      '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
      '<button class="qty__btn" type="button" data-action="dec" aria-label="Decrease quantity">−</button>' +
      '<span class="qty__value">' + l.q + '</span>' +
      '<button class="qty__btn" type="button" data-action="inc" aria-label="Increase quantity">+</button></div>' +
      '<strong>' + (canBuy(v) ? money(v.price * l.q) : '') + '</strong>' +
      '<button class="cart-item__remove" type="button" data-action="remove">Remove</button></div>' +
      '<div class="cart-market">' + marketButtons(v) + '</div></div></li>';
  }

  function renderCart(bump) {
    const count = cartCount();
    $$('[data-cart-count]').forEach(el => {
      el.textContent = count;
      el.classList.toggle('has-items', count > 0);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    if (!cartBody) return;
    const ls = lines();
    if (!ls.length) {
      cartBody.innerHTML =
        '<div class="cart-empty"><div class="cart-empty__icon" aria-hidden="true">' + '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2a1a10" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 12H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></div>' +
        '<h3 class="h-card">Your cart is empty</h3>' +
        '<p class="muted">When our ghee is ready to order, it will wait for you here.</p>' +
        '<a class="btn btn--primary" href="shop.html">Browse the shop</a></div>';
      cartFoot.hidden = true; cartFoot.innerHTML = '';
      return;
    }
    cartBody.innerHTML = '<ul class="cart-list">' + ls.map(lineHTML).join('') + '</ul>';
    const msg = 'Hello AGNIVEDA, I would like to order:\n' +
      ls.map(l => '• ' + l.product.name + ' (' + l.variant.label + ') × ' + l.q).join('\n');
    cartFoot.hidden = false;
    cartFoot.innerHTML =
      '<div class="cart-row"><span>Subtotal</span><span class="price">' + money(subtotal()) + '</span></div>' +
      '<p class="cart-note">This cart keeps your selection in one place. To buy, use the Amazon or Flipkart button on each item — checkout happens on that marketplace, and this cart is not transferred there. Marketplace prices and delivery details are shown on their own listing.</p>' +
      (waDigits() ? '<a class="btn btn--dark btn--block mt-1" href="' + esc(waLink(msg)) + '" target="_blank" rel="noopener noreferrer">Order on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a>' : '') +
      '<button class="cart-clear" type="button" data-action="clear">Clear cart</button>';
  }

  function syncLock() { document.body.classList.toggle('is-locked', navOpen || cartOpen); }

  function openCart() {
    if (!drawer) return;
    closeNav();
    lastFocus = document.activeElement;
    drawer.removeAttribute('inert'); drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open'); overlay.classList.add('is-open');
    cartOpen = true; syncLock();
    setTimeout(() => drawer.focus(), 50);
  }
  function closeCart() {
    if (!drawer || !cartOpen) return;
    drawer.classList.remove('is-open'); overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true'); drawer.setAttribute('inert', '');
    cartOpen = false; syncLock();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  /* ---------- Header & navigation ---------- */
  function initHeader() {
    const header = $('.site-header');
    if (!header) return;
    let ticking = false;
    const apply = () => { ticking = false; header.classList.toggle('is-scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
    apply();
  }

  let navToggle, navEl;
  function setNav(open) {
    navOpen = open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navEl.classList.toggle('is-open', open);
    syncLock();
  }
  function closeNav() { if (navToggle && navOpen) setNav(false); }

  function initNav() {
    navToggle = $('.nav-toggle'); navEl = $('#site-nav');
    // Auto-mark current page
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const links = $$('.nav__link');
    if (links.length && !links.some(a => a.getAttribute('aria-current'))) {
      const target = page === 'product.html' ? 'shop.html' : page;
      links.forEach(a => {
        const h = (a.getAttribute('href') || '').split('#')[0].split('?')[0].toLowerCase();
        if (h === target || (target === 'index.html' && (h === './' || h === '/'))) a.setAttribute('aria-current', 'page');
      });
    }
    if (!navToggle || !navEl) return;
    navToggle.addEventListener('click', () => setNav(!navOpen));
    navEl.addEventListener('click', e => { if (e.target.closest('a')) closeNav(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 960) closeNav(); });
  }

  /* ---------- Reveal on scroll ---------- */
  let revealIO = null;
  function observeReveals() {
    const els = $$('.reveal:not(.is-visible), .img-reveal:not(.is-visible)');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-visible')); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); revealIO.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    els.forEach(el => {
      const d = el.getAttribute('data-delay');
      if (d) el.style.setProperty('--d', d + 's');
      revealIO.observe(el);
    });
  }

  /* ---------- Parallax (desktop, motion-allowed only) ---------- */
  function initParallax() {
    const els = $$('[data-parallax]');
    if (!els.length || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    let ticking = false;
    const update = () => {
      ticking = false;
      if (!mq.matches) { els.forEach(el => el.style.removeProperty('--py')); return; }
      const vh = window.innerHeight;
      els.forEach(el => {
        const r = (el.parentElement || el).getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.12;
        el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -speed).toFixed(1) + 'px');
      });
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  }

  /* ---------- Bilona journey progress rail ---------- */
  function initJourneyRail() {
    const dots = $$('.journey-rail a');
    const steps = $$('.step[id]');
    if (!dots.length || !steps.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) dots.forEach(d => d.classList.toggle('is-active', d.getAttribute('href') === '#' + en.target.id));
      });
    }, { threshold: 0.5 });
    steps.forEach(s => io.observe(s));
  }

  /* ---------- Contact ---------- */
  function initContact() {
    const email = CONTACT.email, wa = waDigits();
    $$('[data-contact-email]').forEach(el => {
      if (email) el.setAttribute('href', 'mailto:' + email);
      else { el.removeAttribute('href'); el.setAttribute('aria-disabled', 'true'); el.classList.add('is-coming'); }
    });
    $$('[data-contact-email-text]').forEach(el => { el.textContent = email || 'Email — coming soon'; });
    $$('[data-contact-whatsapp]').forEach(el => {
      if (wa) { el.setAttribute('href', waLink('Hello AGNIVEDA, ')); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
      else { el.removeAttribute('href'); el.setAttribute('aria-disabled', 'true'); el.classList.add('is-coming'); }
    });
    $$('[data-contact-whatsapp-text]').forEach(el => { el.textContent = wa ? '+' + wa : 'WhatsApp — coming soon'; });

    const form = $('[data-contact-form]');
    if (!form) return;
    const status = $('[data-form-status]');
    const say = msg => { if (status) status.textContent = msg; };
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const d = new FormData(form);
      const text = 'Name: ' + (d.get('name') || '') + '\nEmail: ' + (d.get('email') || '') +
        (d.get('phone') ? '\nPhone: ' + d.get('phone') : '') + '\n\n' + (d.get('message') || '');
      if (email) {
        say('Opening your email app. Please press send there to deliver your message.');
        location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Message from ' + (d.get('name') || 'AGNIVEDA website')) + '&body=' + encodeURIComponent(text);
      } else if (wa) {
        say('Opening WhatsApp with your message. Please press send there to deliver it.');
        window.open(waLink(text), '_blank', 'noopener');
      } else {
        say('This form cannot send messages yet: this is a static website with no server, and our contact details are not set up. Please check back soon.');
      }
    });
  }

  /* ---------- Misc ---------- */
  function initImageFallback() {
    // If a photo fails to load, hide the broken icon and let the gradient show.
    document.addEventListener('error', e => {
      const t = e.target;
      if (t && t.tagName === 'IMG' && t.closest('.media, .product-card__media, .gallery__main, .hero__media, .cart-item__img')) {
        t.style.visibility = 'hidden';
      }
    }, true);
  }
  function setYear() { $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); }); }

  /* ---------- Init ---------- */
  function init() {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
    cart = load();
    initImageFallback();
    initHeader();
    initNav();
    buildCartUI();
    renderProducts();
    renderPDP();
    renderCart();
    observeReveals();
    initParallax();
    initJourneyRail();
    initContact();
    setYear();

    // Global delegated handlers
    document.addEventListener('click', e => {
      const open = e.target.closest('[data-cart-open]');
      if (open) { e.preventDefault(); openCart(); return; }
      const add = e.target.closest('[data-add-to-cart]');
      if (add) addToCart(add.getAttribute('data-product'), add.getAttribute('data-variant'), 1);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { if (cartOpen) closeCart(); else closeNav(); }
    });
    window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) { cart = load(); renderCart(); } });
  }

  // Small public surface (handy for debugging in the browser console)
  window.AGNIVEDA = { addToCart, openCart, closeCart, clearCart, products: PRODUCTS };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
