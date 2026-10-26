/* ============================================================
   Stackly — Login page
   Role tabs · demo quick-fill · validation · role-based redirect
   ============================================================ */
(function () {
  'use strict';

  /* Already signed in? Send them where they belong */
  const existing = StacklyAuth.currentUser();
  if (existing) {
    location.replace(StacklyAuth.safeNext(new URLSearchParams(location.search).get('next'),
      existing.role === 'admin' ? 'admin.html' : 'dashboard.html'));
    return;
  }

  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('loginAlert');
  const alertSpan = alertBox.querySelector('span');
  const tabs = Array.from(document.querySelectorAll('.rtab'));
  let role = 'user';

  /* ---------- Post-signup handoff (registered=1 & email=…) ---------- */
  (function postSignup() {
    const p = new URLSearchParams(location.search);
    if (p.get('registered') !== '1') return;
    const email = p.get('email');
    const em = document.getElementById('liEmail');
    if (email && em) em.value = email;
    /* Swap the alert icon from the error triangle to a checkmark */
    const svg = alertBox.querySelector('svg');
    if (svg) svg.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>';
    alertBox.classList.add('is-show', 'is-success');
    alertSpan.textContent = 'Account created successfully — sign in to continue.';
  })();

  /* ---------- Role tabs ---------- */
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    role = tab.dataset.role;
  }));

  /* ---------- Show / hide password ---------- */
  const pw = document.getElementById('liPass');
  const pwBtn = document.querySelector('.pw-toggle');
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.5 10.5 0 0 1 12 20c-6.5 0-10-8-10-8a19.5 19.5 0 0 1 5.06-5.94M9.9 4.24A9.5 9.5 0 0 1 12 4c6.5 0 10 8 10 8a19.4 19.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';
  pwBtn.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    pwBtn.innerHTML = show ? EYE_OFF : EYE;
    pwBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    pw.focus();
  });

  /* ---------- Demo credential quick-fill ---------- */
  document.querySelectorAll('[data-demo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isAdmin = btn.dataset.demo === 'admin';
      tabs.forEach(t => {
        const on = t.dataset.role === (isAdmin ? 'admin' : 'user');
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      role = isAdmin ? 'admin' : 'user';
      document.getElementById('liEmail').value = isAdmin ? 'admin@stackly.com' : 'user@stackly.com';
      pw.value = isAdmin ? 'admin123' : 'user123';
      pw.type = 'password'; pwBtn.innerHTML = EYE;
      hideAlert();
      showToast(isAdmin ? 'Admin credentials filled — hit Sign in.' : 'User credentials filled — hit Sign in.');
    });
  });

  /* ---------- Reset demo data (clears stale localStorage, re-seeds) ---------- */
  const resetBtn = document.getElementById('resetDemo');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    try {
      Object.keys(localStorage).forEach(k => { if (k.indexOf('stackly_') === 0) localStorage.removeItem(k); });
    } catch (e) { /* private mode */ }
    showToast('Demo data reset — reloading…');
    setTimeout(() => location.reload(), 600);
  });

  /* ---------- Alert helpers ---------- */
  function showAlert(msg) {
    alertSpan.textContent = msg;
    alertBox.classList.add('is-show');
  }
  function hideAlert() { alertBox.classList.remove('is-show'); }

  /* ---------- Field validation ---------- */
  const validators = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    password: v => v.length > 0
  };
  function check(input) {
    const validate = validators[input.name];
    if (!validate) return true;
    const valid = validate(input.value);
    input.closest('.field')?.classList.toggle('has-error', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => check(input));
    input.addEventListener('input', () => { if (input.closest('.field')?.classList.contains('has-error')) check(input); hideAlert(); });
  });

  /* ---------- Forgot password ---------- */
  document.getElementById('forgotLink').addEventListener('click', e => {
    e.preventDefault();
    showToast('Demo mode: use the password shown in the credentials panel.');
  });

  /* ---------- Submit → role-based redirect ---------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('liEmail');
    const pass = pw;
    const ok = [check(email), check(pass)].every(Boolean);
    if (!ok) {
      form.querySelector('.field.has-error input')?.focus();
      showAlert('Please fill in both fields correctly.');
      return;
    }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    /* Small delay = believable "auth round-trip" */
    setTimeout(() => {
      const res = StacklyAuth.login(email.value, pass.value);
      if (!res.ok) {
        btn.disabled = false;
        btn.innerHTML = 'Sign in <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
        showAlert(res.error);
        return;
      }
      const next = StacklyAuth.safeNext(new URLSearchParams(location.search).get('next'), null)
        || (res.user.role === 'admin' ? 'admin.html' : 'dashboard.html');
      btn.innerHTML = 'Welcome, ' + res.user.name.split(' ')[0] + '!';
      showToast('Signed in as ' + (res.user.role === 'admin' ? 'Administrator' : 'User') + '.');
      setTimeout(() => { location.href = next; }, 650);
    }, 500);
  });
})();
