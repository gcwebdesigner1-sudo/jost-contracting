(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');
  var mbar = document.getElementById('mbar');
  var heroMedia = document.querySelector('.hero-media');
  var heroInner = document.getElementById('heroInner');
  var clips = [].slice.call(document.querySelectorAll('.reveal-clip'));
  document.getElementById('yr').textContent = new Date().getFullYear();

  // Menu
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  function setMenu(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

  // Scroll-linked effects (all reversible: computed from position, never one-shot)
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    nav.classList.toggle('solid', y > 40);
    mbar.classList.toggle('show', y > vh * 0.75);
    if (reduce) return;

    if (y < vh * 1.2) {
      var p = Math.min(y / vh, 1);
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0) scale(' + (1 + p * 0.08).toFixed(3) + ')';
      heroInner.style.transform = 'translate3d(0,' + (y * -0.18).toFixed(1) + 'px,0)';
      heroInner.style.opacity = Math.max(1 - p * 1.6, 0).toFixed(3);
    }

    clips.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // 0 when the top enters the bottom of the screen, 1 when it reaches 25% from top
      var t = (vh - r.top) / (vh * 0.75);
      t = Math.max(0, Math.min(1, t));
      var e = 1 - Math.pow(1 - t, 2);
      el.style.setProperty('--clip', ((1 - e) * 12).toFixed(2) + '%');
      el.style.setProperty('--zoom', (1 + (1 - e) * 0.15).toFixed(3));
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  // Lightbox
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  function openLb(src, alt) {
    lbImg.src = src; lbImg.alt = alt || '';
    lb.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('lbX').focus();
  }
  function closeLb() { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-full]');
    if (t) { var im = t.tagName === 'IMG' ? t : t.querySelector('img'); openLb(t.getAttribute('data-full'), im && im.alt); }
  });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // Quote form -> text on phones, email on computers
  var form = document.getElementById('quote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, ok = true;
    ['name', 'phone'].forEach(function (n) {
      var bad = !f[n].value.trim();
      f[n].classList.toggle('bad', bad);
      if (bad) ok = false;
    });
    var note = document.getElementById('formNote');
    if (!ok) { note.textContent = 'Please add your name and phone number.'; return; }
    var msg = 'Hi Joseph, I would like a free quote.\n' +
      'Name: ' + f.name.value.trim() + '\n' +
      'Phone: ' + f.phone.value.trim() + '\n' +
      (f.address.value.trim() ? 'Location: ' + f.address.value.trim() + '\n' : '') +
      'Project: ' + f.service.value + '\n' +
      (f.notes.value.trim() ? 'Details: ' + f.notes.value.trim() : '');
    var ua = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
      var sep = /iPhone|iPad|iPod/i.test(ua) ? '&' : '?';
      window.location.href = 'sms:+14068974428' + sep + 'body=' + encodeURIComponent(msg);
    } else {
      window.location.href = 'mailto:joseph@jostcontracting.com?subject=' + encodeURIComponent('Free quote request') + '&body=' + encodeURIComponent(msg);
    }
    note.textContent = 'Thanks! If nothing opened, call or text (406) 897-4428.';
  });
})();
