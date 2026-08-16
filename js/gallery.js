/* =====================================================
   GALLERY.JS — Section 4 ("A Little Gallery of You")
   Listens for 'advanceToSection4' (dispatched by
   js/story.js when the Continue button at the end of the
   timeline is pressed), fades Section 3 out, reveals
   Section 4, and renders the photo grid from the
   galleryPhotos array below. Also owns the fullscreen
   lightbox used to view any photo full-size.

   Editing photos: everything content-related lives in
   galleryPhotos. Add, remove, or reorder entries freely —
   the grid, staggered reveal, and lightbox all read from
   this array, so nothing else needs to change.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const storySection = document.getElementById('section-story');
  const gallerySection = document.getElementById('section-gallery');
  if (!gallerySection) return; // Section 4 markup isn't on the page — nothing to do.

  /* ---------------------------------------------------
     CONTENT — edit freely. Each entry supports:
       image    (required — path to the photo)
       title    (optional — shown on the card and in the lightbox)
       caption  (optional — shown only in the lightbox)
       date     (optional — shown only in the lightbox)
       size     (optional — 'feature' | 'wide' | 'tall' | omit for normal;
                 controls how much room the card takes in the grid)
     Photo files don't need to exist yet — until they're added,
     each card gently shows an "Add photo" placeholder instead
     of a broken-image icon.
  --------------------------------------------------- */
  const galleryPhotos = [
    {
      image: 'assets/images/gf16.jpg',
      title: 'One of my favourite memories',
      caption: 'A moment I\u2019ll always remember, exactly as it happened.',
      date: '',
      size: 'feature',
    },
    {
      image: 'assets/images/us6.jpg',
      title: 'That smile',
      caption: 'The one I fell for, over and over again.',
      date: '',
      size: 'tall',
    },
    {
      image: 'assets/images/us7.jpg',
      title: '',
      caption: '',
      date: '',
      size: '',
    },
    {
      image: 'assets/images/gf13.jpg',
      title: 'Somewhere with you',
      caption: 'Every place feels better when you\u2019re in it.',
      date: '',
      size: 'wide',
    },
    {
      image: 'assets/images/gf14.jpg',
      title: '',
      caption: '',
      date: '',
      size: '',
    },
    {
      image: 'assets/images/first-pic.jpg',
      title: 'A quiet, ordinary day',
      caption: 'The kind I\u2019d relive a hundred times over.',
      date: '',
      size: 'tall',
    },
  ];

  /* ---------------------------------------------------
     RENDER: build the grid from galleryPhotos
  --------------------------------------------------- */
  const gridEl = document.getElementById('gallery-grid');

  function buildGalleryItem(photo, index) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'gallery-item' + (photo.size ? ` gallery-item--${photo.size}` : '');
    item.setAttribute('role', 'listitem');
    item.setAttribute('aria-label', photo.title ? `Open photo: ${photo.title}` : `Open photo ${index + 1}`);
    item.dataset.index = String(index);

    const img = document.createElement('img');
    img.className = 'gallery-item__img';
    img.src = photo.image;
    img.alt = photo.title || '';
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      item.classList.add('gallery-item--empty');
    });
    item.appendChild(img);

    const scrim = document.createElement('span');
    scrim.className = 'gallery-item__scrim';
    scrim.setAttribute('aria-hidden', 'true');
    item.appendChild(scrim);

    if (photo.title) {
      const label = document.createElement('span');
      label.className = 'gallery-item__label';
      label.textContent = photo.title;
      item.appendChild(label);
    }

    item.addEventListener('click', () => openLightbox(index, item));

    return item;
  }

  function renderGrid() {
    if (!gridEl) return;
    const fragment = document.createDocumentFragment();
    galleryPhotos.forEach((photo, index) => {
      const item = buildGalleryItem(photo, index);
      if (!prefersReducedMotion) {
        item.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;
      }
      fragment.appendChild(item);
    });
    gridEl.appendChild(fragment);
  }

  /* ---------------------------------------------------
     SCROLL-TRIGGERED REVEALS
  --------------------------------------------------- */
  let revealObserver = null;

  function initRevealObserver() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.gallery-item, #gallery-intro, #gallery-ending').forEach((el) => {
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
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    document.querySelectorAll('.gallery-item, #gallery-intro, #gallery-ending').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------
     LIGHTBOX
  --------------------------------------------------- */
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxText = document.getElementById('lightbox-text');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  let currentIndex = 0;
  let lastFocusedEl = null;
  let touchStartX = null;

  function renderLightboxPhoto(index) {
    const photo = galleryPhotos[index];
    if (!photo || !lightboxImage) return;

    lightboxImage.src = photo.image;
    lightboxImage.alt = photo.title || `Photo ${index + 1}`;
    lightboxImage.onerror = () => {
      lightboxImage.alt = 'Photo not added yet';
    };

    if (lightboxTitle) lightboxTitle.textContent = photo.title || '';
    if (lightboxText) lightboxText.textContent = photo.caption || '';
    if (lightboxDate) lightboxDate.textContent = photo.date || '';
  }

  function openLightbox(index, triggerEl) {
    if (!lightbox) return;
    currentIndex = index;
    lastFocusedEl = triggerEl || document.activeElement;

    renderLightboxPhoto(currentIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (lightboxClose) lightboxClose.focus();
    document.addEventListener('keydown', onLightboxKeydown);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onLightboxKeydown);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryPhotos.length;
    renderLightboxPhoto(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    renderLightboxPhoto(currentIndex);
  }

  function onLightboxKeydown(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    } else if (e.key === 'Tab') {
      // Minimal focus trap between the three lightbox controls.
      const focusable = [lightboxPrev, lightboxNext, lightboxClose].filter(Boolean);
      const currentFocusIndex = focusable.indexOf(document.activeElement);
      if (currentFocusIndex === -1) return;
      e.preventDefault();
      const nextIndex = e.shiftKey
        ? (currentFocusIndex - 1 + focusable.length) % focusable.length
        : (currentFocusIndex + 1) % focusable.length;
      focusable[nextIndex].focus();
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNext);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // Touch swipe: left = next, right = previous.
  if (lightbox) {
    lightbox.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.touches && e.touches[0] ? e.touches[0].clientX : null;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      'touchend',
      (e) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
        if (touchEndX === null) return;
        const delta = touchEndX - touchStartX;
        if (Math.abs(delta) > 50) {
          if (delta < 0) showNext();
          else showPrev();
        }
        touchStartX = null;
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------
     AMBIENT PARTICLE CANVAS
  --------------------------------------------------- */
  const canvas = document.getElementById('gallery-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particlesStarted = false;

  const PARTICLE_COLORS = ['#f4c869', '#f2a9c4', '#9b6dd6', '#f8f6f2'];
  const DUST_COUNT = 30;

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
      speed: Math.random() * 0.28 + 0.1,
      drift: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.3 + 0.1,
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
     ACTIVATION: fade Section 3 out, fade Section 4 in
  --------------------------------------------------- */
  let hasActivated = false;

  function activateSection4() {
    if (hasActivated) return;
    hasActivated = true;

    if (storySection) storySection.classList.add('is-leaving');

    const revealDelay = prefersReducedMotion ? 0 : 900;
    setTimeout(() => {
      gallerySection.classList.add('is-active');
      gallerySection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      initRevealObserver();
      startParticles();
    }, revealDelay);
  }

  window.addEventListener('advanceToSection4', activateSection4);

  /* ---------------------------------------------------
     CONTINUE BUTTON
     Section 5 doesn't exist yet — same pattern as the
     Continue buttons in Sections 2 and 3: real feedback
     now, a ready-made event hook for later.
  --------------------------------------------------- */
  const continueBtn = document.getElementById('gallery-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      continueBtn.classList.remove('is-pressed');
      void continueBtn.offsetWidth;
      continueBtn.classList.add('is-pressed');
      window.dispatchEvent(new CustomEvent('advanceToSection5'));
    });
  }

  renderGrid();
})();
