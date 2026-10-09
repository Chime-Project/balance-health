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

  /* Hero video — plays muted on loop; reduced motion keeps the poster still (nothing downloads) */
  var heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo && !reduceMotion) {
    heroVideo.preload = 'auto';
    heroVideo.load(); // WebKit won't fetch a preload="none" video on play() alone
    var playing = heroVideo.play();
    if (playing && playing.catch) playing.catch(function () { /* autoplay blocked (e.g. Low Power Mode): poster stays */ });
  }

  /* How it works — accessible tabs (click + arrow keys) */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.step-tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
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
