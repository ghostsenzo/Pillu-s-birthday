/* =====================================================
   LETTER.JS — Section 5 ("A Letter For You")
   Listens for 'advanceToSection5' (dispatched by
   js/gallery.js when its Continue button is pressed),
   fades Section 4 out, reveals Section 5, and renders the
   letter from letterConfig below.

   WHERE TO PUT YOUR OWN WORDS:
   Edit letterConfig — greeting, paragraphs, finalMessage,
   and signatureName — right below this comment. Nothing
   else in this file needs to change.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gallerySection = document.getElementById('section-gallery');
  const letterSection = document.getElementById('section-letter');
  if (!letterSection) return; // Section 5 markup isn't on the page — nothing to do.

  /* ---------------------------------------------------
     ★ EDIT YOUR LETTER HERE ★
     - greeting: the opening line, e.g. "My beautiful girl,"
     - paragraphs: as many as you like — add or remove lines
       freely, the layout and reveal animation adapt to any
       number of them.
     - finalMessage: the closing line, shown with a slightly
       stronger animation than the paragraphs above it.
     - signatureName: replace "YOUR NAME" with your own —
       this is NOT a hardcoded name, it's a visible placeholder
       on purpose, so it's obvious where to put it.
  --------------------------------------------------- */
  const letterConfig = {
    greeting: 'My Princess,',
    paragraphs: [
      'I still remember the little moments we have shared together. Some were funny, some were silly, and some were really special. But honestly, I love all of them because they are memories that I get to keep with you. ❤️',
      'You have become such an important part of my life. Talking to you, spending time with you, and even our stupid little fights mean a lot to me. You have a way of making my normal days feel much better just by being there. 🥹❤️',
      'I know we may not always agree on everything, and sometimes I may annoy you a little too much 😂, but I never want those small things to change what we have. I just want us to keep growing together, laughing together, and making more beautiful memories.',
    ],
    finalMessage: 'Once again Happy Birthday, Pillu. \u2764\uFE0F Here\u2019s to every memory we\u2019ve made, and every one still waiting for us.',
    
  };

  /* ---------------------------------------------------
     RENDER: populate the letter card from letterConfig
  --------------------------------------------------- */
  const greetingEl = document.getElementById('letter-greeting');
  const paragraphsEl = document.getElementById('letter-paragraphs');
  const finalEl = document.getElementById('letter-final');
  const signatureNameEl = document.getElementById('letter-signature-name');

  function renderLetter() {
    if (greetingEl) greetingEl.textContent = letterConfig.greeting;

    if (paragraphsEl) {
      const fragment = document.createDocumentFragment();
      letterConfig.paragraphs.forEach((text) => {
        const p = document.createElement('p');
        p.className = 'letter-card__paragraph';
        p.textContent = text;
        fragment.appendChild(p);
      });
      paragraphsEl.appendChild(fragment);
    }

    if (finalEl) finalEl.textContent = letterConfig.finalMessage;
    if (signatureNameEl) signatureNameEl.textContent = letterConfig.signatureName;
  }

  /* ---------------------------------------------------
     CINEMATIC INTRO (two lines, timed rather than scroll-
     triggered — they're always in view when the section opens)
  --------------------------------------------------- */
  function revealIntro() {
    const lines = document.querySelectorAll('.letter-intro__line');
    lines.forEach((line, i) => {
      if (prefersReducedMotion) {
        line.classList.add('is-visible');
        return;
      }
      setTimeout(() => line.classList.add('is-visible'), 200 + i * 650);
    });
  }

  function revealCard() {
    const card = document.getElementById('letter-card');
    if (!card) return;
    if (prefersReducedMotion) {
      card.classList.add('is-visible');
      return;
    }
    setTimeout(() => card.classList.add('is-visible'), 1500);
  }

  /* ---------------------------------------------------
     PROGRESSIVE REVEAL
     Greeting, each paragraph, the final line, the heart,
     the signature, and the Continue button all reveal the
     first time they scroll into view — with a small stagger
     for whatever's already in view when the section opens,
     so short letters cascade in immediately and longer ones
     reveal naturally as the reader keeps scrolling.
  --------------------------------------------------- */
  let revealObserver = null;

  function initRevealObserver() {
    const targets = [
      greetingEl,
      ...document.querySelectorAll('.letter-card__paragraph'),
      finalEl,
      document.getElementById('letter-heart'),
      document.getElementById('letter-signature'),
      document.getElementById('letter-ending'),
    ].filter(Boolean);

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------
     SUBTLE POINTER TILT on the letter card (desktop only)
  --------------------------------------------------- */
  function initCardTilt() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const body = document.querySelector('.letter-card__body');
    const card = document.getElementById('letter-card');
    if (!body || !card) return;

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      body.style.setProperty('--tiltX', `${relY * -2.2}deg`);
      body.style.setProperty('--tiltY', `${relX * 2.6}deg`);
    });

    card.addEventListener('pointerleave', () => {
      body.style.setProperty('--tiltX', '0deg');
      body.style.setProperty('--tiltY', '0deg');
    });
  }

  /* ---------------------------------------------------
     AMBIENT PARTICLE CANVAS
     Sparser and slower than earlier sections, to match
     this section's calmer, more intimate mood.
  --------------------------------------------------- */
  const canvas = document.getElementById('letter-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particlesStarted = false;

  const PARTICLE_COLORS = ['#f4c869', '#9b6dd6', '#f8f6f2'];
  const DUST_COUNT = 18;

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeDust() {
    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 0.14 + 0.05,
      drift: (Math.random() - 0.5) * 0.1,
      alpha: Math.random() * 0.22 + 0.06,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    };
  }

  function step(frame) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift + Math.sin((frame + p.phase * 100) * 0.006) * 0.08;
      if (p.y < -10) Object.assign(p, makeDust(), { y: canvasHeight + 10 });

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(step);
  }

  function startParticles() {
    if (particlesStarted || !canvas) return;
    particlesStarted = true;
    resizeCanvas();
    particles = Array.from({ length: DUST_COUNT }, makeDust);
    requestAnimationFrame(step);
    window.addEventListener('resize', resizeCanvas);
  }

  /* ---------------------------------------------------
     ACTIVATION: fade Section 4 out, fade Section 5 in
  --------------------------------------------------- */
  let hasActivated = false;

  function activateSection5() {
    if (hasActivated) return;
    hasActivated = true;

    if (gallerySection) gallerySection.classList.add('is-leaving');

    const revealDelay = prefersReducedMotion ? 0 : 900;
    setTimeout(() => {
      letterSection.classList.add('is-active');
      letterSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      revealIntro();
      revealCard();
      initRevealObserver();
      initCardTilt();
      startParticles();
    }, revealDelay);
  }

  window.addEventListener('advanceToSection5', activateSection5);

  /* ---------------------------------------------------
     CONTINUE BUTTON
     Section 6 doesn't exist yet — same pattern as the
     Continue buttons in Sections 2–4: real feedback now,
     a ready-made event hook for later.
  --------------------------------------------------- */
  const continueBtn = document.getElementById('letter-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      continueBtn.classList.remove('is-pressed');
      void continueBtn.offsetWidth;
      continueBtn.classList.add('is-pressed');
      window.dispatchEvent(new CustomEvent('advanceToSection6'));
    });
  }

  renderLetter();
})();
