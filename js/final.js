/* =====================================================
   FINAL.JS — Section 7: The Final Surprise
   Reveals the final birthday message after the user
   explicitly presses the final button. No countdown,
   no automatic opening, and no Section 8 handoff.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const section = document.getElementById('section-final');
  if (!section) return;

  const intro = document.getElementById('final-intro');
  const openButton = document.getElementById('final-open');
  const message = document.getElementById('final-message');
  const linesContainer = document.getElementById('final-lines');
  const closing = document.getElementById('final-closing');
  const signature = document.getElementById('final-signature');
  const replay = document.getElementById('final-replay');
  const nameEl = document.getElementById('final-name');
  const heart = document.getElementById('final-heart');
  const canvas = document.getElementById('final-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  /* ===================================================
     EDIT ONLY THIS BLOCK TO PERSONALIZE THE FINALE.
  =================================================== */
  const finalConfig = {
    name: ' PILLUUUU ',
    lines: [
      'I just want you to know how special you are to me. Im really lucky to have you in my life. ❤️',
      'You make me happy in so many little ways. I love spending time with you, talking to you, and making memories with you. 🥹❤️',
      'This is just another page of our story. I hope we keep making many more beautiful memories together. ❤️',
      'I hope you always stay this cute, crazy, and beautiful. I may not always be able to say everything I feel, but I really do care about you a lot. Thank you for being there, for making me smile, and for making so many ordinary days feel special. I just want to keep laughing with you, annoying you, fight with you, making memories with you and being by your side. I hope this birthday brings you everything you wish for, because you truly deserve to be happy.'
    ],
    closing: 'Happy Birthday, my Princess. ❤️',
    signatureLine: 'i love you,',
    signatureName: 'Always & Forever ❤️'
  };

  const state = {
    activated: false,
    revealed: false,
    particlesStarted: false,
    particles: [],
    width: 0,
    height: 0
  };

  if (nameEl) nameEl.textContent = finalConfig.name;
  const signatureLineEl = document.querySelector('.final-signature__line');
  const signatureNameEl = document.getElementById('final-signature-name');
  if (signatureLineEl) signatureLineEl.textContent = finalConfig.signatureLine;
  if (signatureNameEl) signatureNameEl.textContent = finalConfig.signatureName;

  function buildMessage() {
    if (!linesContainer) return [];
    linesContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const lineElements = [];

    finalConfig.lines.filter(Boolean).forEach((text) => {
      const p = document.createElement('p');
      p.className = 'final-line';
      p.textContent = text;
      fragment.appendChild(p);
      lineElements.push(p);
    });

    linesContainer.appendChild(fragment);
    return lineElements;
  }

  const lineElements = buildMessage();
  if (closing) closing.textContent = finalConfig.closing;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
    canvas.width = state.width * dpr;
    canvas.height = state.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle(fromCenter) {
    return {
      x: fromCenter ? state.width / 2 : Math.random() * state.width,
      y: fromCenter ? state.height * 0.48 : Math.random() * state.height,
      vx: fromCenter ? (Math.random() - 0.5) * 1.7 : (Math.random() - 0.5) * 0.18,
      vy: fromCenter ? (Math.random() - 0.5) * 1.7 : -Math.random() * 0.25 - 0.05,
      radius: Math.random() * 1.8 + 0.5,
      life: fromCenter ? 1 : Math.random(),
      decay: fromCenter ? Math.random() * 0.012 + 0.006 : 0.0015,
      alpha: Math.random() * 0.45 + 0.18,
      type: Math.random() > 0.78 ? 'gold' : 'pink'
    };
  }

  function startParticles() {
    if (state.particlesStarted || !canvas || !ctx || prefersReducedMotion) return;
    state.particlesStarted = true;
    resizeCanvas();
    state.particles = Array.from({ length: 38 }, () => createParticle(false));

    function frame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, state.width, state.height);

      for (const p of state.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.y < -10 || p.x < -10 || p.x > state.width + 10 || p.life <= 0) {
          Object.assign(p, createParticle(false), { y: state.height + 8 });
        }

        const color = p.type === 'gold' ? '244,200,105' : '242,169,196';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${Math.max(0.04, p.alpha * Math.min(p.life + 0.15, 1))})`;
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    window.addEventListener('resize', resizeCanvas);
  }

  function burstParticles() {
    if (!canvas || !ctx || prefersReducedMotion) return;
    resizeCanvas();
    for (let i = 0; i < 95; i += 1) state.particles.push(createParticle(true));

    const burstStart = performance.now();
    function animateBurst(now) {
      if (!ctx) return;
      const elapsed = now - burstStart;
      if (elapsed > 1700) return;

      for (const p of state.particles) {
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.vy += 0.008;
        p.life -= p.decay * 1.8;
      }
      requestAnimationFrame(animateBurst);
    }
    requestAnimationFrame(animateBurst);
  }

  function revealClass(el, delay) {
    if (!el) return;
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }
    setTimeout(() => el.classList.add('is-visible'), delay);
  }

  function revealMessage() {
    if (state.revealed) return;
    state.revealed = true;

    if (intro) intro.classList.add('is-hidden');
    if (message) message.classList.add('is-visible');
    burstParticles();

    const step = prefersReducedMotion ? 0 : 520;
    lineElements.forEach((el, index) => revealClass(el, 650 + index * step));

    const closingDelay = 650 + lineElements.length * step + (prefersReducedMotion ? 0 : 350);
    revealClass(closing, closingDelay);
    revealClass(signature, closingDelay + (prefersReducedMotion ? 0 : 650));
    revealClass(heart, closingDelay + (prefersReducedMotion ? 0 : 450));
    revealClass(replay, closingDelay + (prefersReducedMotion ? 0 : 1100));
  }

  function activateSection7() {
    if (state.activated) return;
    state.activated = true;
    section.classList.add('is-active');
    document.documentElement.classList.remove('pre-reveal');
    startParticles();

    if (intro) {
      if (prefersReducedMotion) intro.classList.add('is-visible');
      else setTimeout(() => intro.classList.add('is-visible'), 450);
    }

    setTimeout(() => section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' }), prefersReducedMotion ? 0 : 500);
  }

  function resetSection7() {
    state.revealed = false;
    if (message) message.classList.remove('is-visible');
    if (intro) intro.classList.remove('is-hidden');
    lineElements.forEach((el) => el.classList.remove('is-visible'));
    [closing, signature, heart, replay].forEach((el) => el && el.classList.remove('is-visible'));
    if (openButton) {
      openButton.hidden = false;
      openButton.focus();
    }
  }

  if (openButton) {
    openButton.addEventListener('click', () => {
      openButton.hidden = true;
      revealMessage();
    });
  }

  if (replay) replay.addEventListener('click', resetSection7);

  window.addEventListener('advanceToSection7', activateSection7);

  // The section is not activated until Section 6 dispatches the handoff.
  // This also makes direct testing easy: add ?final=1 to the URL.
  if (new URLSearchParams(window.location.search).get('final') === '1') {
    activateSection7();
  }
})();
