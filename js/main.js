/* ============================================================
   Stackly — Shared UI engine
   Loader · Navbar · Dropdowns · Mobile overlay · Scroll FX
   Reveal · Counters · Testimonials · Tabs · Toast · Helpers
   ============================================================ */

/* ---------- Tiny helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Icon library (inline SVG, 100% offline) ---------- */
const ICONS = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>',
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1 7 7 0 0 1-7 7H10a7 7 0 0 1-7-7 1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2"/><path d="M6 20l-1 2"/><path d="M18 20l1 2"/></svg>',
  area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h7v7h-7z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16h14"/><path d="M6.5 16l1.2-4.6A2 2 0 0 1 9.6 10h4.8a2 2 0 0 1 1.9 1.4L17.5 16"/><rect x="3.5" y="16" width="17" height="4" rx="1.4"/><circle cx="7.5" cy="20" r="1.4"/><circle cx="16.5" cy="20" r="1.4"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5"/><path d="M11.5 11.5L21 21"/><path d="M17 17l2-2M14.5 14.5l2-2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5a3.5 3.5 0 0 1 0 7"/><path d="M17.5 14.5A6.5 6.5 0 0 1 21.5 20"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 16l.9 2.6L22.5 19.5l-2.6.9L19 23l-.9-2.6-2.6-.9 2.6-.9L19 16z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/></svg>'
};

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="398 82 212 290" width="36" height="36" aria-hidden="true" focusable="false"><path fill="#64ffda" d="M419.713867,256.179962 C408.001251,235.739304 410.215973,215.613876 419.889709,195.679504 C426.373138,182.319229 436.255493,171.444672 446.508270,160.904480 C457.075165,150.041229 468.783997,140.348602 478.792694,128.896606 C487.411407,119.035004 494.797852,108.464394 500.031921,96.425682 C500.738983,94.799370 501.001617,92.854477 502.785980,91.712807 C503.214905,91.838028 503.879059,91.821617 504.103485,92.127670 C514.526489,106.341171 522.003967,121.483376 518.287415,139.859406 C515.933533,151.498276 508.987885,160.308563 500.296600,167.942245 C487.788574,178.928223 473.634369,187.949692 462.046570,200.037262 C456.219025,206.116135 451.191589,212.659836 449.149933,221.054688 C445.376373,236.570572 454.272034,249.198563 470.197021,250.779221 C485.241028,252.272446 499.302216,248.880798 512.632202,241.996979 C514.021362,241.279602 515.213196,239.793518 517.062500,240.547546 C517.833252,242.063324 516.690857,242.794266 515.917847,243.562866 C502.480865,256.923462 487.519073,267.973206 468.591339,271.949402 C447.923096,276.291199 431.269562,272.383606 419.713867,256.179962 z"/><path fill="#64ffda" d="M536.351807,311.352905 C521.089722,325.623138 508.631836,341.451172 501.644409,361.304535 C500.580017,360.856842 499.799347,360.777496 499.458496,360.348633 C491.323975,350.113098 485.458466,338.909088 484.707672,325.531189 C484.034546,313.536499 489.236786,303.909576 496.947052,295.363251 C506.737030,284.511749 519.089050,276.702271 530.329102,267.573334 C539.676453,259.981689 548.930542,252.352356 553.649658,240.719803 C556.247925,234.315125 556.803040,227.722214 555.167542,221.122284 C551.964783,208.197189 539.399353,200.886032 526.174622,203.877502 C513.911682,206.651428 503.242737,212.702515 493.079834,219.823700 C492.039246,220.552856 491.267578,221.851700 489.661957,221.557190 C488.659760,220.289383 489.653076,219.345703 490.287292,218.480408 C503.850159,199.976334 521.506714,187.674316 544.321167,183.636948 C574.742554,178.253418 599.437622,199.883118 594.804749,234.346802 C592.539368,251.198425 583.628967,264.794067 572.581299,277.156372 C561.558105,289.491241 548.610413,299.803345 536.351807,311.352905 z"/></svg>`;

/* ---------- Property card template ---------- */
function purposeLabel(p) { return p.purpose === 'rent' ? 'For Rent' : 'For Sale'; }

function propertyCard(p, index = 0) {
  const badgeClass = p.status === 'New Build' ? 'badge badge--blue'
    : p.status === 'Hot Offer' ? 'badge badge--gold' : 'badge';
  const specs = [];
  if (p.beds) specs.push(`<li>${ICONS.bed}${p.beds} Bed${p.beds > 1 ? 's' : ''}</li>`);
  if (p.baths) specs.push(`<li>${ICONS.bath}${p.baths} Bath${p.baths > 1 ? 's' : ''}</li>`);
  specs.push(`<li>${ICONS.area}${p.area.toLocaleString('en-IN')} sq.ft</li>`);

  return `
  <article class="p-card p-card--save" data-reveal style="--d:${(index % 3) * 0.1}s">
    <button class="p-card__save" type="button" data-save="${encodeURIComponent(p.id)}"
      aria-label="Save ${p.title} to your favourites" aria-pressed="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </button>
    <a class="p-card__media" href="property-details.html?id=${encodeURIComponent(p.id)}" aria-label="${p.title}">
      <img src="${p.images[0]}" alt="${p.title} — ${p.type} in ${p.city}" loading="lazy" decoding="async">
      <span class="${badgeClass}">${p.status}</span>
      <span class="p-card__purpose">${purposeLabel(p)}</span>
      <span class="p-card__price">${formatPrice(p.price)}${p.purpose === 'rent' ? '<small>/mo</small>' : ''}</span>
      <span class="p-card__cta">View Details</span>
    </a>
    <div class="p-card__body">
      <div class="p-card__loc">${ICONS.pin}${p.city} · ${p.district.split(',')[0]}</div>
      <h3 class="p-card__title"><a href="property-details.html?id=${encodeURIComponent(p.id)}">${p.title}</a></h3>
      <ul class="p-card__specs">${specs.join('')}</ul>
      <div class="p-card__foot">
        <span class="p-card__type">${p.type}</span>
        <span class="rating">${ICONS.star}${p.rating.toFixed(1)}</span>
      </div>
    </div>
  </article>`;
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(message) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.id = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `${ICONS.check}<span></span>`;
    document.body.appendChild(el);
  }
  $('span', el).textContent = message;
  requestAnimationFrame(() => el.classList.add('is-show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 3800);
}

/* ============================================================
   1. Loader (PRD: 2–5s max, hides as soon as content is ready)
   ============================================================ */
(function loader() {
  const el = $('#loader');
  if (!el) return;
  const MIN = reduceMotion ? 300 : 1700;
  const started = Date.now();

  const hide = () => {
    if (el.classList.contains('is-done')) return;
    const wait = Math.max(0, MIN - (Date.now() - started));
    setTimeout(() => {
      el.classList.add('is-done');
      document.body.classList.add('is-loaded');
      setTimeout(() => el.remove(), 800);
    }, wait);
  };

  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide, { once: true });
  /* Fallback: never trap the user behind the loader */
  setTimeout(hide, 4500);
})();

/* ============================================================
   2. Navbar: sticky state, scroll progress, dropdowns
   ============================================================ */
(function navbar() {
  const nav = $('#nav');
  const bar = $('#scrollBar');
  const backTop = $('#backTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (backTop) backTop.classList.toggle('is-show', y > 520);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* Desktop dropdowns — click support (hover handled by CSS) + keyboard */
  const drops = $$('.nav__item--drop');
  drops.forEach(item => {
    const trigger = $('.nav__link', item);
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const open = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
      drops.forEach(o => { if (o !== item) { o.classList.remove('is-open'); $('.nav__link', o)?.setAttribute('aria-expanded', 'false'); } });
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Escape') { item.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
    });
  });
  document.addEventListener('click', e => {
    drops.forEach(item => { if (!item.contains(e.target)) { item.classList.remove('is-open'); $('.nav__link', item)?.setAttribute('aria-expanded', 'false'); } });
  });

  /* Active link highlight */
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link, .dropdown a, .m-item > a, .m-sub a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
    if (href && href === page && (a.classList.contains('nav__link') || a.closest('.m-item'))) {
      a.classList.add('is-active');
    }
  });
})();

/* ============================================================
   3. Mobile full-screen menu (PRD: overlay + scroll lock,
      only the menu container scrolls)
   ============================================================ */
(function mobileMenu() {
  const btn = $('#hamburger');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  const setOpen = open => {
    btn.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) $('.mobile-menu__scroll a, .mobile-menu__scroll button', menu)?.focus({ preventScroll: true });
  };

  btn.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setOpen(false)));

  /* Accordion sub-menus inside overlay */
  $$('.m-item--drop > button', menu).forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => {
      const item = b.parentElement;
      const open = item.classList.toggle('is-open');
      b.setAttribute('aria-expanded', String(open));
    });
  });

  window.addEventListener('resize', () => { if (window.innerWidth > 1024 && menu.classList.contains('is-open')) setOpen(false); });
})();

/* ============================================================
   4. Scroll reveal + stagger
   ============================================================ */
(function reveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  /* Auto-stagger siblings inside grids */
  $$('.grid, .stats__inner, .footer__grid, .feature-grid').forEach(group => {
    $$('[data-reveal]', group).forEach((el, i) => {
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i % 4) * 0.09 + 's');
    });
  });
  items.forEach(i => io.observe(i));
})();

/* ============================================================
   5. Animated counters
   ============================================================ */
(function counters() {
  const nums = $$('[data-count]');
  if (!nums.length) return;
  const run = el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = reduceMotion ? 1 : 1800;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ============================================================
   6. Generic filter tabs (used by home "Featured" grid)
   ============================================================ */
(function tabs() {
  $$('[data-tabs]').forEach(nav => {
    nav.addEventListener('click', e => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      $$('.tab', nav).forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      document.dispatchEvent(new CustomEvent('tabchange', { detail: { value: btn.dataset.filter } }));
    });
  });
})();

/* ============================================================
   7. Testimonials slider (autoplay + arrows + dots + swipe)
   ============================================================ */
(function testimonials() {
  const root = $('.tst');
  if (!root) return;
  const track = $('.tst__track', root);
  const slides = $$('.tst__slide', root);
  const dotsWrap = $('.tst__dots', root);
  if (!track || slides.length < 2) return;

  let i = 0, timer;
  slides.forEach((_, n) => {
    const d = document.createElement('button');
    d.className = 'tst__dot' + (n === 0 ? ' is-active' : '');
    d.type = 'button';
    d.setAttribute('aria-label', `Testimonial ${n + 1}`);
    d.addEventListener('click', () => go(n, true));
    dotsWrap.appendChild(d);
  });
  const dots = $$('.tst__dot', root);

  function go(n, manual) {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    if (manual) restart();
  }
  function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(i + 1), 6000); }

  $('.tst__btn--prev', root)?.addEventListener('click', () => go(i - 1, true));
  $('.tst__btn--next', root)?.addEventListener('click', () => go(i + 1, true));
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);

  /* Touch swipe */
  let x0 = null;
  root.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 55) go(i + (dx < 0 ? 1 : -1), true);
    x0 = null;
  }, { passive: true });

  restart();
})();

/* ============================================================
   8. Newsletter + shared form niceties
   ============================================================ */
$$('.newsletter').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input[type="email"]', form);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((input?.value || '').trim());
    if (!ok) {
      input?.focus();
      input && (input.style.borderColor = '#ff6b81');
      showToast('Please enter a valid email address.');
      setTimeout(() => { if (input) input.style.borderColor = ''; }, 2200);
      return;
    }
    showToast('Subscribed! New listings will reach your inbox.');
    form.reset();
  });
});

/* Year */
$$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ============================================================
   9. Hero quick search (index) → results page
   ============================================================ */
(function heroSearch() {
  const form = $('#heroSearch');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const qs = Object.entries(data)
      .filter(([, v]) => v && String(v).trim() !== '' && v !== 'all')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    window.location.href = 'properties.html' + (qs ? '?' + qs : '');
  });
  /* Popular chips fill the search */
  $$('[data-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      const [k, v] = chip.dataset.chip.split(':');
      const sel = form.querySelector(`[name="${k}"]`);
      if (sel) { sel.value = v; sel.dispatchEvent(new Event('change')); }
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });
})();

/* ============================================================
   10. Gentle page transitions (progressive enhancement)
   ============================================================ */
(function pageTransition() {
  if (reduceMotion) return;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || /^(mailto:|tel:|http)/i.test(href)) return;
    const [path] = href.split('?');
    if (!path.endsWith('.html')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (path === location.pathname.split('/').pop() && href.includes('#')) return;
    e.preventDefault();
    document.body.style.transition = 'opacity .28s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 260);
  });
  window.addEventListener('pageshow', () => { document.body.style.opacity = '1'; });
})();
