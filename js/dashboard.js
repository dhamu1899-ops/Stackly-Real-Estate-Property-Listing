/* ============================================================
   Stackly — User Dashboard
   Guard · panels · KPIs · saved homes · enquiries · visits
   alerts · profile editing (role-aware, localStorage-backed)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Auth guard: send guests to login ---------- */
  const user = StacklyAuth.requireAuth('dashboard.html');
  if (!user) return;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const STATUS_PILL = {
    new: 'pill--info',
    contacted: 'pill--warn',
    scheduled: 'pill--ok',
    closed: 'pill--muted',
    cancelled: 'pill--danger'
  };
  const TYPE_LABEL = { enquiry: 'Enquiry', visit: 'Site Visit' };

  const myEnquiries = () => StacklyAuth.enquiries().filter(e => e.userEmail === user.email);

  /* ============================================================
     Identity block + header
     ============================================================ */
  function paintIdentity() {
    $('#whoAva').textContent = StacklyAuth.initials(user.name);
    $('#whoName').textContent = user.name;
    $('#whoEmail').textContent = user.email;
    $('#whoRole').textContent = user.role;
    $('#memberLine').textContent = 'Member since ' + StacklyAuth.fmtDate(user.joined);
    $('#pfJoined').textContent = StacklyAuth.fmtDate(user.joined);
    $('#pfRolePill').textContent = user.role;

    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    $('#dashTitle').textContent = `${greet}, ${user.name.split(' ')[0]}`;
  }

  /* ============================================================
     Panel switching (sidebar + drawer)
     ============================================================ */
  const PANEL_TITLES = {
    overview: ['Your dashboard', "Here's what's happening with your property search."],
    saved: ['Saved homes', 'Your shortlist — hearts here sync with every listing page.'],
    enquiries: ['My enquiries', 'Messages and requests sent to Stackly advisors.'],
    visits: ['Site visits', 'Scheduled walkthroughs and their current status.'],
    alerts: ['Search alerts', 'Choose exactly what we notify you about.'],
    profile: ['My profile', 'Keep your details fresh for faster advisor callbacks.']
  };

  function openPanel(name, pushHash) {
    if (!PANEL_TITLES[name]) name = 'overview';
    $$('.dash__links [data-panel]').forEach(b => b.classList.toggle('is-active', b.dataset.panel === name));
    $$('.dash-panel').forEach(p => { p.hidden = p.dataset.panel !== name; });
    const [t, s] = PANEL_TITLES[name];
    $('#dashTitle').textContent = name === 'overview'
      ? ($('#dashTitle').dataset.base || t)
      : t;
    $('#dashSub').textContent = s;
    if (pushHash !== false) history.replaceState(null, '', '#' + name);
    $('#dash').classList.remove('is-open');
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (name === 'saved') renderSaved();
    if (name === 'enquiries') renderEnquiries();
    if (name === 'visits') renderVisits();
    if (name === 'alerts') renderAlerts();
    if (name === 'profile') fillProfile();
  }

  $$('.dash__links [data-panel]').forEach(btn =>
    btn.addEventListener('click', () => openPanel(btn.dataset.panel)));
  $$('[data-panel-link]').forEach(btn =>
    btn.addEventListener('click', () => openPanel(btn.dataset.panelLink)));

  /* Drawer (mobile) */
  $('#dashBurger').addEventListener('click', () => $('#dash').classList.toggle('is-open'));
  $('#dashScrim').addEventListener('click', () => $('#dash').classList.remove('is-open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#dash').classList.remove('is-open'); });

  /* ============================================================
     Overview: KPIs · activity · recommended
     ============================================================ */
  function renderOverview() {
    const list = myEnquiries();
    const saved = StacklyAuth.savedList(user.email);
    const visits = list.filter(e => e.type === 'visit');
    const enqs = list.filter(e => e.type === 'enquiry');
    const waiting = list.filter(e => e.status === 'new').length;
    const prefs = user.prefs || {};
    const alerts = prefs.alerts || {};
    const alertCount = Object.values(alerts).filter(Boolean).length ||
      (prefs.search ? 1 : 0);

    $('#kSaved').textContent = saved.length;
    $('#kSavedTrend').textContent = saved.length ? `${saved.length} shortlisted` : 'none yet';
    $('#kEnq').textContent = enqs.length;
    $('#kEnqTrend').textContent = waiting ? `${waiting} awaiting reply` : 'all replied';
    $('#kVisits').textContent = visits.length;
    $('#kAlerts').textContent = alertCount;

    /* Dots */
    const dSaved = $('#dotSaved'), dEnq = $('#dotEnq');
    dSaved.textContent = saved.length;
    dEnq.textContent = waiting;
    dSaved.style.display = saved.length ? '' : 'none';
    dEnq.style.display = waiting ? '' : 'none';

    /* Activity feed */
    const feed = $('#activityFeed');
    const recent = [...list].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    feed.innerHTML = recent.length ? recent.map(e => `
      <div class="feed__item">
        <span class="feed__icon">
          ${e.type === 'visit'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'}
        </span>
        <div style="flex:1;min-width:0">
          <b>${e.propertyTitle}</b>
          <p>${(e.message || '').slice(0, 90) || TYPE_LABEL[e.type] + ' sent'}${(e.message || '').length > 90 ? '…' : ''}</p>
          <time>${StacklyAuth.timeAgo(e.date)} · <span class="pill ${STATUS_PILL[e.status] || 'pill--muted'}" style="padding:1px 8px;font-size:.6rem">${e.status}</span></time>
        </div>
      </div>`).join('')
      : '<p style="font-size:.88rem">No activity yet — send your first enquiry from any property page.</p>';

    /* Profile completeness */
    let filled = 2; // name + email always present
    const total = 6;
    if (user.phone) filled++;
    if (user.city) filled++;
    if (user.budget) filled++;
    if (user.bio) filled++;
    const pct = Math.round((filled / total) * 100);
    $('#profilePct').textContent = pct + '%';
    requestAnimationFrame(() => { $('#profileMeter').style.width = pct + '%'; });

    /* Recommended: featured, not already saved, 3 up */
    const recs = PROPERTIES
      .filter(p => p.featured && StacklyAuth.isVisible(p) && !saved.includes(p.id))
      .slice(0, 3);
    const pool = recs.length ? recs
      : PROPERTIES.filter(p => StacklyAuth.isVisible(p) && !saved.includes(p.id)).slice(0, 3);
    $('#recGrid').innerHTML = pool.length
      ? pool.map((p, i) => propertyCard(p, i)).join('')
      : '<p style="grid-column:1/-1">Every listing is on your shortlist already — impressive!</p>';
  }

  /* ============================================================
     Saved homes
     ============================================================ */
  function renderSaved() {
    const ids = StacklyAuth.savedList(user.email);
    const props = ids.map(getProperty).filter(p => p && StacklyAuth.isVisible(p));
    $('#savedCount').textContent = props.length + (props.length === 1 ? ' home' : ' homes') + ' on your shortlist';
    $('#savedGrid').innerHTML = props.map((p, i) => propertyCard(p, i)).join('');
    $('#savedEmpty').hidden = props.length > 0;
    $('#savedGrid').hidden = props.length === 0;
    $('#savedCount').style.display = props.length ? '' : 'none';
  }

  /* ============================================================
     Enquiries table
     ============================================================ */
  function renderEnquiries() {
    const rows = [...myEnquiries()].sort((a, b) => new Date(b.date) - new Date(a.date));
    $('#enqRows').innerHTML = rows.map(e => `
      <tr>
        <td>${e.propertyId
          ? `<a href="property-details.html?id=${encodeURIComponent(e.propertyId)}" style="color:var(--accent-2);font-weight:700">${e.propertyTitle}</a>`
          : `<b>${e.propertyTitle}</b>`}</td>
        <td><span class="pill ${e.type === 'visit' ? 'pill--warn' : 'pill--info'}">${TYPE_LABEL[e.type]}</span></td>
        <td>${StacklyAuth.fmtDate(e.date)}<small>${new Date(e.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small></td>
        <td><span class="pill ${STATUS_PILL[e.status] || 'pill--muted'}">${e.status}</span></td>
        <td style="max-width:280px"><small style="color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">${(e.message || '—').slice(0, 70)}</small></td>
      </tr>`).join('');
    $('#enqEmpty').hidden = rows.length > 0;
    $('#enqWrap').hidden = rows.length === 0;
  }

  /* ============================================================
     Site visits
     ============================================================ */
  function renderVisits() {
    const visits = myEnquiries()
      .filter(e => e.type === 'visit')
      .sort((a, b) => (a.visitDate || '').localeCompare(b.visitDate || ''));
    const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    $('#visitList').innerHTML = visits.map(e => {
      const d = e.visitDate ? new Date(e.visitDate) : null;
      const day = d && !isNaN(d) ? d.getDate() : '--';
      const mon = d && !isNaN(d) ? MON[d.getMonth()] : 'TBD';
      const cancellable = ['new', 'scheduled', 'contacted'].includes(e.status);
      return `
      <div class="visit-card">
        <div class="visit-card__date"><b>${day}</b><span>${mon}</span></div>
        <div>
          <b>${e.propertyTitle}</b>
          <p>${e.slot ? 'Slot: ' + e.slot + ' · ' : ''}${e.phone ? 'Call ' + e.phone : 'Advisor will confirm by email'}${e.visitDate ? ' · ' + StacklyAuth.fmtDate(e.visitDate) : ''}</p>
        </div>
        <div class="row-actions">
          <span class="pill ${STATUS_PILL[e.status] || 'pill--muted'}">${e.status}</span>
          ${cancellable
            ? `<button class="icon-btn icon-btn--danger" type="button" data-cancel="${e.id}" aria-label="Cancel visit" title="Cancel visit">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
               </button>`
            : ''}
        </div>
      </div>`;
    }).join('');
    $('#visitEmpty').hidden = visits.length > 0;

    $$('[data-cancel]', $('#visitList')).forEach(btn => btn.addEventListener('click', () => {
      StacklyAuth.cancelVisit(btn.dataset.cancel);
      showToast('Site visit cancelled — your advisor has been notified.');
      renderVisits(); renderOverview();
    }));
  }

  /* ============================================================
     Alerts
     ============================================================ */
  function renderAlerts() {
    const prefs = user.prefs || {};
    const alerts = Object.assign(
      { newListings: true, priceDrops: true, digest: false, whatsapp: false },
      prefs.alerts || {}
    );
    $$('[data-alert]').forEach(input => {
      input.checked = !!alerts[input.dataset.alert];
      input.onchange = () => {
        const next = { ...alerts, [input.dataset.alert]: input.checked };
        StacklyAuth.updateProfile({ prefs: { ...prefs, alerts: next } });
        showToast(`Alert "${input.dataset.alert}" ${input.checked ? 'enabled' : 'disabled'}.`);
        renderOverview();
      };
    });
    if (prefs.search) {
      $('#saCity').value = prefs.search.city || '';
      $('#saBudget').value = prefs.search.budget || '';
    }
  }

  $('#searchAlertForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const prefs = user.prefs || {};
    StacklyAuth.updateProfile({ prefs: { ...prefs, search: data } });
    showToast(data.city || data.budget
      ? `Search alert saved — we'll notify you about new matches.`
      : 'Search alert cleared.');
  });

  /* ============================================================
     Profile
     ============================================================ */
  function fillProfile() {
    $('#pfName').value = user.name || '';
    $('#pfEmail').value = user.email || '';
    $('#pfPhone').value = user.phone || '';
    $('#pfCity').value = user.city || '';
    $('#pfBudget').value = user.budget || '';
    $('#pfBio').value = user.bio || '';
  }

  (function fillCitySelects() {
    const opts = (typeof CITIES !== 'undefined' ? CITIES : ['Chennai', 'Bengaluru', 'Coimbatore'])
      .map(c => `<option value="${c}">${c}</option>`).join('');
    ['#pfCity', '#saCity'].forEach(sel => { const el = $(sel); if (el) el.insertAdjacentHTML('beforeend', opts); });
  })();

  const profileForm = $('#profileForm');
  const validators = {
    name: v => v.trim().length >= 2,
    phone: v => v.trim() === '' || /^[6-9]\d{9}$/.test(v.replace(/[\s\-+()]/g, '').replace(/^91/, ''))
  };
  function checkProfile(input) {
    const validate = validators[input.name];
    if (!validate) return true;
    const valid = validate(input.value);
    input.closest('.field')?.classList.toggle('has-error', !valid);
    return valid;
  }
  $$('#profileForm input').forEach(input => {
    input.addEventListener('blur', () => checkProfile(input));
    input.addEventListener('input', () => { if (input.closest('.field')?.classList.contains('has-error')) checkProfile(input); });
  });

  profileForm.addEventListener('submit', e => {
    e.preventDefault();
    const ok = $$('#profileForm input').map(checkProfile).every(Boolean);
    if (!ok) { $('#profileForm .field.has-error input')?.focus(); showToast('Please correct the highlighted fields.'); return; }
    const updated = StacklyAuth.updateProfile({
      name: $('#pfName').value.trim(),
      phone: $('#pfPhone').value.trim(),
      city: $('#pfCity').value,
      budget: $('#pfBudget').value,
      bio: $('#pfBio').value.trim()
    });
    if (updated) Object.assign(user, updated);
    paintIdentity();
    renderOverview();
    showToast('Profile updated successfully.');
  });

  $('#changePw').addEventListener('click', () =>
    showToast('Demo mode — password changes are disabled.'));

  /* ============================================================
     Live re-render when hearts toggle anywhere
     ============================================================ */
  document.addEventListener('savedchange', () => { renderOverview(); renderSaved(); });

  /* ============================================================
     Init
     ============================================================ */
  paintIdentity();
  $('#dashTitle').dataset.base = $('#dashTitle').textContent;
  renderOverview();

  const hash = (location.hash || '').replace('#', '');
  openPanel(PANEL_TITLES[hash] ? hash : 'overview', false);
})();
