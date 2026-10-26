/* ============================================================
   Stackly — About page
   Advisor team grid + reveal sync
   ============================================================ */
(function () {
  'use strict';
  const grid = document.getElementById('aboutTeam');
  if (!grid || typeof AGENTS === 'undefined') return;

  grid.innerHTML = AGENTS.map((a, i) => `
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
    grid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
  });
})();
