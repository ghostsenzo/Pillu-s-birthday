/* =====================================================
   STORY.JS — Section 3 ("Our Story")
   Listens for 'advanceToSection3' (dispatched by
   js/birthday.js when the Continue button is pressed at
   the end of Section 2), fades Section 2 out, reveals
   Section 3, and renders the memory timeline from the
   storyMemories array below.

   Editing memories: everything content-related lives in
   storyMemories. Add, remove, or reorder entries freely —
   the timeline, markers, and alternating layout are all
   generated from this array, so nothing else needs to
   change.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const birthdaySection = document.getElementById('section-birthday');
  const storySection = document.getElementById('section-story');
  if (!storySection) return; // Section 3 markup isn't on the page — nothing to do.

  /* ---------------------------------------------------
     CONTENT — edit freely. Each entry supports:
       title        (required)
       date         (optional — omit or use '' to hide it)
       description  (required)
       photos       (1 or 2 image paths; the second is optional)
     Photo files don't need to exist yet — until they're
     added, each photo gently falls back to a soft gradient
     placeholder instead of a broken-image icon.
  --------------------------------------------------- */
  const storyMemories = [
    {
      title: 'The Beginning',
      date: 'Where it all started',
      description:
        'Before it had a name, it was already something — a conversation that felt easy, a feeling neither of us said out loud yet. Looking back, this is the moment everything else grew from.',
      photos: ['assets/images/us11.jpg'],
    },
    {
      title: 'The random Memories',
      date: '',
      description:
        'The early days, when every small thing felt new. I remember exactly how it felt to realize I wanted more of this — more of you, more of us, more of this feeling.',
      photos: ['assets/images/gf20.jpg', 'us10.jpg'],
    },
    {
      title: 'Little Moments',
      date: '',
      description:
        'Not the big, planned ones — the quiet ones. The ordinary afternoons that somehow became the memories I hold onto the tightest.',
      photos: ['assets/images/us2.jpg'],
    },
    {
      title: 'Adventures Together',
      date: '',
      description:
        'Every place we went became a little more beautiful because you were there to see it with me. New places, familiar hands.',
      photos: ['assets/images/gf-funny2.jpg', 'assets/images/gf-funny1.jpg'],
    },
    {
      title: 'Everything We\u2019ve Shared',
      date: '',
      description:
        'All of it — the laughter, the quiet nights, the ordinary Tuesdays — has led here. To this day, and to loving you exactly as you are.',
      photos: ['assets/images/us9.jpg'],
    },
  ];

  /* ---------------------------------------------------
     RENDER: build the timeline from storyMemories
  --------------------------------------------------- */
  const listEl = document.getElementById('story-timeline-list');

  function buildPhoto(src, title, isSecond) {
    const wrap = document.createElement('div');
    wrap.className = 'memory-card__photo' + (isSecond ? ' memory-card__photo--second' : '');

    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.style.display = 'none';
      wrap.classList.add('memory-card__photo--empty');
    });

    wrap.appendChild(img);
    return wrap;
  }

  function buildMemoryCard(memory, index) {
    const li = document.createElement('li');
    li.className = 'memory-card';

    const marker = document.createElement('div');
    marker.className = 'memory-card__marker';
    marker.setAttribute('aria-hidden', 'true');
    li.appendChild(marker);

    const content = document.createElement('div');
    content.className = 'memory-card__content';

    const eyebrow = document.createElement('span');
    eyebrow.className = 'memory-card__eyebrow';
    eyebrow.textContent = `Memory ${String(index + 1).padStart(2, '0')}`;
    content.appendChild(eyebrow);

    const title = document.createElement('h3');
    title.className = 'memory-card__title';
    title.textContent = memory.title;
    if (memory.date) {
      const date = document.createElement('span');
      date.className = 'memory-card__date';
      date.textContent = memory.date;
      title.appendChild(date);
    }
    content.appendChild(title);

    const description = document.createElement('p');
    description.className = 'memory-card__description';
    description.textContent = memory.description;
    content.appendChild(description);

    if (memory.photos && memory.photos.length) {
      const photos = document.createElement('div');
      photos.className = 'memory-card__photos';
      memory.photos.slice(0, 2).forEach((src, photoIndex) => {
        photos.appendChild(buildPhoto(src, memory.title, photoIndex === 1));
      });
      content.appendChild(photos);
    }

    li.appendChild(content);
    return li;
  }

  function renderTimeline() {
    if (!listEl) return;
    const fragment = document.createDocumentFragment();
    storyMemories.forEach((memory, index) => {
      fragment.appendChild(buildMemoryCard(memory, index));
    });
    listEl.appendChild(fragment);
  }

  /* ---------------------------------------------------
     SCROLL-TRIGGERED REVEALS (IntersectionObserver)
     Each memory card, the intro line, and the ending line
     fade/rise into place the first time they enter view,
     then stop being observed — no repeated cost on rescroll.
  --------------------------------------------------- */
  let revealObserver = null;

  function initRevealObserver() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.memory-card, #story-intro, #story-ending').forEach((el) => {
        el.classList.add('is-visible');
      });
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
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    document.querySelectorAll('.memory-card, #story-intro, #story-ending').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------
     TIMELINE PROGRESS FILL
     Fills the vertical line as the user scrolls through
     the list of memories, driven by a single rAF-throttled
     scroll listener (attached only once Section 3 is active).
  --------------------------------------------------- */
  const trackList = document.getElementById('story-timeline-list');
  const fillEl = document.getElementById('story-timeline-fill');
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
     DESKTOP HOVER TILT on photos
     Subtle, pointer-driven tilt via CSS custom properties.
     Skipped entirely on touch devices (no hover listeners
     attached there — touch already works fine without it).
  --------------------------------------------------- */
  function initPhotoTilt() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    storySection.addEventListener('pointermove', (e) => {
      const photo = e.target.closest('.memory-card__photo');
      if (!photo) return;
      const rect = photo.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      photo.style.setProperty('--tiltX', `${relY * -6}deg`);
      photo.style.setProperty('--tiltY', `${relX * 8}deg`);
    });
  }

  /* ---------------------------------------------------
     AMBIENT PARTICLE CANVAS
     Same lightweight glowing-dust treatment as Section 2,
     kept independent so each section's canvas only runs
     once that section is actually active.
  --------------------------------------------------- */
  const canvas = document.getElementById('story-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particlesStarted = false;

  const PARTICLE_COLORS = ['#f4c869', '#f2a9c4', '#9b6dd6', '#f8f6f2'];
  const DUST_COUNT = 34;

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
      radius: Math.random() * 1.6 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      drift: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.32 + 0.1,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    };
  }

  function step(frame) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift + Math.sin((frame + p.phase * 100) * 0.008) * 0.12;
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
     ACTIVATION: fade Section 2 out, fade Section 3 in,
     then wire up scroll-driven behavior.
  --------------------------------------------------- */
  let hasActivated = false;

  function activateSection3() {
    if (hasActivated) return;
    hasActivated = true;

    if (birthdaySection) birthdaySection.classList.add('is-leaving');

    const revealDelay = prefersReducedMotion ? 0 : 900;
    setTimeout(() => {
      storySection.classList.add('is-active');
      storySection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      initRevealObserver();
      initTimelineFill();
      initPhotoTilt();
      startParticles();
    }, revealDelay);
  }

  window.addEventListener('advanceToSection3', activateSection3);

  /* ---------------------------------------------------
     CONTINUE BUTTON (end of timeline)
     Section 4 doesn't exist yet — same pattern as Section
     2's Continue button: real feedback now, a ready-made
     event hook for whenever Section 4 is built.
  --------------------------------------------------- */
  const continueBtn = document.getElementById('story-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      continueBtn.classList.remove('is-pressed');
      void continueBtn.offsetWidth;
      continueBtn.classList.add('is-pressed');
      window.dispatchEvent(new CustomEvent('advanceToSection4'));
    });
  }

  renderTimeline();
})();
