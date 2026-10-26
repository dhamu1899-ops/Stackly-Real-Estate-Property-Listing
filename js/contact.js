/* ============================================================
   Stackly — Contact page
   Form validation (PRD §Contact Form) + FAQ accordion
   ============================================================ */
(function () {
  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq__item').forEach(item => {
    const q = $('.faq__q', item);
    const a = $('.faq__a', item);
    if (!q || !a) return;

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      /* Close others (single-open accordion) */
      document.querySelectorAll('.faq__item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          $('.faq__q', other)?.setAttribute('aria-expanded', 'false');
          const oa = $('.faq__a', other);
          if (oa) oa.style.maxHeight = '';
        }
      });

      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : '';
    });
  });

  /* Keep open accordion sized correctly on resize */
  window.addEventListener('resize', () => {
    document.querySelectorAll('.faq__item.is-open .faq__a').forEach(a => {
      a.style.maxHeight = a.scrollHeight + 'px';
    });
  });

  /* ---------- Contact form validation (PRD: validate email & mobile) ---------- */
  const form = document.getElementById('contactForm');
  if (!form) return;
  const okBox = document.getElementById('contactOk');

  const validators = {
    name: v => v.trim().length >= 2,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    /* Mobile is optional — but must be valid when provided */
    phone: v => v.trim() === '' || /^[6-9]\d{9}$/.test(v.replace(/[\s\-+()]/g, '').replace(/^91/, '')),
    subject: v => v !== '',
    message: v => v.trim().length >= 10
  };

  function check(input) {
    const validate = validators[input.name];
    if (!validate) return true;
    const valid = validate(input.value);
    const field = input.closest('.field');
    field?.classList.toggle('has-error', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => check(input));
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('has-error')) check(input);
    });
    input.addEventListener('change', () => check(input));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    const results = inputs.map(check);

    if (results.includes(false)) {
      const first = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
      first?.focus();
      first?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      showToast('Please correct the highlighted fields before sending.');
      return;
    }

    /* Log to the account layer (shows in dashboards + admin inbox) */
    if (typeof window.trackStacklyEnquiry === 'function') {
      const fd = Object.fromEntries(new FormData(form).entries());
      window.trackStacklyEnquiry({
        propertyTitle: 'Contact form — ' + (fd.subject || 'General enquiry'),
        type: 'enquiry',
        name: fd.name,
        phone: fd.phone,
        message: fd.message
      });
    }

    okBox.classList.add('is-show');
    showToast('Message sent — an advisor will reply shortly.');
    form.reset();
    inputs.forEach(i => {
      i.closest('.field')?.classList.remove('has-error');
      i.removeAttribute('aria-invalid');
    });
    okBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });
})();
