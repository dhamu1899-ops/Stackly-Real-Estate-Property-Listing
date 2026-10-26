/* ============================================================
   Stackly — Admin Console
   Access gate (role=admin) · KPIs · charts · property
   moderation · user management · enquiry pipeline · settings
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ============================================================
     1. Role gate — non-admins see the locked screen
     ============================================================ */
  const user = StacklyAuth.currentUser();
  const isAdmin = user && user.role === 'admin';

  if (!isAdmin) {
    $('#dash').style.display = 'none';
    $('.appfoot').style.display = 'none';
    const gate = $('#adminGate');
    gate.hidden = false;
    if (user) {
      $('#gateTitle').textContent = 'Admins only';
      $('#gateText').textContent =
        `You're signed in as ${user.name} (${user.email}) with a User account. The admin console needs an administrator login.`;
      $('#gateActions').innerHTML =
        `<a class="btn btn--primary" href="dashboard.html">Go to My Dashboard</a>
         <a class="btn btn--ghost" href="login.html?next=admin.html">Switch Account</a>`;
    }
    window.scrollTo(0, 0);
    return;
  }

  /* ============================================================
     2. Identity + panel shell
     ============================================================ */
  const STATUS_PILL = {
    new: 'pill--info', contacted: 'pill--warn', scheduled: 'pill--ok',
    closed: 'pill--muted', cancelled: 'pill--danger'
  };

  $('#whoAva').textContent = StacklyAuth.initials(user.name);
  $('#whoName').textContent = user.name;
  $('#whoEmail').textContent = user.email;
  $('#sessLine').textContent = `${user.name} · ${user.email} · since ${StacklyAuth.fmtDate(user.joined)}`;

  const PANEL_TITLES = {
    overview: ['Admin console', 'Marketplace health at a glance.'],
    properties: ['Property moderation', 'Approve, feature, archive or restore any listing.'],
    users: ['User management', 'Roles, suspensions and account activity.'],
    enquiries: ['Enquiry inbox', 'Every message and site-visit request from the site.'],
    settings: ['Site settings', 'Global switches for this demo instance.']
  };

  function openPanel(name, pushHash) {
    if (!PANEL_TITLES[name]) name = 'overview';
    $$('.dash__links [data-panel]').forEach(b => b.classList.toggle('is-active', b.dataset.panel === name));
    $$('.dash-panel').forEach(p => { p.hidden = p.dataset.panel !== name; });
    const [t, s] = PANEL_TITLES[name];
    $('#dashTitle').textContent = t;
    $('#dashSub').textContent = s;
    if (pushHash !== false) history.replaceState(null, '', '#' + name);
    $('#dash').classList.remove('is-open');
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

    if (name === 'overview') renderOverview();
    if (name === 'properties') renderProps();
    if (name === 'users') renderUsers();
    if (name === 'enquiries') renderEnq(enqFilter);
    if (name === 'settings') renderSettings();
  }

  $$('.dash__links [data-panel]').forEach(btn =>
    btn.addEventListener('click', () => openPanel(btn.dataset.panel)));
  $$('[data-panel-link]').forEach(btn =>
    btn.addEventListener('click', () => openPanel(btn.dataset.panelLink)));

  $('#dashBurger').addEventListener('click', () => $('#dash').classList.toggle('is-open'));
  $('#dashScrim').addEventListener('click', () => $('#dash').classList.remove('is-open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#dash').classList.remove('is-open'); });

  const visibleProps = () => PROPERTIES.filter(StacklyAuth.isVisible);

  /* ============================================================
     3. Overview: KPIs · city chart · pipeline · feeds
     ============================================================ */
  function renderOverview() {
    const total = PROPERTIES.length;
    const live = visibleProps().length;
    const pending = PROPERTIES.filter(p => StacklyAuth.propStatus(p) === 'Pending Review').length;
    const usersList = StacklyAuth.users();
    const banned = usersList.filter(u => u.status === 'banned').length;
    const enq = StacklyAuth.enquiries();
    const newEnq = enq.filter(e => e.status === 'new').length;
    const gmv = PROPERTIES.filter(p => p.purpose === 'sale' && StacklyAuth.isVisible(p))
      .reduce((s, p) => s + p.price, 0);

    $('#aTotal').textContent = total;
    $('#aLive').textContent = live;
    $('#aLivePct').textContent = Math.round((live / total) * 100) + '%';
    $('#aPending').textContent = pending;
    $('#aUsers').textContent = usersList.length;
    $('#aBannedNote').textContent = `${usersList.length - banned} active · ${banned} suspended`;
    $('#aEnq').textContent = newEnq;
    $('#aGmv').textContent = formatPrice(gmv);

    /* Dots */
    $('#dotProps').textContent = pending;
    $('#dotProps').style.display = pending ? '' : 'none';
    $('#dotUsers').textContent = banned;
    $('#dotUsers').style.display = banned ? '' : 'none';
    $('#dotEnq').textContent = newEnq;
    $('#dotEnq').style.display = newEnq ? '' : 'none';

    /* Listings by city (top 6 bars) */
    const byCity = {};
    visibleProps().forEach(p => { byCity[p.city] = (byCity[p.city] || 0) + 1; });
    const cities = Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(...cities.map(([, n]) => n), 1);
    $('#cityChart').innerHTML = cities.map(([city, n]) => `
      <div class="chart__col" title="${city}: ${n} listings">
        <div class="chart__bar" style="height:0" data-h="${Math.max(8, (n / max) * 100)}"><b>${n}</b></div>
        <span class="chart__label">${city}</span>
      </div>`).join('');
    requestAnimationFrame(() => {
      $$('#cityChart .chart__bar').forEach(b => { b.style.height = b.dataset.h + '%'; });
    });

    /* Enquiry pipeline meters */
    const statuses = ['new', 'contacted', 'scheduled', 'closed', 'cancelled'];
    const counts = statuses.map(s => [s, enq.filter(e => e.status === s).length]);
    const denom = Math.max(enq.length, 1);
    $('#pipeline').innerHTML = counts.map(([s, n]) => `
      <div class="meter__row">
        <div><span>${s.charAt(0).toUpperCase() + s.slice(1)}</span><span>${n} · ${Math.round((n / denom) * 100)}%</span></div>
        <div class="meter__track"><span class="meter__fill" data-w="${(n / denom) * 100}"></span></div>
      </div>`).join('');
    requestAnimationFrame(() => {
      $$('#pipeline .meter__fill').forEach(m => { m.style.width = m.dataset.w + '%'; });
    });

    /* Latest enquiries */
    $('#latestEnq').innerHTML = [...enq].sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4).map(e => `
      <div class="feed__item">
        <span class="feed__icon">
          ${e.type === 'visit'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'}
        </span>
        <div style="flex:1;min-width:0">
          <b>${e.userName}</b>
          <p>${e.propertyTitle} — ${(e.message || '').slice(0, 70)}${(e.message || '').length > 70 ? '…' : ''}</p>
          <time>${StacklyAuth.timeAgo(e.date)} · <span class="pill ${STATUS_PILL[e.status] || 'pill--muted'}" style="padding:1px 8px;font-size:.6rem">${e.status}</span></time>
        </div>
      </div>`).join('') || '<p style="font-size:.88rem">No enquiries yet.</p>';

    /* Recent signups */
    $('#latestUsers').innerHTML = [...usersList]
      .sort((a, b) => String(b.joined).localeCompare(String(a.joined)))
      .slice(0, 4).map(u => `
      <div class="feed__item">
        <span class="feed__icon" style="${u.role === 'admin' ? 'background:rgba(100,200,255,.1);color:var(--accent-2)' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>
        </span>
        <div style="flex:1;min-width:0">
          <b>${u.name}</b>
          <p>${u.email} · ${u.role === 'admin' ? 'Administrator' : 'User account'}</p>
          <time>Joined ${StacklyAuth.fmtDate(u.joined)} · <span class="pill ${u.status === 'banned' ? 'pill--danger' : 'pill--ok'}" style="padding:1px 8px;font-size:.6rem">${u.status}</span></time>
        </div>
      </div>`).join('');
  }

  /* ============================================================
     4. Property moderation
     ============================================================ */
  const STATUS_OPTIONS = ['Featured', 'New Build', 'For Sale', 'For Rent', 'Hot Offer', 'Pending Review', 'Archived'];

  function renderProps() {
    const q = ($('#propSearch').value || '').trim().toLowerCase();
    const rows = PROPERTIES.filter(p =>
      !q || p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q));

    $('#propCount').textContent =
      `${visibleProps().length} live · ${PROPERTIES.length - visibleProps().length} archived`;

    $('#propRows').innerHTML = rows.map(p => {
      const st = StacklyAuth.propStatus(p);
      const featured = StacklyAuth.isFeatured(p);
      const archived = st === 'Archived';
      return `
      <tr${archived ? ' style="opacity:.55"' : ''}>
        <td>
          <div style="display:flex;gap:11px;align-items:center;min-width:210px">
            <img src="${p.images[0]}" alt="" style="width:52px;height:38px;object-fit:cover;border-radius:7px;border:1px solid var(--line)" loading="lazy">
            <div>
              <b>${p.title}</b>
              <small>${p.district}</small>
            </div>
          </div>
        </td>
        <td>${p.city}<small>${p.type} · ${p.purpose === 'rent' ? 'Rent' : 'Sale'}</small></td>
        <td><b>${formatPrice(p.price)}${p.purpose === 'rent' ? '<small>/mo</small>' : ''}</b></td>
        <td>
          <select class="mini-select" data-status-for="${p.id}" aria-label="Status for ${p.title}">
            ${STATUS_OPTIONS.map(o => `<option value="${o}"${o === st ? ' selected' : ''}>${o}</option>`).join('')}
          </select>
        </td>
        <td>
          <button class="icon-btn${featured ? ' is-on' : ''}" type="button" data-feature="${p.id}"
            aria-pressed="${featured}" title="${featured ? 'Remove featured' : 'Mark as featured'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
          </button>
        </td>
        <td>
          <div class="row-actions">
            <a class="icon-btn" href="property-details.html?id=${encodeURIComponent(p.id)}" title="View listing" aria-label="View ${p.title}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </a>
            <button class="icon-btn${archived ? '' : ' icon-btn--danger'}" type="button"
              data-archive="${p.id}" title="${archived ? 'Restore listing' : 'Archive listing'}" aria-label="${archived ? 'Restore' : 'Archive'} ${p.title}">
              ${archived
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l1-13"/><path d="M9.5 7V4.5h5V7"/></svg>'}
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    /* Status dropdown */
    $$('#propRows [data-status-for]').forEach(sel => sel.addEventListener('change', () => {
      StacklyAuth.setPropStatus(sel.dataset.statusFor, sel.value);
      showToast(`Status updated to “${sel.value}”.`);
      renderProps(); renderOverview();
    }));

    /* Featured star */
    $$('#propRows [data-feature]').forEach(btn => btn.addEventListener('click', () => {
      const p = PROPERTIES.find(x => x.id === btn.dataset.feature);
      const next = !StacklyAuth.isFeatured(p);
      StacklyAuth.setFeatured(p.id, next);
      btn.classList.toggle('is-on', next);
      btn.setAttribute('aria-pressed', String(next));
      showToast(next ? `“${p.title}” is now featured.` : `“${p.title}” unfeatured.`);
    }));

    /* Archive / restore */
    $$('#propRows [data-archive]').forEach(btn => btn.addEventListener('click', () => {
      const p = PROPERTIES.find(x => x.id === btn.dataset.archive);
      const archived = StacklyAuth.propStatus(p) === 'Archived';
      if (archived) {
        StacklyAuth.setPropStatus(p.id, null);
        showToast(`“${p.title}” restored to the live catalogue.`);
      } else {
        StacklyAuth.setPropStatus(p.id, 'Archived');
        showToast(`“${p.title}” archived — hidden from all listings.`);
      }
      renderProps(); renderOverview();
    }));
  }

  $('#propSearch').addEventListener('input', renderProps);

  /* ============================================================
     5. User management
     ============================================================ */
  function renderUsers() {
    const list = StacklyAuth.users();
    $('#userCount').textContent = `${list.length} accounts · ${list.filter(u => u.status === 'banned').length} suspended`;

    $('#userRows').innerHTML = list.map(u => {
      const me = u.email === user.email;
      const saved = StacklyAuth.savedList(u.email).length;
      const enq = StacklyAuth.enquiries().filter(e => e.userEmail === u.email).length;
      return `
      <tr>
        <td>
          <div style="display:flex;gap:11px;align-items:center;min-width:210px">
            <span class="userchip__ava" style="width:36px;height:36px">${StacklyAuth.initials(u.name)}</span>
            <div>
              <b>${u.name}${me ? ' <small style="display:inline;color:var(--accent)">(you)</small>' : ''}</b>
              <small>${u.email}${u.phone ? ' · ' + u.phone : ''}</small>
            </div>
          </div>
        </td>
        <td>
          <select class="mini-select" data-role-for="${u.id}" ${me ? 'disabled title="You cannot change your own role"' : ''} aria-label="Role for ${u.name}">
            <option value="user"${u.role !== 'admin' ? ' selected' : ''}>User</option>
            <option value="admin"${u.role === 'admin' ? ' selected' : ''}>Admin</option>
          </select>
        </td>
        <td><span class="pill ${u.status === 'banned' ? 'pill--danger' : 'pill--ok'}">${u.status}</span></td>
        <td>${StacklyAuth.fmtDate(u.joined)}</td>
        <td>${saved} saved<small>${enq} enquiries</small></td>
        <td>
          <div class="row-actions">
            <button class="icon-btn${u.status === 'banned' ? '' : ' icon-btn--danger'}" type="button"
              data-ban="${u.id}" ${me ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}
              title="${u.status === 'banned' ? 'Lift suspension' : 'Suspend account'}"
              aria-label="${u.status === 'banned' ? 'Unban' : 'Ban'} ${u.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
            </button>
            <button class="icon-btn icon-btn--danger" type="button" data-del="${u.id}" ${me ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}
              title="Delete account" aria-label="Delete ${u.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l1-13"/><path d="M9.5 7V4.5h5V7"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    /* Role change */
    $$('#userRows [data-role-for]').forEach(sel => sel.addEventListener('change', () => {
      const list2 = StacklyAuth.users();
      const u = list2.find(x => x.id === sel.dataset.roleFor);
      if (!u) return;
      u.role = sel.value === 'admin' ? 'admin' : 'user';
      StacklyAuth.saveUsers(list2);
      showToast(`${u.name} is now ${u.role === 'admin' ? 'an Administrator' : 'a User'}.`);
      renderOverview();
    }));

    /* Ban / unban */
    $$('#userRows [data-ban]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const list2 = StacklyAuth.users();
      const u = list2.find(x => x.id === btn.dataset.ban);
      if (!u) return;
      const banned = u.status === 'banned';
      u.status = banned ? 'active' : 'banned';
      StacklyAuth.saveUsers(list2);
      showToast(banned ? `${u.name}'s suspension lifted.` : `${u.name} has been suspended.`);
      renderUsers(); renderOverview();
    }));

    /* Delete */
    $$('#userRows [data-del]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const list2 = StacklyAuth.users();
      const u = list2.find(x => x.id === btn.dataset.del);
      if (!u) return;
      if (!confirm(`Delete the account of ${u.name} (${u.email})? This cannot be undone.`)) return;
      StacklyAuth.saveUsers(list2.filter(x => x.id !== u.id));
      showToast(`${u.name}'s account deleted.`);
      renderUsers(); renderOverview();
    }));
  }

  /* ============================================================
     6. Enquiry inbox
     ============================================================ */
  let enqFilter = 'all';

  /* main.js dispatches a document-level 'tabchange'; scope it to our tabs */
  document.addEventListener('tabchange', e => {
    const tabsEl = document.getElementById('enqTabs');
    if (!tabsEl) return;
    enqFilter = e.detail.value;
    renderEnq(enqFilter);
  });

  function renderEnq(filter = 'all') {
    const all = [...StacklyAuth.enquiries()]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const rows = filter === 'all' ? all : all.filter(e => e.status === filter);

    $('#enqRows').innerHTML = rows.map(e => `
      <tr>
        <td><b>${e.userName}</b><small>${e.userEmail}${e.phone ? ' · ' + e.phone : ''}</small></td>
        <td>${e.propertyId
          ? `<a href="property-details.html?id=${encodeURIComponent(e.propertyId)}" style="color:var(--accent-2);font-weight:700">${e.propertyTitle}</a>`
          : `<b>${e.propertyTitle}</b>`}</td>
        <td><span class="pill ${e.type === 'visit' ? 'pill--warn' : 'pill--info'}">${e.type === 'visit' ? 'Site Visit' : 'Enquiry'}</span></td>
        <td>${StacklyAuth.fmtDate(e.date)}<small>${StacklyAuth.timeAgo(e.date)}</small></td>
        <td>
          <select class="mini-select" data-enq-status="${e.id}" aria-label="Status">
            ${['new', 'contacted', 'scheduled', 'closed', 'cancelled']
              .map(s => `<option value="${s}"${e.status === s ? ' selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td style="max-width:300px"><small style="color:var(--muted)">${(e.message || '—')}${e.visitDate ? ` <b style="color:var(--gold)">· visit ${StacklyAuth.fmtDate(e.visitDate)} ${e.slot || ''}</b>` : ''}</small></td>
      </tr>`).join('');

    $('#enqEmpty').hidden = rows.length > 0;
    $('#enqRows').closest('.tbl-wrap').hidden = rows.length === 0;

    $$('#enqRows [data-enq-status]').forEach(sel => sel.addEventListener('change', () => {
      StacklyAuth.setEnquiryStatus(sel.dataset.enqStatus, sel.value);
      showToast(`Enquiry marked as ${sel.value}.`);
      renderEnq(filter); renderOverview();
    }));
  }

  /* ============================================================
     7. Settings
     ============================================================ */
  function renderSettings() {
    const s = StacklyAuth.settings();
    $$('[data-setting]').forEach(input => {
      input.checked = !!s[input.dataset.setting];
      input.onchange = () => {
        StacklyAuth.setSetting(input.dataset.setting, input.checked);
        showToast(`Setting "${input.dataset.setting}" ${input.checked ? 'enabled' : 'disabled'}.`);
      };
    });

    /* Storage usage */
    try {
      let bytes = 0, keys = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        bytes += k.length + (localStorage.getItem(k) || '').length;
        keys++;
      }
      $('#storageUsed').textContent = `${(bytes / 1024).toFixed(1)} KB across ${keys} keys`;
    } catch (e) {
      $('#storageUsed').textContent = 'Unavailable in private mode';
    }
  }

  $('#resetDemo').addEventListener('click', () => {
    if (!confirm('Reset all demo data? Users, enquiries, saved homes, listing overrides and settings will be restored to their seeded state.')) return;
    ['stackly_users', 'stackly_saved', 'stackly_enquiries', 'stackly_prop_overrides', 'stackly_prop_featured', 'stackly_settings']
      .forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* noop */ } });
    showToast('Demo data restored — reloading…');
    setTimeout(() => location.reload(), 700);
  });

  /* ============================================================
     8. Init
     ============================================================ */
  const hash = (location.hash || '').replace('#', '');
  openPanel(PANEL_TITLES[hash] ? hash : 'overview', false);
})();
