/* ============================================================
   Stackly — Property details page
   Dynamic render from ?id= · Gallery · Facts · Enquiry · Related
   ============================================================ */
(function () {
  const root = document.getElementById('detailRoot');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  const prop = id ? getProperty(id) : null;

  /* Unknown or archived listing → branded 404 (PRD §404) */
  if (!prop || !StacklyAuth.isVisible(prop)) {
    location.replace('404.html');
    return;
  }

  const agent = getAgent(prop.agentId);
  document.title = `${prop.title} — ${formatPrice(prop.price)} | Stackly`;
  const crumb = document.getElementById('crumbTitle');
  if (crumb) crumb.textContent = prop.title;

  const pricePerSqft = Math.round(prop.price / prop.area);
  const isRent = prop.purpose === 'rent';

  const specs = [];
  if (prop.beds) specs.push({ icon: ICONS.bed, val: prop.beds, label: 'Bedrooms' });
  if (prop.baths) specs.push({ icon: ICONS.bath, val: prop.baths, label: 'Bathrooms' });
  specs.push({ icon: ICONS.area, val: prop.area.toLocaleString('en-IN'), label: 'Sq. Ft.' });
  if (prop.parking) specs.push({ icon: ICONS.car, val: prop.parking, label: 'Parking' });
  if (specs.length < 4) specs.push({ icon: ICONS.cal, val: prop.year, label: 'Year Built' });

  const featureItems = [
    ...prop.features,
    '24×7 Security & CCTV',
    'Power Backup',
    'Rainwater Harvesting',
    'Clubhouse Access',
    'Visitor Management',
    'Covered Car Parking'
  ].slice(0, 12);

  root.innerHTML = `
  <div class="details">
    <div>
      <!-- Gallery -->
      <div class="gallery" data-reveal="fade">
        <div class="gallery__main" id="galMain" tabindex="0" role="group" aria-label="Property image gallery">
          <img id="galImg" src="${prop.images[0]}" alt="${prop.title} — main view" decoding="async">
          <button class="gallery__arrow gallery__arrow--prev" id="galPrev" type="button" aria-label="Previous image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="gallery__arrow gallery__arrow--next" id="galNext" type="button" aria-label="Next image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <span class="gallery__count"><span id="galIdx">1</span> / ${prop.images.length}</span>
        </div>
        <div class="gallery__thumbs" id="galThumbs">
          ${prop.images.map((src, i) => `
            <button class="gallery__thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}" aria-label="Show image ${i + 1}">
              <img src="${src}" alt="" loading="lazy" decoding="async">
            </button>`).join('')}
        </div>
      </div>

      <!-- Head -->
      <div class="block" style="margin-top:34px" data-reveal>
        <div class="details__head">
          <div>
            <div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px">
              <span class="badge" style="position:static">${prop.status}</span>
              <span class="badge badge--blue" style="position:static">${isRent ? 'For Rent' : 'For Sale'}</span>
            </div>
            <h1>${prop.title}</h1>
            <p class="details__loc">
              ${ICONS.pin}${prop.district}, ${prop.city}
              <span class="rating" style="margin-left:10px">${ICONS.star}${prop.rating.toFixed(1)}</span>
            </p>
          </div>
          <div class="details__price">
            <b>${formatPrice(prop.price)}</b>
            <span>${isRent ? 'per month' : `₹${pricePerSqft.toLocaleString('en-IN')} per sq.ft`}</span>
          </div>
        </div>

        <div class="spec-grid">
          ${specs.slice(0, 4).map(s => `
            <div class="spec">${s.icon}<b>${s.val}</b><span>${s.label}</span></div>`).join('')}
        </div>
      </div>

      <!-- Description -->
      <div class="block" data-reveal>
        <h2>About this property</h2>
        <p>${prop.description}</p>
        <p>
          The listing is ${prop.status.toLowerCase()} and available for an in-person viewing any day this week.
          All title, encumbrance and layout documents are verified and available for inspection before any
          token amount is paid — our advisor will walk you through each page.
        </p>
      </div>

      <!-- Features -->
      <div class="block" data-reveal>
        <h2>Features &amp; amenities</h2>
        <ul class="feature-grid">
          ${featureItems.map(f => `<li>${ICONS.check}${f}</li>`).join('')}
        </ul>
      </div>

      <!-- Facts -->
      <div class="block" data-reveal>
        <h2>Property facts</h2>
        <div class="facts">
          <div><span>Listing ID</span><b>EV-${prop.id.slice(0, 6).toUpperCase()}</b></div>
          <div><span>Property type</span><b>${prop.type}</b></div>
          <div><span>Availability</span><b>${prop.status}</b></div>
          <div><span>Year built</span><b>${prop.year}</b></div>
          <div><span>Car parking</span><b>${prop.parking ? prop.parking + ' covered slots' : 'Street parking'}</b></div>
          <div><span>Furnishing</span><b>${isRent ? 'Semi furnished' : 'Unfurnished'}</b></div>
          <div><span>Built-up area</span><b>${prop.area.toLocaleString('en-IN')} sq.ft</b></div>
          <div><span>Maintenance</span><b>${isRent ? 'Included in rent' : '₹' + (prop.area * 4).toLocaleString('en-IN') + ' / month'}</b></div>
          <div><span>Locality</span><b>${prop.district}</b></div>
          <div><span>City</span><b>${prop.city}</b></div>
        </div>
      </div>

      <!-- Enquiry form -->
      <div class="block" id="enquiry" data-reveal>
        <h2>Book a site visit</h2>
        <div class="form-card">
          <form id="enquiryForm" class="form-grid" novalidate>
            <div class="field">
              <label for="eqName">Full name <span class="req">*</span></label>
              <input type="text" id="eqName" name="name" placeholder="Your name" autocomplete="name">
              <span class="field__err">Please enter your name (2+ characters).</span>
            </div>
            <div class="field">
              <label for="eqPhone">Mobile number <span class="req">*</span></label>
              <input type="tel" id="eqPhone" name="phone" placeholder="10-digit mobile number" autocomplete="tel" inputmode="numeric">
              <span class="field__err">Enter a valid 10-digit Indian mobile number.</span>
            </div>
            <div class="field">
              <label for="eqEmail">Email</label>
              <input type="email" id="eqEmail" name="email" placeholder="you@example.com" autocomplete="email">
              <span class="field__err">That email address doesn't look right.</span>
            </div>
            <div class="field">
              <label for="eqDate">Preferred visit date</label>
              <input type="date" id="eqDate" name="date">
              <span class="field__err">Please choose a date from today onwards.</span>
            </div>
            <div class="field span-2">
              <label for="eqMsg">Message</label>
              <textarea id="eqMsg" name="message" placeholder="Tell us what you'd like to know about ${prop.title}…"></textarea>
              <span class="field__err">Message is too short.</span>
            </div>
            <div class="span-2" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
              <button class="btn btn--primary btn--lg" type="submit">Request a Viewing</button>
              <p class="form-note">No spam — one advisor replies within 30 minutes during office hours.</p>
            </div>
            <div class="span-2 form-ok" id="enquiryOk" role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>
              Viewing requested! ${agent.name} will call you shortly to confirm the slot.
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <aside class="side-card" data-reveal="right">
      <div class="side-card__price">${formatPrice(prop.price)}${isRent ? '<small> /month</small>' : ''}</div>
      <p class="side-card__note">${isRent
        ? 'Deposit: 2 months · Maintenance included'
        : 'All-inclusive asking price · Verified title'}</p>

      <ul class="side-list">
        <li><span>Property type</span><b>${prop.type}</b></li>
        <li><span>Purpose</span><b>${isRent ? 'Rent' : 'Buy'}</b></li>
        <li><span>Bedrooms</span><b>${prop.beds || '—'}</b></li>
        <li><span>Bathrooms</span><b>${prop.baths || '—'}</b></li>
        <li><span>Area</span><b>${prop.area.toLocaleString('en-IN')} sq.ft</b></li>
        <li><span>Year built</span><b>${prop.year}</b></li>
        <li><span>Rating</span><b>★ ${prop.rating.toFixed(1)}</b></li>
      </ul>

      <a class="btn btn--primary btn--block" href="#enquiry" id="sideVisit">Schedule a Visit</a>
      <a class="btn btn--blue btn--block" href="tel:${agent.phone.replace(/\s/g, '')}">Call ${agent.name.split(' ')[0]}</a>
      <button class="btn btn--soft btn--block" type="button" id="shareBtn">
        Share this listing
      </button>

      <div class="agent-box">
        <img src="${agent.photo}" alt="${agent.name}" loading="lazy">
        <div>
          <b>${agent.name}</b>
          <span>${agent.role}</span>
          <div class="agent-card__stats"><span>${agent.deals} deals</span><span>★ ${agent.rating}</span></div>
        </div>
      </div>
      <p style="font-size:.83rem;margin-top:14px">Direct: <a href="mailto:${agent.email}" style="color:#64ffda;font-weight:700">${agent.email}</a></p>
    </aside>
  </div>`;

  /* Reveal the freshly injected content */
  requestAnimationFrame(() => {
    root.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
  });

  /* ---------- Gallery ---------- */
  let gi = 0;
  const img = document.getElementById('galImg');
  const idx = document.getElementById('galIdx');
  const thumbs = Array.from(document.querySelectorAll('#galThumbs .gallery__thumb'));

  function show(i) {
    gi = (i + prop.images.length) % prop.images.length;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = prop.images[gi];
      img.alt = `${prop.title} — image ${gi + 1}`;
      img.style.opacity = '1';
    }, reduceMotion ? 0 : 180);
    idx.textContent = gi + 1;
    thumbs.forEach((t, k) => t.classList.toggle('is-active', k === gi));
  }

  document.getElementById('galPrev').addEventListener('click', () => show(gi - 1));
  document.getElementById('galNext').addEventListener('click', () => show(gi + 1));
  thumbs.forEach(t => t.addEventListener('click', () => show(parseInt(t.dataset.i, 10))));
  document.getElementById('galMain').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(gi - 1);
    if (e.key === 'ArrowRight') show(gi + 1);
  });

  /* ---------- Share ---------- */
  document.getElementById('shareBtn')?.addEventListener('click', async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title: prop.title, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); showToast('Listing link copied to clipboard.'); }
      else showToast('Copy this link: ' + url);
    } catch (_) { /* user dismissed */ }
  });

  /* ---------- Enquiry validation ---------- */
  const form = document.getElementById('enquiryForm');
  const okBox = document.getElementById('enquiryOk');

  const rules = {
    name: v => v.trim().length >= 2,
    phone: v => /^[6-9]\d{9}$/.test(v.replace(/[\s\-+()]/g, '').replace(/^91/, '')),
    email: v => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    date: v => v === '' || new Date(v) >= new Date(new Date().toDateString())
  };

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const good = rule(input.value);
    input.closest('.field')?.classList.toggle('has-error', !good);
    return good;
  }

  form.querySelectorAll('input, textarea').forEach(inp => {
    inp.addEventListener('blur', () => validateField(inp));
    inp.addEventListener('input', () => {
      if (inp.closest('.field')?.classList.contains('has-error')) validateField(inp);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = Array.from(form.querySelectorAll('input, textarea'));
    const results = inputs.map(validateField);
    if (results.includes(false)) {
      form.querySelector('.field.has-error input, .field.has-error textarea')?.focus();
      showToast('Please fix the highlighted fields.');
      return;
    }
    /* Log to the account layer (dashboards + admin inbox) */
    if (typeof window.trackStacklyEnquiry === 'function') {
      const fd = Object.fromEntries(new FormData(form).entries());
      window.trackStacklyEnquiry({
        propertyId: prop.id,
        propertyTitle: prop.title,
        type: fd.date ? 'visit' : 'enquiry',
        visitDate: fd.date || null,
        name: fd.name,
        phone: fd.phone,
        message: fd.message
      });
    }

    okBox.classList.add('is-show');
    showToast('Viewing request sent — we will call you shortly.');
    form.reset();
    okBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  /* ---------- Related listings ---------- */
  const related = PROPERTIES
    .filter(p => p.id !== prop.id && StacklyAuth.isVisible(p) && (p.city === prop.city || p.type === prop.type || p.purpose === prop.purpose))
    .slice(0, 3);

  if (related.length) {
    const block = document.getElementById('relatedBlock');
    const grid = document.getElementById('relatedGrid');
    block.hidden = false;
    grid.innerHTML = related.map((p, i) => propertyCard(p, i)).join('');
    requestAnimationFrame(() => grid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in')));
  }
})();
