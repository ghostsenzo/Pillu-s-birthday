/* =====================================================
   BIRTHDAY.JS — Section 2 ("Happy Birthday")
   Listens for 'advanceToSection2' (dispatched by
   js/main.js at the end of Section 1's gift reveal),
   fades Section 1 out, and runs this section's own
   entrance choreography:
     letters of "HAPPY BIRTHDAY" reveal
       -> heart accent
       -> her name reveals word by word
       -> the message fades up
       -> the Continue button appears
   Also owns the ambient particle canvas (glowing dust +
   occasional soft hearts) used as this section's
   background atmosphere.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const countdownSection = document.getElementById('section-countdown');
  const birthdaySection = document.getElementById('section-birthday');
  if (!birthdaySection) return; // Section 2 markup isn't on the page — nothing to do.

  const headingRows = birthdaySection.querySelectorAll('.birthday-heading__row');
  const heartEl = document.getElementById('birthday-heart');
  const nameEl = document.getElementById('birthday-name');
  const messageEl = document.getElementById('birthday-message');
  const continueBtn = document.getElementById('birthday-continue');

  let hasPlayed = false;

  /* ---------------------------------------------------
     TEXT SETUP
     Split "HAPPY" / "BIRTHDAY" into per-letter spans, and
     her name into per-word spans, so each piece can be
     staggered in with its own transition-delay. Building
     this in JS (rather than hardcoding spans in HTML)
     keeps the name easy to edit in one place
     (js/main.js -> birthdayConfig.name) without
     ever touching markup.
  --------------------------------------------------- */
  function buildLetterSpans(rowEl, word) {
    rowEl.setAttribute('aria-hidden', 'true'); // the parent <h2> already carries the readable label
    const fragment = document.createDocumentFragment();
    word.split('').forEach((char) => {
      const span = document.createElement('span');
      if (char === ' ') {
        span.className = 'letter letter--space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'letter';
        span.textContent = char;
      }
      fragment.appendChild(span);
    });
    rowEl.appendChild(fragment);
    return rowEl.querySelectorAll('.letter');
  }

  function buildWordSpans(containerEl, phrase) {
    containerEl.setAttribute('aria-label', phrase);
    const fragment = document.createDocumentFragment();
    phrase.split(' ').filter(Boolean).forEach((word) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      fragment.appendChild(span);
    });
    containerEl.appendChild(fragment);
    return containerEl.querySelectorAll('.word');
  }

  /* ---------------------------------------------------
     ENTRANCE CHOREOGRAPHY
  --------------------------------------------------- */
  function staggerReveal(elements, startDelayMs, stepMs) {
    elements.forEach((el, i) => {
      if (prefersReducedMotion) {
        el.classList.add('is-visible');
        return;
      }
      el.style.transitionDelay = `${startDelayMs + i * stepMs}ms`;
      // rAF so the browser registers the initial (hidden) state before flipping it.
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

  function revealAfter(el, delayMs) {
    if (!el) return;
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }
    setTimeout(() => el.classList.add('is-visible'), delayMs);
  }

  function playEntrance() {
    if (hasPlayed) return;
    hasPlayed = true;

    const name = (window.birthdayConfig && window.birthdayConfig.name) || 'My Beautiful Girl';

    // Heading: "HAPPY" then "BIRTHDAY", letter by letter.
    let letterCursor = 0;
    headingRows.forEach((row) => {
      const word = row.getAttribute('data-word') || '';
      const letters = buildLetterSpans(row, word);
      staggerReveal(letters, 150 + letterCursor * 40, 40);
      letterCursor += letters.length + 3; // small gap between words
    });

    // Heart accent, once the heading has mostly landed.
    revealAfter(heartEl, 150 + letterCursor * 40 + 250);

    // Her name, word by word.
    if (nameEl) {
      const words = buildWordSpans(nameEl, name);
      staggerReveal(words, 150 + letterCursor * 40 + 550, 160);
    }

    // Message and button, last.
    revealAfter(messageEl, 150 + letterCursor * 40 + 1250);
    revealAfter(continueBtn, 150 + letterCursor * 40 + 1900);
  }

  /* ---------------------------------------------------
     ACTIVATION: fade Section 1 out, fade Section 2 in,
     unlock page scroll, run the entrance, start ambient
     particles.
  --------------------------------------------------- */
  function activateSection2() {
    if (countdownSection) countdownSection.classList.add('is-leaving');

    // Unlock scrolling now that the reveal is complete — see the
    // matching lock added in css/global.css (html.pre-reveal).
    document.documentElement.classList.remove('pre-reveal');

    const revealDelay = prefersReducedMotion ? 0 : 900;
    setTimeout(() => {
      birthdaySection.classList.add('is-active');
      birthdaySection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      playEntrance();
      startParticles();
    }, revealDelay);
  }

  window.addEventListener('advanceToSection2', activateSection2);

  /* ---------------------------------------------------
     CONTINUE BUTTON
     No Section 3 yet — this gives real, working feedback
     now and dispatches the hook Section 3 will listen for
     once it exists, without leaving a dead end today.
  --------------------------------------------------- */
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      continueBtn.classList.remove('is-pressed');
      void continueBtn.offsetWidth;
      continueBtn.classList.add('is-pressed');
      window.dispatchEvent(new CustomEvent('advanceToSection3'));
    });
  }

  /* ---------------------------------------------------
     AMBIENT PARTICLE CANVAS
     Soft glowing dust drifting upward, plus a rare, faint
     heart-shaped particle. Only runs once Section 2 is
     active; stops drawing (but keeps state) when the tab
     is hidden, to avoid burning cycles in the background.
  --------------------------------------------------- */
  const canvas = document.getElementById('birthday-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particlesStarted = false;
  let frameCount = 0;

  const PARTICLE_COLORS = ['#f4c869', '#f2a9c4', '#9b6dd6', '#f8f6f2'];
  const DUST_COUNT = 46;

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
      type: 'dust',
      x: Math.random() * canvasWidth,
      y: canvasHeight + Math.random() * 100,
      radius: Math.random() * 1.8 + 0.6,
      speed: Math.random() * 0.35 + 0.12,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.15,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    };
  }

  function makeHeart() {
    return {
      type: 'heart',
      x: Math.random() * canvasWidth,
      y: canvasHeight + 40,
      size: Math.random() * 6 + 8,
      speed: Math.random() * 0.25 + 0.15,
      drift: (Math.random() - 0.5) * 0.2,
      alpha: 0,
      maxAlpha: Math.random() * 0.25 + 0.15,
      fadeState: 'in',
    };
  }

  function drawHeart(x, y, size, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(size / 16, size / 16);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(0, 0, -8, -6, -8, -1);
    ctx.bezierCurveTo(-8, 4, -4, 7, 0, 12);
    ctx.bezierCurveTo(4, 7, 8, 4, 8, -1);
    ctx.bezierCurveTo(8, -6, 0, 0, 0, 4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function step() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    frameCount++;

    // Occasionally spawn a new heart particle — kept rare, matching "subtle".
    if (!prefersReducedMotion && frameCount % 260 === 0 && particles.filter((p) => p.type === 'heart').length < 2) {
      particles.push(makeHeart());
    }

    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift + Math.sin((frameCount + p.phase * 100) * 0.01) * 0.15;

      if (p.type === 'dust') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        if (p.fadeState === 'in') {
          p.alpha += 0.006;
          if (p.alpha >= p.maxAlpha) p.fadeState = 'hold';
        } else if (p.fadeState === 'hold' && p.y < canvasHeight * 0.3) {
          p.fadeState = 'out';
        } else if (p.fadeState === 'out') {
          p.alpha -= 0.004;
        }
        drawHeart(p.x, p.y, p.size, Math.max(p.alpha, 0), '#f2a9c4');
      }
    }

    // Recycle dust that has drifted off the top; drop hearts once fully faded.
    particles = particles.filter((p) => {
      if (p.type === 'dust') {
        if (p.y < -10) {
          Object.assign(p, makeDust(), { y: canvasHeight + Math.random() * 60 });
        }
        return true;
      }
      return p.alpha > 0 || p.fadeState !== 'out';
    });

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
})();
