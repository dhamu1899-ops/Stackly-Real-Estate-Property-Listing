/* ============================================================
   Stackly — Property listing page
   Filters · Sorting · Load-more · Empty state · URL sync
   ============================================================ */
(function () {
  const grid = document.getElementById('listingGrid');
  if (!grid) return;

  const PAGE_SIZE = 6;
  const els = {
    q: document.getElementById('fQ'),
    city: document.getElementById('fCity'),
    type: document.getElementById('fType'),
    budget: document.getElementById('fBudget'),
    purpose: document.getElementById('fPurpose'),
    beds: document.getElementById('fBeds'),
    featured: document.getElementById('fFeatured'),
    verified: document.getElementById('fVerified'),
    sort: document.getElementById('sortSelect'),
    count: document.getElementById('resultCount'),
    empty: document.getElementById('emptyState'),
    emptyReset: document.getElementById('emptyReset'),
    loadWrap: document.getElementById('loadMoreWrap'),
    loadMore: document.getElementById('loadMore'),
    loadNote: document.getElementById('loadNote'),
    reset: document.getElementById('resetFilters'),
    toggle: document.getElementById('filterToggle'),
    panel: document.getElementById('filters'),
    applyMobile: document.getElementById('applyMobile')
  };

  const DEFAULTS = {
    q: '', city: 'all', type: 'all', purpose: 'all',
    beds: 0, budget: 'all', featured: false, verified: false,
    sort: 'featured'
  };
  let state = { ...DEFAULTS, shown: PAGE_SIZE };

  /* ---------- Populate dynamic selects ---------- */
  CITIES.forEach(c => els.city.add(new Option(c, c)));
  TYPES.forEach(t => els.type.add(new Option(t, t)));

  /* ---------- Read incoming URL (?city=Chennai&type=Villa…) ---------- */
  function readURL() {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) state.q = p.get('q');
    if (p.get('city') && CITIES.includes(p.get('city'))) state.city = p.get('city');
    if (p.get('type') && TYPES.includes(p.get('type'))) state.type = p.get('type');
    if (['sale', 'rent'].includes(p.get('purpose'))) state.purpose = p.get('purpose');
    if (p.get('budget')) state.budget = p.get('budget');
    if (p.get('beds')) state.beds = parseInt(p.get('beds'), 10) || 0;
    if (p.get('featured') === '1') state.featured = true;
    if (p.get('minrating') === '1') state.verified = true;
    if (p.get('sort')) state.sort = p.get('sort');
  }

  function writeURL() {
    const p = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (k === 'shown') return;
      const d = DEFAULTS[k];
      if (v !== d && v !== '' && v !== false && !(k === 'beds' && v === 0)) {
        p.set(k, v === true ? '1' : v);
      }
    });
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  /* ---------- Sync UI ← state ---------- */
  function syncUI() {
    els.q.value = state.q;
    els.city.value = state.city;
    els.type.value = state.type;
    els.budget.value = state.budget;
    els.featured.checked = state.featured;
    els.verified.checked = state.verified;
    els.sort.value = state.sort;
    setChips(els.purpose, String(state.purpose));
    setChips(els.beds, String(state.beds));
  }

  function setChips(group, value) {
    if (!group) return;
    $$('.f-chip', group).forEach(c => c.classList.toggle('is-active', c.dataset.value === value));
  }

  /* ---------- Filtering ---------- */
  function budgetOK(p, budget) {
    if (budget === 'all') return true;
    if (budget === 'rent-1') return p.purpose === 'rent' && p.price < 100000;
    if (budget === 'rent-2') return p.purpose === 'rent' && p.price >= 100000;
    const [min, max] = budget.split('-').map(Number);
    return p.price >= min && p.price <= max;
  }

  function apply() {
    const kw = state.q.trim().toLowerCase();
    return PROPERTIES.filter(p => {
      if (!StacklyAuth.isVisible(p)) return false;
      if (kw && !(p.title + ' ' + p.city + ' ' + p.district + ' ' + p.type + ' ' + p.features.join(' ')).toLowerCase().includes(kw)) return false;
      if (state.city !== 'all' && p.city !== state.city) return false;
      if (state.type !== 'all' && p.type !== state.type) return false;
      if (state.purpose !== 'all' && p.purpose !== state.purpose) return false;
      if (state.beds && p.beds < state.beds) return false;
      if (!budgetOK(p, state.budget)) return false;
      if (state.featured && !(StacklyAuth.isFeatured(p) || StacklyAuth.propStatus(p) === 'New Build')) return false;
      if (state.verified && p.rating < 4.7) return false;
      return true;
    });
  }

  function sort(list) {
    const by = state.sort;
    const out = [...list];
    switch (by) {
      case 'price-asc': out.sort((a, b) => a.price - b.price); break;
      case 'price-desc': out.sort((a, b) => b.price - a.price); break;
      case 'rating': out.sort((a, b) => b.rating - a.rating); break;
      case 'area': out.sort((a, b) => b.area - a.area); break;
      case 'new': out.sort((a, b) => b.year - a.year || b.rating - a.rating); break;
      default: out.sort((a, b) => (StacklyAuth.isFeatured(b) ? 1 : 0) - (StacklyAuth.isFeatured(a) ? 1 : 0) || b.rating - a.rating);
    }
    return out;
  }

  /* ---------- Rendering ---------- */
  function render() {
    const list = sort(apply());
    const visible = list.slice(0, state.shown);

    grid.innerHTML = visible.map((p, i) => propertyCard(p, i)).join('');
    requestAnimationFrame(() => {
      grid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
    });

    const total = PROPERTIES.filter(StacklyAuth.isVisible).length;
    const filtered = list.length;

    els.count.innerHTML = filtered === total
      ? `Showing <b>${filtered}</b> verified properties`
      : `Showing <b>${filtered}</b> of ${total} properties`;

    const none = filtered === 0;
    els.empty.hidden = !none;
    grid.hidden = none;

    const more = filtered > state.shown;
    els.loadWrap.hidden = !more;
    els.loadNote.hidden = !more;
    els.loadNote.textContent = `Showing ${state.shown} of ${filtered} results`;

    writeURL();
  }

  function update(patch) {
    Object.assign(state, patch);
    state.shown = PAGE_SIZE;
    render();
  }

  /* ---------- Events ---------- */
  let t;
  const debounced = patch => { clearTimeout(t); t = setTimeout(() => update(patch), 220); };

  els.q.addEventListener('input', () => debounced({ q: els.q.value }));
  els.city.addEventListener('change', () => update({ city: els.city.value }));
  els.type.addEventListener('change', () => update({ type: els.type.value }));
  els.budget.addEventListener('change', () => update({ budget: els.budget.value }));
  els.featured.addEventListener('change', () => update({ featured: els.featured.checked }));
  els.verified.addEventListener('change', () => update({ verified: els.verified.checked }));
  els.sort.addEventListener('change', () => update({ sort: els.sort.value }));

  els.purpose?.addEventListener('click', e => {
    const chip = e.target.closest('.f-chip');
    if (!chip) return;
    update({ purpose: chip.dataset.value });
    setChips(els.purpose, chip.dataset.value);
  });

  els.beds?.addEventListener('click', e => {
    const chip = e.target.closest('.f-chip');
    if (!chip) return;
    update({ beds: parseInt(chip.dataset.value, 10) || 0 });
    setChips(els.beds, chip.dataset.value);
  });

  const resetAll = () => {
    state = { ...DEFAULTS, shown: PAGE_SIZE };
    syncUI();
    render();
    showToast('Filters cleared — showing every property.');
  };
  els.reset.addEventListener('click', resetAll);
  els.emptyReset.addEventListener('click', resetAll);

  els.loadMore.addEventListener('click', () => {
    state.shown += PAGE_SIZE;
    render();
  });

  /* Mobile filter drawer */
  els.toggle?.addEventListener('click', () => {
    const open = els.panel.classList.toggle('is-open');
    els.toggle.setAttribute('aria-expanded', String(open));
    if (open) els.panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  els.applyMobile?.addEventListener('click', () => {
    els.panel.classList.remove('is-open');
    els.toggle?.setAttribute('aria-expanded', 'false');
    grid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- Boot ---------- */
  readURL();
  syncUI();
  render();
})();
