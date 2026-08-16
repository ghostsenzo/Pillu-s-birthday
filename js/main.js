/* =====================================================
   MAIN.JS
   Wires together Section 1, which now opens directly into
   an interactive gift — there is no countdown gate anymore.
   Clicking/tapping/activating the gift (mouse, touch, or
   keyboard Enter/Space, since it's a real <button>) runs
   the cinematic opening choreography once, then hands off
   to Section 2 via 'advanceToSection2', exactly as before.

   Previously this behavior was gated behind countdown.js
   dispatching a 'birthdayUnlocked' event. That gate has
   been removed — see the README for what to do with
   js/countdown.js now that it's unused.
===================================================== */

(function () {
  'use strict';

  // Site-wide content config. This used to live in js/countdown.js
  // alongside the (now-removed) countdown target date; it's kept here
  // since main.js is Section 1's script and loads first. Section 2
  // reads window.birthdayConfig.name for its own name reveal.
  const birthdayConfig = {
    name: 'My Pilluuu',
  };
  window.birthdayConfig = birthdayConfig;

  const giftBox = document.getElementById('gift-box');
  const introSection = document.getElementById('section-countdown');
  const animations = window.BirthdayAnimations || {};

  let hasOpened = false;

  /* ---------------------------------------------------
     GIFT OPENING SEQUENCE
     Runs once, triggered directly by the user activating
     the gift button. Choreographed per the original spec:
     brighten -> shake -> lid opens -> burst -> confetti ->
     fireworks -> music cue -> hand off to Section 2.
  --------------------------------------------------- */
  function openGift() {
    if (hasOpened || !giftBox) return;
    hasOpened = true;
    giftBox.setAttribute('aria-disabled', 'true');

    // Reduced-motion path: skip choreography, jump straight to the open state.
    if (animations.prefersReducedMotion) {
      giftBox.classList.add('is-open');
      scheduleHandoff(800);
      return;
    }

    const giftRect = giftBox.getBoundingClientRect();
    const originX = giftRect.left + giftRect.width / 2;
    const originY = giftRect.top + giftRect.height / 2.4;

    // 1–2: brief pause, then the sky brightens.
    if (introSection) introSection.classList.add('is-flashing');

    setTimeout(() => {
      // 3–5: gift glows and shakes harder, ribbon "loosens".
      giftBox.classList.add('is-unlocking');
    }, 500);

    setTimeout(() => {
      // 6–8: lid opens, golden light bursts from the box.
      giftBox.classList.remove('is-unlocking');
      giftBox.classList.add('is-open');
    }, 1350);

    setTimeout(() => {
      // 9–10: particles explode outward, confetti begins.
      if (typeof animations.launchConfettiBurst === 'function') {
        animations.launchConfettiBurst(originX, originY, 160);
      }
    }, 1450);

    setTimeout(() => {
      // 11: fireworks appear across the sky.
      if (typeof animations.launchFireworks === 'function') {
        animations.launchFireworks(6, 3400);
      }
    }, 1800);

    // 12: music begins where browser autoplay rules allow.
    window.dispatchEvent(new CustomEvent('birthdayMusicCue'));

    // 13: hand off to Section 2 once the reveal has had room to breathe.
    scheduleHandoff(4600);
  }

  function scheduleHandoff(delay) {
    setTimeout(() => {
      // Section 2 will hook into this event to animate itself in.
      window.dispatchEvent(new CustomEvent('advanceToSection2'));
    }, delay);
  }

  if (giftBox) {
    // A real <button> already fires 'click' for mouse, touch tap, and
    // keyboard Enter/Space activation — no separate handlers needed.
    giftBox.addEventListener('click', openGift);
  }

  /* ---------------------------------------------------
     HANDOFF TO SECTION 2
     Section 1's job ends at dispatching 'advanceToSection2'
     (above, in scheduleHandoff). Section 2's own script
     (js/birthday.js) owns what happens next — it listens
     for that event and fades this section out as part of
     its entrance choreography. See js/birthday.js.
  --------------------------------------------------- */
})();
