/* ============================================================
   Stackly — Sign up page
   Role pick · strength meter · validation · auto sign-in
   ============================================================ */
(function () {
  'use strict';

  /* Already signed in? Go to your dashboard */
  const existing = StacklyAuth.currentUser();
  if (existing) {
    location.replace(existing.role === 'admin' ? 'admin.html' : 'dashboard.html');
    return;
  }

  const form = document.getElementById('signupForm');
  const alertBox = document.getElementById('signupAlert');
  const alertSpan = alertBox.querySelector('span');
  const pass = document.getElementById('suPass');
  const pass2 = document.getElementById('suPass2');

  /* ---------- Registration switch (admin setting) ---------- */
  if (StacklyAuth.settings().registration === false) {
    alertSpan.textContent = 'New registrations are temporarily closed. Please try again later.';
    alertBox.classList.add('is-show');
    form.querySelectorAll('input, button').forEach(el => { el.disabled = true; });
    return;
  }

  function showAlert(msg) { alertSpan.textContent = msg; alertBox.classList.add('is-show'); }
  function hideAlert() { alertBox.classList.remove('is-show'); }

  /* ---------- Show / hide password ---------- */
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.5 10.5 0 0 1 12 20c-6.5 0-10-8-10-8a19.5 19.5 0 0 1 5.06-5.94M9.9 4.24A9.5 9.5 0 0 1 12 4c6.5 0 10 8 10 8a19.4 19.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    const input = btn.parentElement.querySelector('input');
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show ? EYE_OFF : EYE;
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });
  });

  /* ---------- Strength meter ---------- */
  const bars = document.getElementById('strengthBars');
  const label = document.getElementById('strengthLabel');
  const LABELS = ['—', 'Weak', 'Fair', 'Good', 'Strong'];
  pass.addEventListener('input', () => {
    const v = pass.value;
    let score = 0;
    if (v.length >= 6) score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    if (!v) score = 0;
    bars.dataset.level = String(score);
    label.textContent = LABELS[score];
    label.style.color = ['', 'var(--danger)', 'var(--gold)', 'var(--accent-2)', 'var(--accent)'][score];
  });

  /* ---------- Validation ---------- */
  const validators = {
    name: v => v.trim().length >= 2,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && !StacklyAuth.findUser(v),
    phone: v => v.trim() === '' || /^[6-9]\d{9}$/.test(v.replace(/[\s\-+()]/g, '').replace(/^91/, '')),
    password: v => v.length >= 6,
    confirm: v => v === pass.value && v.length > 0
  };

  function check(input) {
    const validate = validators[input.name];
    if (!validate) return true;
    const valid = validate(input.value);
    input.closest('.field')?.classList.toggle('has-error', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]').forEach(input => {
    input.addEventListener('blur', () => check(input));
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('has-error')) check(input);
      hideAlert();
      if (input === pass2) check(pass2);
    });
  });

  /* ---------- Submit ---------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]'));
    const ok = fields.map(check).every(Boolean);
    const terms = form.querySelector('[name="terms"]');

    if (!ok) {
      form.querySelector('.field.has-error input')?.focus();
      showAlert('Please correct the highlighted fields.');
      return;
    }
    if (!terms.checked) {
      showAlert('Please accept the Terms of Service to continue.');
      terms.focus();
      return;
    }

    const btn = document.getElementById('signupBtn');
    btn.disabled = true;
    btn.textContent = 'Creating your account…';

    setTimeout(() => {
      const res = StacklyAuth.register({
        name: document.getElementById('suName').value,
        email: document.getElementById('suEmail').value,
        phone: document.getElementById('suPhone').value,
        pass: pass.value,
        role: (form.querySelector('[name="role"]:checked') || {}).value || 'user'
      });

      if (!res.ok) {
        btn.disabled = false;
        btn.innerHTML = 'Create account <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
        showAlert(res.error);
        return;
      }

      /* Account created — sign out and hand the user to the login page
         with their credentials ready so they sign in explicitly. */
      btn.innerHTML = 'Account created!';
      showToast('Welcome to Stackly, ' + res.user.name.split(' ')[0] + '! Please sign in.');
      StacklyAuth.logout();
      const handle = encodeURIComponent(res.user.email);
      setTimeout(() => {
        location.href = 'login.html?registered=1&email=' + handle;
      }, 900);
    }, 550);
  });
})();
