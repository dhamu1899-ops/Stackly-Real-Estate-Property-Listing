/* ============================================================
   Stackly — Homepage blocks
   Featured grid (tabbed) + Advisor cards
   ============================================================ */
(function () {
  const grid = document.getElementById('featuredGrid');
  const agentGrid = document.getElementById('agentGrid');

  /* ---------- Featured properties with filter tabs ---------- */
  function renderFeatured(filter = 'all') {
    if (!grid) return;
    let list = PROPERTIES.filter(p => StacklyAuth.isVisible(p) && StacklyAuth.isFeatured(p));

    if (filter === 'sale') list = list.filter(p => p.purpose === 'sale');
    else if (filter === 'rent') list = list.filter(p => p.purpose === 'rent');
    else if (filter === 'new') list = list.filter(p => StacklyAuth.propStatus(p) === 'New Build');

    /* Fall back to a broad set so a tab is never empty */
    if (list.length < 3) {
      const extra = PROPERTIES.filter(p => StacklyAuth.isVisible(p) && !list.includes(p)).slice(0, 3 - list.length);
      list = list.concat(extra);
    }
    list = list.slice(0, 6);

    grid.style.opacity = '0';
    grid.style.transform = 'translateY(14px)';
    setTimeout(() => {
      grid.innerHTML = list.map((p, i) => propertyCard(p, i)).join('');
      /* Re-trigger reveal for freshly injected cards */
      requestAnimationFrame(() => {
        grid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
        grid.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)';
        grid.style.opacity = '1';
        grid.style.transform = 'none';
      });
    }, reduceMotion ? 0 : 240);
  }

  renderFeatured();
  document.addEventListener('tabchange', e => renderFeatured(e.detail.value));

  /* ---------- Advisors ---------- */
  if (agentGrid) {
    agentGrid.innerHTML = AGENTS.map((a, i) => `
      <article class="agent-card" data-reveal style="--d:${(i % 4) * 0.1}s">
        <div class="agent-card__img">
          <img src="${a.photo}" alt="${a.name}, ${a.role}" loading="lazy" decoding="async">
          <div class="agent-card__tags">${a.tags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>
        <h3>${a.name}</h3>
        <p class="agent-card__role">${a.role}</p>
        <div class="agent-card__meta">
          <span><b>${a.deals}</b> deals</span>
          <span><b>★ ${a.rating}</b> rating</span>
        </div>
        <div class="agent-card__actions">
          <a href="tel:${a.phone.replace(/\s/g, '')}">Call</a>
          <a href="mailto:${a.email}">Email</a>
        </div>
      </article>`).join('');

    requestAnimationFrame(() => {
      agentGrid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
    });
  }
})();
