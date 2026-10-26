/* ============================================================
   Stackly — Auth & Account layer (demo, localStorage-backed)
   Roles: user | admin
   • Seeds demo accounts, enquiries, saved homes
   • Navbar / mobile-menu account UI (chip + dropdown)
   • Save-to-favourites hearts on property cards
   • Enquiry & site-visit tracking → user + admin dashboards
   ============================================================ */

const StacklyAuth = (function () {
  'use strict';

  /* ---------- Storage keys ---------- */
  const K = {
    users: 'stackly_users',
    sess: 'stackly_session',
    saved: 'stackly_saved',
    enq: 'stackly_enquiries',
    ovr: 'stackly_prop_overrides',
    set: 'stackly_settings'
  };

  /* ---------- Tiny storage helpers (fail-safe in private mode) ---------- */
  const read = (k, fb) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
    catch (e) { return fb; }
  };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* quota/private mode */ } };

  const b64 = s => { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return s; } };

  /* ---------- Demo dataset ---------- */
  const SEED_USERS = [
    { id: 'u1', name: 'Vikram Rao', email: 'admin@stackly.com', phone: '+91 98400 11111', pass: 'admin123', role: 'admin', status: 'active', joined: '2011-04-02', city: 'Salem', bio: 'Founder & Super Admin — 18 years in Tamil Nadu real estate.' },
    { id: 'u2', name: 'Rahul Verma', email: 'user@stackly.com', phone: '+91 99000 22222', pass: 'user123', role: 'user', status: 'active', joined: '2023-06-18', city: 'Bengaluru', bio: 'First-time home buyer looking for a villa in Coimbatore.' },
    { id: 'u3', name: 'Meera Krishnan', email: 'meera.k@gmail.com', phone: '+91 98401 55321', pass: 'demo1234', role: 'user', status: 'active', joined: '2024-01-22', city: 'Chennai', bio: 'Property investor focused on rental yield.' },
    { id: 'u4', name: 'Samuel Joseph', email: 'samuel.joseph@outlook.com', phone: '+971 50 123 4567', pass: 'demo1234', role: 'user', status: 'active', joined: '2024-09-05', city: 'Dubai', bio: 'NRI buyer — prefers video walkthroughs.' },
    { id: 'u5', name: 'Divya Nair', email: 'divya.nair@yahoo.com', phone: '+91 99440 78901', pass: 'demo1234', role: 'user', status: 'active', joined: '2025-02-14', city: 'Coimbatore', bio: 'Looking for a furnished 2BHK on rent.' },
    { id: 'u6', name: 'Karthik Subramanian', email: 'karthik.s@gmail.com', phone: '+91 90031 44556', pass: 'demo1234', role: 'user', status: 'banned', joined: '2025-07-30', city: 'Chennai', bio: '' }
  ];

  const SEED_ENQ = [
    { id: 'e1', userEmail: 'user@stackly.com', userName: 'Rahul Verma', propertyId: 'azure-sky-penthouse', propertyTitle: 'Azure Sky Penthouse', type: 'enquiry', phone: '+91 99000 22222', message: 'Is the penthouse still available? We are interested in the terrace pool layout.', date: '2026-10-18T10:24:00', status: 'contacted' },
    { id: 'e2', userEmail: 'user@stackly.com', userName: 'Rahul Verma', propertyId: 'meridian-garden-villa', propertyTitle: 'Meridian Garden Villa', type: 'visit', visitDate: '2026-10-26', slot: '11:00 AM', phone: '+91 99000 22222', message: 'Saturday morning site visit preferred.', date: '2026-10-20T16:02:00', status: 'scheduled' },
    { id: 'e3', userEmail: 'meera.k@gmail.com', userName: 'Meera Krishnan', propertyId: 'harbour-view-residence', propertyTitle: 'Harbour View Residence', type: 'enquiry', phone: '+91 98401 55321', message: 'What is the expected rental yield for this unit?', date: '2026-10-21T09:15:00', status: 'new' },
    { id: 'e4', userEmail: 'divya.nair@yahoo.com', userName: 'Divya Nair', propertyId: null, propertyTitle: 'Contact form — Rental requirements', type: 'enquiry', phone: '+91 99440 78901', message: 'Need a furnished 2BHK near Race Course Road, Coimbatore. Budget ₹35,000/month.', date: '2026-10-22T18:40:00', status: 'new' },
    { id: 'e5', userEmail: 'samuel.joseph@outlook.com', userName: 'Samuel Joseph', propertyId: 'azure-sky-penthouse', propertyTitle: 'Azure Sky Penthouse', type: 'visit', visitDate: '2026-11-02', slot: '03:00 PM', phone: '+971 50 123 4567', message: 'Visiting Chennai first week of November — please arrange a video tour too.', date: '2026-10-23T12:10:00', status: 'new' },
    { id: 'e6', userEmail: 'guest', userName: 'Walk-in Guest', propertyId: null, propertyTitle: 'Contact form — Investment advice', type: 'enquiry', phone: '', message: 'Suggest commercial properties under ₹2 Cr in Chennai.', date: '2026-10-15T11:05:00', status: 'closed' }
  ];

  /* ---------- Seed / migrate demo data ----------
     A version key lets us refresh demo accounts in-place when the data
     shape or password encoding changes between builds. Each demo account
     is repaired if its stored hash no longer matches the known-good one
     (the usual cause of "Incorrect password" on the demo login after a
     rebuild), while any account the visitor created is left untouched. */
  const SEED_VERSION = 3; // bump when SEED_USERS / password encoding changes

  function seedDemo(force) {
    const list = users();
    let changed = force;
    SEED_USERS.forEach(su => {
      const i = list.findIndex(x => normEmail(x.email) === normEmail(su.email));
      const good = b64(su.pass);
      if (i < 0) { list.push({ ...su, pass: good }); changed = true; return; }
      const keep = list[i];
      /* repair hash / role / status drift, but preserve profile fields
         the visitor may have edited (name, phone, bio, city, joined) */
      if (keep.pass !== good || keep.role !== su.role || keep.status !== su.status) {
        list[i] = { ...keep, pass: good, role: su.role, status: su.status };
        changed = true;
      }
    });
    if (changed) saveUsers(list);

    /* demo saved homes / pending-review flag (only if absent) */
    const saved = savedMap();
    if (!saved['user@stackly.com'] || !saved['user@stackly.com'].length) {
      saved['user@stackly.com'] = ['azure-sky-penthouse', 'meridian-garden-villa', 'harbour-view-residence'];
      write(K.saved, saved); changed = true;
    }
    const ovr = overrides();
    if (ovr['meridian-garden-villa'] === undefined) {
      ovr['meridian-garden-villa'] = 'Pending Review';
      write(K.ovr, ovr); changed = true;
    }

    /* demo enquiries — only when absent, so real submissions survive */
    const enq = enquiries();
    if (!enq.length) { saveEnq(SEED_ENQ.slice()); changed = true; }

    if (changed) write(K.set, read(K.set, null) || { maintenance: false, registration: true, autoApprove: false });
  }

  (function seed() {
    if (!read(K.sess, null)) write(K.sess, null);
  })();

  /* ---------- Users ---------- */
  const users = () => read(K.users, []);
  const saveUsers = list => write(K.users, list);
  const normEmail = e => String(e || '').trim().toLowerCase();

  function findUser(email) {
    const e = normEmail(email);
    return users().find(u => normEmail(u.email) === e) || null;
  }

  function currentUser() {
    const sess = read(K.sess, null);
    if (!sess || !sess.email) return null;
    const u = findUser(sess.email);
    if (!u || u.status === 'banned') { write(K.sess, null); return null; }  // banned → auto sign-out
    return u;
  }

  function login(email, pass) {
    const u = findUser(email);
    if (!u) return { ok: false, error: 'No account found with that email address.' };
    if (u.pass !== b64(pass)) {
      /* Built-in demo logins are public — echo the password so a typo is easy to spot. */
      const demo = SEED_USERS.find(s => normEmail(s.email) === normEmail(u.email));
      return { ok: false, error: demo
        ? 'Incorrect password. The demo password for ' + demo.email + ' is “' + demo.pass + '”.'
        : 'Incorrect password. Please try again.' };
    }
    if (u.status === 'banned') return { ok: false, error: 'This account has been suspended. Contact support@stackly.com' };
    write(K.sess, { email: u.email, at: Date.now() });
    return { ok: true, user: u };
  }

  function register({ name, email, phone, pass, role }) {
    const e = normEmail(email);
    if (findUser(e)) return { ok: false, error: 'An account with this email already exists.' };
    const settings = read(K.set, {});
    if (settings.registration === false) return { ok: false, error: 'New registrations are temporarily closed.' };
    const u = {
      id: 'u' + Date.now(),
      name: String(name).trim(),
      email: e,
      phone: String(phone || '').trim(),
      pass: b64(pass),
      role: role === 'admin' ? 'admin' : 'user',
      status: 'active',
      joined: new Date().toISOString().slice(0, 10),
      city: '',
      bio: ''
    };
    const list = users(); list.push(u); saveUsers(list);
    write(K.sess, { email: u.email, at: Date.now() });
    return { ok: true, user: u };
  }

  function logout() {
    write(K.sess, null);
    try { sessionStorage.clear(); } catch (e) { /* noop */ }
  }

  function updateProfile(patch) {
    const u = currentUser(); if (!u) return null;
    const list = users();
    const i = list.findIndex(x => x.id === u.id);
    if (i < 0) return null;
    list[i] = { ...list[i], ...patch, email: u.email, role: u.role, id: u.id }; // immutable fields protected
    saveUsers(list);
    return list[i];
  }

  /* ---------- Saved homes ---------- */
  const savedMap = () => read(K.saved, {});
  function savedList(email) { return savedMap()[normEmail(email)] || []; }
  function isSaved(email, pid) { return savedList(email).includes(pid); }
  function toggleSave(email, pid) {
    const map = savedMap(); const e = normEmail(email);
    const list = map[e] || [];
    const on = list.includes(pid);
    map[e] = on ? list.filter(x => x !== pid) : [pid, ...list];
    write(K.saved, map);
    return !on; // true = now saved
  }

  /* ---------- Enquiries / site visits ---------- */
  const enquiries = () => read(K.enq, []);
  const saveEnq = list => write(K.enq, list);
  function trackEnquiry(data) {
    const u = currentUser();
    const list = enquiries();
    list.unshift({
      id: 'e' + Date.now() + Math.floor(Math.random() * 90 + 10),
      userEmail: u ? u.email : normEmail(data.email) || 'guest',
      userName: u ? u.name : (data.name || 'Guest'),
      propertyId: data.propertyId || null,
      propertyTitle: data.propertyTitle || 'General enquiry',
      type: data.type === 'visit' ? 'visit' : 'enquiry',
      phone: data.phone || '',
      message: String(data.message || '').slice(0, 400),
      visitDate: data.visitDate || null,
      slot: data.slot || null,
      date: new Date().toISOString(),
      status: 'new'
    });
    saveEnq(list);
  }
  function setEnquiryStatus(id, status) {
    const list = enquiries();
    const i = list.findIndex(e => e.id === id);
    if (i >= 0) { list[i].status = status; saveEnq(list); }
  }
  function cancelVisit(id) { setEnquiryStatus(id, 'cancelled'); }

  /* ---------- Property overrides (admin moderation) ---------- */
  const overrides = () => read(K.ovr, {});
  function propStatus(p) { return overrides()[p.id] || p.status; }
  function setPropStatus(id, status) { const o = overrides(); o[id] = status; write(K.ovr, o); }
  const isVisible = p => propStatus(p) !== 'Archived';

  /* Featured flag (admin star toggle) */
  const featuredMap = () => read('stackly_prop_featured', {});
  const isFeatured = p => {
    const v = featuredMap()[p.id];
    return typeof v === 'boolean' ? v : !!p.featured;
  };
  function setFeatured(id, val) { const m = featuredMap(); m[id] = val; write('stackly_prop_featured', m); }

  /* ---------- Run seed now that every helper above exists ----------
     (Calling it earlier throws: const-declared helpers aren't hoisted.) */
  (function runSeed() {
    const ver = read('stackly_seed_version', 0);
    seedDemo(ver !== SEED_VERSION);
    write('stackly_seed_version', SEED_VERSION);
  })();

  /* ---------- Settings ---------- */
  const settings = () => read(K.set, {});
  function setSetting(key, val) { const s = settings(); s[key] = val; write(K.set, s); }

  /* ---------- Misc helpers ---------- */
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }
  /* Safe redirect target: relative .html page only */
  function safeNext(raw, fallback) {
    const v = String(raw || '');
    return /^[a-z0-9][a-z0-9\-]*\.html([?#].*)?$/i.test(v) ? v : fallback;
  }

  /* ---------- Page guards ---------- */
  function requireAuth(next) {
    const u = currentUser();
    if (!u) {
      location.href = 'login.html?next=' + encodeURIComponent(next || (location.pathname.split('/').pop() || 'dashboard.html'));
      return null;
    }
    return u;
  }

  /* ---------- Global enquiry hook (used by contact & property pages) ---------- */
  window.trackStacklyEnquiry = trackEnquiry;

  /* ============================================================
     Navbar / mobile-menu account UI
     ============================================================ */
  const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  const ICON_DASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="9" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5"/><rect x="13.5" y="12" width="7.5" height="9" rx="1.5"/><rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5"/></svg>';
  const ICON_OUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
  const ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function chipHTML(u) {
    return `
    <div class="userchip" id="userchip">
      <button class="userchip__btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">
        <span class="userchip__ava">${initials(u.name)}</span>
        <span class="userchip__name">${u.name.split(' ')[0]}</span>${CHEV}
      </button>
      <div class="usermenu" role="menu">
        <div class="usermenu__head">
          <span class="userchip__ava userchip__ava--lg">${initials(u.name)}</span>
          <div><b>${u.name}</b><span>${u.email}</span></div>
          <span class="roletag ${u.role === 'admin' ? 'roletag--admin' : ''}">${u.role}</span>
        </div>
        <a href="dashboard.html" role="menuitem">${ICON_DASH} My Dashboard</a>
        <a href="dashboard.html#saved" role="menuitem">${ICON_HEART} Saved Homes</a>
        ${u.role === 'admin' ? `<a class="usermenu__admin" href="admin.html" role="menuitem">${ICON_DASH} Admin Panel</a>` : ''}
        <button type="button" data-logout role="menuitem">${ICON_OUT} Sign out</button>
      </div>
    </div>`;
  }

  function mountNavAuth() {
    const u = currentUser();

    /* ---- Desktop nav ---- */
    const menu = document.querySelector('.nav__menu');
    if (menu && !document.getElementById('userchip') && !document.querySelector('.nav-auth')) {
      const holder = document.createElement('div');
      holder.className = 'nav-auth';
      holder.innerHTML = u
        ? chipHTML(u)
        : `<a class="btn btn--ghost btn--sm" href="login.html">Sign In</a>`;
      menu.insertBefore(holder, menu.querySelector('.nav__cta'));
    }

    /* ---- Mobile overlay ---- */
    const mfoot = document.querySelector('.mobile-menu__foot');
    if (mfoot && !document.querySelector('.m-auth')) {
      const holder = document.createElement('div');
      holder.className = 'm-auth';
      holder.innerHTML = u
        ? `<div class="m-auth__user">
             <span class="userchip__ava userchip__ava--lg">${initials(u.name)}</span>
             <div><b>${u.name}</b><span>${u.email}</span></div>
             <span class="roletag ${u.role === 'admin' ? 'roletag--admin' : ''}">${u.role}</span>
           </div>
           <div class="m-auth__links">
             <a href="dashboard.html">My Dashboard</a>
             <a href="dashboard.html#saved">Saved Homes</a>
             ${u.role === 'admin' ? '<a href="admin.html">Admin Panel</a>' : ''}
           </div>
           <button class="btn btn--ghost btn--block" type="button" data-logout>Sign out</button>`
        : `<a class="btn btn--primary btn--block" href="login.html">Sign In / Sign Up</a>
           <p class="m-auth__note">New to Stackly? <a href="signup.html">Create a free account</a> to save homes &amp; track enquiries.</p>`;
      mfoot.insertBefore(holder, mfoot.firstChild);
    }

    /* ---- Chip dropdown behaviour ---- */
    const chip = document.getElementById('userchip');
    if (chip) {
      const btn = chip.querySelector('.userchip__btn');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = chip.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', e => {
        if (!chip.contains(e.target)) { chip.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && chip.classList.contains('is-open')) {
          chip.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus();
        }
      });
    }

    /* ---- Sign out (works from chip, mobile block or dashboards) ---- */
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-logout]');
      if (!t) return;
      e.preventDefault();
      logout();
      window.showToast ? showToast('Signed out. See you soon!') : null;
      setTimeout(() => { location.href = 'index.html'; }, 550);
    });
  }

  /* ============================================================
     Save-to-favourites hearts on property cards
     ============================================================ */
  function mountHearts() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.p-card__save');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const u = currentUser();
      if (!u) {
        showToast('Sign in to save homes to your favourites.');
        setTimeout(() => { location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html'); }, 1100);
        return;
      }
      const on = toggleSave(u.email, btn.dataset.save);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
      showToast(on ? 'Saved to your favourites ♥' : 'Removed from favourites.');
      document.dispatchEvent(new CustomEvent('savedchange'));
    });

    /* Keep hearts in sync when grids re-render */
    let t;
    const sync = () => {
      const u = currentUser();
      document.querySelectorAll('.p-card__save').forEach(btn => {
        const on = !!(u && isSaved(u.email, btn.dataset.save));
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', String(on));
      });
    };
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(sync, 60); })
      .observe(document.body, { childList: true, subtree: true });
    sync();
  }

  /* ============================================================
     Boot
     ============================================================ */
  function boot() {
    mountNavAuth();
    mountHearts();
    document.dispatchEvent(new CustomEvent('stackly:authready'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ---------- Public API ---------- */
  return {
    login, register, logout, currentUser, updateProfile, findUser,
    users, saveUsers,
    savedList, isSaved, toggleSave,
    enquiries, trackEnquiry, setEnquiryStatus, cancelVisit,
    propStatus, setPropStatus, isVisible, overrides, isFeatured, setFeatured,
    settings, setSetting,
    initials, fmtDate, timeAgo, safeNext, requireAuth
  };
})();
