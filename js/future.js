/* =====================================================
   FUTURE.JS — Section 6 ("For All The Moments Yet To Come")
   Listens for 'advanceToSection6' (dispatched by
   js/letter.js when its Continue button is pressed), fades
   Section 5 out, reveals Section 6, and renders the future
   moments from the futureMoments array below.

   Editing moments: everything content-related lives in
   futureMoments. Add, remove, or reorder entries freely —
   the timeline, markers, and current/next highlighting are
   all generated from this array.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const letterSection = document.getElementById('section-letter');
  const futureSection = document.getElementById('section-future');
  if (!futureSection) return; // Section 6 markup isn't on the page — nothing to do.

  /* ---------------------------------------------------
     CONTENT — edit freely. Each entry supports:
       number       (required — shown on the timeline marker, e.g. "01")
       title        (required)
       description  (required — keep it general, not a specific past event)
       icon         (required — a small inline SVG string; a few are
                      provided below, reuse or swap them freely)
       image        (optional — path to a photo; if omitted or missing,
                      the card still looks complete using just the icon)
     These four are examples, written to describe hopes for the future —
     not claims about anything that's already happened.
  --------------------------------------------------- */
  const ICONS = {
    map: '<svg viewBox="0 0 24 24"><path d="M9 3L3 5.5v16L9 19l6 2 6-2.5v-16L15 5 9 3z"/><path d="M9 3v16M15 5v16"/></svg>',
    mountains: '<svg viewBox="0 0 24 24"><path d="M3 20l6-11 4 7 3-5 5 9H3z"/><circle cx="17" cy="6" r="2"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M7 8h8a3 3 0 013 3v2a3 3 0 01-3 3h-4l-4 3v-3H7a3 3 0 01-3-3v-2a3 3 0 013-3z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 6.3L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.7z"/></svg>',
  };

  const futureMoments = [
    {
      number: '01',
      title: 'Places We Haven\u2019t Seen Yet',
      description: 'More roads, more cities, more sunsets.',
      icon: ICONS.map,
      image: '',
    },
    {
      number: '02',
      title: 'Adventures We Haven\u2019t Had Yet',
      description: 'More random plans, long rides, and unforgettable days.',
      icon: ICONS.mountains,
      image: '',
    },
    {
      number: '03',
      title: 'Little Things We\u2019ll Still Share',
      description: 'More late-night conversations, laughs, and ordinary moments that somehow become special.',
      icon: ICONS.chat,
      image: '',
    },
    {
      number: '04',
      title: 'Dreams We\u2019ll Chase Together',
      description: 'More things to look forward to, together.',
      icon: ICONS.star,
      image: '',
    },
  ];

  // A different accent per card, cycled through if there are more than four.
  const ACCENT_COLORS = ['var(--purple)', 'var(--pink)', 'var(--gold)', 'var(--purple-deep)'];

  /* ---------------------------------------------------
     RENDER: build the timeline from futureMoments
  --------------------------------------------------- */
  const listEl = document.getElementById('future-timeline-list');

  function buildCard(moment, index) {
    const li = document.createElement('li');
    li.className = 'future-card' + (moment.image ? ' future-card--has-image' : '');
    li.dataset.index = String(index);

    const marker = document.createElement('div');
    marker.className = 'future-card__marker';
    marker.setAttribute('aria-hidden', 'true');
    const number = document.createElement('span');
    number.className = 'future-card__number';
    number.textContent = moment.number;
    marker.appendChild(number);
    li.appendChild(marker);

    const panel = document.createElement('div');
    panel.className = 'future-card__panel';

    if (moment.image) {
      const img = document.createElement('img');
      img.className = 'future-card__image';
      img.src = moment.image;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.remove();
        li.classList.remove('future-card--has-image');
      });
      panel.appendChild(img);
    }

    const icon = document.createElement('div');
    icon.className = 'future-card__icon';
    icon.innerHTML = moment.icon || '';
    panel.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'future-card__title';
    title.textContent = moment.title;
    panel.appendChild(title);

    const description = document.createElement('p');
    description.className = 'future-card__description';
    description.textContent = moment.description;
    panel.appendChild(description);

    li.appendChild(panel);
    return li;
  }

  function renderTimeline() {
    if (!listEl) return;
    const fragment = document.createDocumentFragment();
    futureMoments.forEach((moment, index) => {
      fragment.appendChild(buildCard(moment, index));
    });
    listEl.appendChild(fragment);
  }

  /* ---------------------------------------------------
     SCROLL-TRIGGERED REVEAL + CURRENT/DIMMED STATE
     One observer reveals each card the first time it enters
     view (one-time). A second tracks which card is most
     centered and marks it "current", dimming the ones
     already passed while leaving upcoming ones simply
     unrevealed until scrolled to — matching the "path
     illuminates, current card highlighted, previous cards
     dimmer" spec.
  --------------------------------------------------- */
  let revealObserver = null;
  let currentObserver = null;

  function setCurrentCard(index, cards) {
    cards.forEach((card, i) => {
      card.classList.toggle('is-current', i === index);
      card.classList.toggle('is-dimmed', i < index);
    });
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    futureSection.style.setProperty('--future-accent', accent);
  }

  function initCardObservers() {
    const cards = Array.from(document.querySelectorAll('.future-card'));
    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach((card) => card.classList.add('is-visible'));
      setCurrentCard(0, cards);
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
      { threshold: 0.22, rootMargin: '0px 0px -8% 0px' }
    );

    currentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number(entry.target.dataset.index);
            setCurrentCard(index, cards);
          }
        });
      },
      { threshold: [0.5, 0.6, 0.75, 0.9] }
    );

    cards.forEach((card) => {
      revealObserver.observe(card);
      currentObserver.observe(card);
    });
  }

  /* ---------------------------------------------------
     TIMELINE PROGRESS FILL (same technique as Section 3)
  --------------------------------------------------- */
  const trackList = document.getElementById('future-timeline-list');
  const fillEl = document.getElementById('future-timeline-fill');
  let fillTicking = false;

  function updateTimelineFill() {
    fillTicking = false;
    if (!trackList || !fillEl) return;

    const rect = trackList.getBoundingClientRect();
    const viewportAnchor = window.innerHeight * 0.8;
    const progress = (viewportAnchor - rect.top) / rect.height;
    const clamped = Math.min(Math.max(progress, 0), 1);

    fillEl.style.transform = `scaleY(${clamped})`;
  }

  function onScroll() {
    if (fillTicking) return;
    fillTicking = true;
    requestAnimationFrame(updateTimelineFill);
  }

  function initTimelineFill() {
    if (!trackList || !fillEl) return;
    if (prefersReducedMotion) {
      fillEl.style.transform = 'scaleY(1)';
      return;
    }
    updateTimelineFill();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------------------------------------------------
     ENDING: three lines with breathing space between them
  --------------------------------------------------- */
  function initEndingReveal() {
    const lines = document.querySelectorAll('.future-ending__line');
    const continueBtn = document.getElementById('future-continue');

    if (prefersReducedMotion) {
      lines.forEach((line) => line.classList.add('is-visible'));
      if (continueBtn) continueBtn.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          lines.forEach((line, i) => {
            setTimeout(() => line.classList.add('is-visible'), i * 900);
          });
          if (continueBtn) {
            setTimeout(() => continueBtn.classList.add('is-visible'), lines.length * 900 + 400);
          }
        });
      },
      { threshold: 0.4 }
    );

    const endingEl = document.getElementById('future-ending');
    if (endingEl) observer.observe(endingEl);
  }

  /* ---------------------------------------------------
     AMBIENT PARTICLE CANVAS
  --------------------------------------------------- */
  const canvas = document.getElementById('future-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particlesStarted = false;

  const PARTICLE_COLORS = ['#f4c869', '#f2a9c4', '#9b6dd6', '#f8f6f2'];
  const DUST_COUNT = 26;

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
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.2 + 0.08,
      drift: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.26 + 0.08,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    };
  }

  function step(frame) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift + Math.sin((frame + p.phase * 100) * 0.007) * 0.1;
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
     ACTIVATION: fade Section 5 out, fade Section 6 in
  --------------------------------------------------- */
  let hasActivated = false;

  function activateSection6() {
    if (hasActivated) return;
    hasActivated = true;

    if (letterSection) letterSection.classList.add('is-leaving');

    const revealDelay = prefersReducedMotion ? 0 : 900;
    setTimeout(() => {
      futureSection.classList.add('is-active');
      futureSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      const introEl = document.getElementById('future-intro');
      if (introEl) {
        if (prefersReducedMotion) {
          introEl.classList.add('is-visible');
        } else {
          setTimeout(() => introEl.classList.add('is-visible'), 200);
        }
      }

      initCardObservers();
      initTimelineFill();
      initEndingReveal();
      startParticles();
    }, revealDelay);
  }

  window.addEventListener('advanceToSection6', activateSection6);

  /* ---------------------------------------------------
     CONTINUE BUTTON
     Section 7 doesn't exist yet — same pattern as the
     Continue buttons in Sections 2–5: real feedback now,
     a ready-made event hook for later.
  --------------------------------------------------- */
  const continueBtn = document.getElementById('future-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      continueBtn.classList.remove('is-pressed');
      void continueBtn.offsetWidth;
      continueBtn.classList.add('is-pressed');
      window.dispatchEvent(new CustomEvent('advanceToSection7'));
    });
  }

  renderTimeline();
})();
