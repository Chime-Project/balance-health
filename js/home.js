/* Balance Health — homepage behaviour (vanilla, no dependencies). */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shadow once the page scrolls */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Scroll reveal — reduced motion (or no IntersectionObserver) shows everything at once */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Hero background video — wide cut from 600px up, tall cut on phones, muted loop. The CSS poster
     shows until it is actually playing; reduced motion keeps the poster and downloads nothing. */
  var heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo && !reduceMotion) {
    var wideMq = window.matchMedia('(min-width: 600px)');
    var pickHeroVideo = function () {
      var src = wideMq.matches ? heroVideo.getAttribute('data-wide') : heroVideo.getAttribute('data-tall');
      if (heroVideo.getAttribute('src') === src) return;
      heroVideo.classList.remove('is-playing');
      heroVideo.src = src;
      heroVideo.preload = 'auto';
      heroVideo.load(); // WebKit won't fetch a preload="none" video on play() alone
      var playing = heroVideo.play();
      if (playing && playing.catch) playing.catch(function () { /* autoplay blocked (e.g. Low Power Mode): poster stays */ });
    };
    heroVideo.addEventListener('playing', function () { heroVideo.classList.add('is-playing'); });
    pickHeroVideo();
    if (wideMq.addEventListener) wideMq.addEventListener('change', pickHeroVideo);
    else if (wideMq.addListener) wideMq.addListener(pickHeroVideo);
  }

  /* Rails (stat cards, stories) — native scroll-snap; the arrows step one card and the bar tracks the
     scroll position. When everything fits (desktop) the rail goes static and the controls hide. */
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('.rail__track');
    var prev = rail.querySelector('[data-rail-prev]');
    var next = rail.querySelector('[data-rail-next]');
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      rail.classList.toggle('rail--static', max <= 1);
      var size = track.clientWidth / track.scrollWidth;
      var pos = max > 0 ? track.scrollLeft / max : 0;
      rail.style.setProperty('--rail-size', (size * 100) + '%');
      rail.style.setProperty('--rail-pos', (pos * (1 - size) / size * 100) + '%'); // translateX % is of the bar itself
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    }
    function step(dir) {
      var item = track.querySelector('li');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: dir * (item.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* "Service Availability" links open the jurisdictions FAQ */
  function openJurisdictions() {
    var item = document.getElementById('jurisdictions');
    if (item && location.hash === '#jurisdictions') item.open = true;
  }
  window.addEventListener('hashchange', openJurisdictions);
  document.querySelectorAll('a[href="#jurisdictions"]').forEach(function (a) {
    a.addEventListener('click', function () { document.getElementById('jurisdictions').open = true; });
  });
  openJurisdictions();

  /* Early-access form — no backend on a static page.
     Answers stay in sessionStorage; the backend team wires window.balanceSubmitEarlyAccess(payload). */
  var form = document.getElementById('earlyAccessForm');
  var success = document.getElementById('earlyAccessSuccess');
  var STORAGE_KEY = 'balanceEarlyAccess';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, bad) {
    input.closest('.field').classList.toggle('field--error', bad);
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = form.elements.firstName, last = form.elements.lastName, email = form.elements.email;
    var bad = [];
    [first, last].forEach(function (f) { var b = !f.value.trim(); setError(f, b); if (b) bad.push(f); });
    var emailBad = !EMAIL_RE.test(email.value.trim()); setError(email, emailBad); if (emailBad) bad.push(email);
    if (bad.length) { bad[0].focus(); return; }

    var payload = {
      firstName: first.value.trim(),
      lastName: last.value.trim(),
      email: email.value.trim(),
      phone: form.elements.phone.value.trim(),
      message: form.elements.message.value.trim(),
      smsNonMarketing: form.elements.smsNonMarketing.checked,
      smsMarketing: form.elements.smsMarketing.checked,
      submittedAt: new Date().toISOString()
    };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (err) { /* private mode: ignore */ }
    if (typeof window.balanceSubmitEarlyAccess === 'function') window.balanceSubmitEarlyAccess(payload);

    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
})();
