/* =====================================================
   ANIMATIONS.JS
   Handles all visual effects for Section 1:
   - Star field + drifting dust (canvas, sky-canvas)
   - Mouse/touch parallax on stars, moon, gift box
   - Idle gift box shake
   - Unlock burst: confetti + fireworks (unlock-canvas)

   Everything here is self-contained and exposed on
   window.BirthdayAnimations so other scripts (countdown.js,
   main.js) can trigger the unlock sequence without a
   bundler or module system.
===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) document.body.classList.add('motion-reduced');

  /* ---------------------------------------------------
     STAR FIELD + DUST (sky-canvas)
  --------------------------------------------------- */
  const skyCanvas = document.getElementById('sky-canvas');
  const skyCtx = skyCanvas ? skyCanvas.getContext('2d') : null;

  let stars = [];
  let dust = [];
  let skyWidth = 0;
  let skyHeight = 0;
  let pointer = { x: 0.5, y: 0.5 }; // normalized 0-1, used for parallax

  const STAR_COUNT_DESKTOP = 220;
  const STAR_COUNT_MOBILE = 110;
  const DUST_COUNT = 40;

  function resizeSky() {
    if (!skyCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    skyWidth = skyCanvas.clientWidth;
    skyHeight = skyCanvas.clientHeight;
    skyCanvas.width = skyWidth * dpr;
    skyCanvas.height = skyHeight * dpr;
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createStars() {
    const count = window.innerWidth < 640 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * skyWidth,
      y: Math.random() * skyHeight * 0.85,
      radius: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.006,
      twinklePhase: Math.random() * Math.PI * 2,
      parallaxDepth: Math.random() * 0.5 + 0.1,
    }));
  }

  function createDust() {
    dust = Array.from({ length: DUST_COUNT }, () => ({
      x: Math.random() * skyWidth,
      y: Math.random() * skyHeight,
      radius: Math.random() * 1.6 + 0.6,
      speedY: -(Math.random() * 0.15 + 0.05),
      speedX: (Math.random() - 0.5) * 0.08,
      alpha: Math.random() * 0.35 + 0.1,
    }));
  }

  function drawSky(time) {
    if (!skyCtx) return;
    skyCtx.clearRect(0, 0, skyWidth, skyHeight);

    // Stars, twinkling + subtle parallax offset
    const parallaxX = (pointer.x - 0.5) * 18;
    const parallaxY = (pointer.y - 0.5) * 10;

    for (const star of stars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.35 + 0.65;
      const alpha = Math.max(0, star.baseAlpha * twinkle);
      const offsetX = prefersReducedMotion ? 0 : parallaxX * star.parallaxDepth;
      const offsetY = prefersReducedMotion ? 0 : parallaxY * star.parallaxDepth;

      skyCtx.beginPath();
      skyCtx.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
      skyCtx.fillStyle = `rgba(248, 246, 242, ${alpha})`;
      skyCtx.fill();
    }

    // Floating dust motes, drifting slowly upward
    for (const mote of dust) {
      mote.y += mote.speedY;
      mote.x += mote.speedX;
      if (mote.y < -10) {
        mote.y = skyHeight + 10;
        mote.x = Math.random() * skyWidth;
      }
      skyCtx.beginPath();
      skyCtx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      skyCtx.fillStyle = `rgba(244, 200, 105, ${mote.alpha})`;
      skyCtx.fill();
    }
  }

  function skyLoop(time) {
    drawSky(time * 0.06);
    requestAnimationFrame(skyLoop);
  }

  function initSky() {
    if (!skyCanvas) return;
    resizeSky();
    createStars();
    createDust();
    requestAnimationFrame(skyLoop);
    window.addEventListener('resize', () => {
      resizeSky();
      createStars();
      createDust();
    });
  }

  /* ---------------------------------------------------
     POINTER PARALLAX (stars, moon, gift box tilt)
  --------------------------------------------------- */
  const moonEl = document.querySelector('.moon');
  const giftBox = document.getElementById('gift-box');
  const giftArt = giftBox ? giftBox.querySelector('.gift-box__art') : null;

  function updatePointer(clientX, clientY) {
    pointer.x = clientX / window.innerWidth;
    pointer.y = clientY / window.innerHeight;

    if (prefersReducedMotion) return;

    const offsetX = (pointer.x - 0.5) * 12;
    const offsetY = (pointer.y - 0.5) * 8;

    if (moonEl) {
      moonEl.style.transform = `translate(${offsetX * 0.6}px, ${offsetY * 0.6}px)`;
    }
    if (giftArt) {
      // Tilt is applied to the inner SVG art (not .gift-box itself), since
      // .gift-box already has a CSS keyframe animation controlling its own
      // `transform` for the float effect — animating the same property on
      // the same element from JS would just get overridden every frame.
      const tiltX = (pointer.y - 0.5) * -10;
      const tiltY = (pointer.x - 0.5) * 14;
      giftArt.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
  }

  window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  /* ---------------------------------------------------
     IDLE GIFT BOX SHAKE
     Every 6-11 seconds, give the gift a tiny shake so it
     feels alive and inviting, unless motion is reduced.
  --------------------------------------------------- */
  function scheduleIdleShake() {
    if (prefersReducedMotion || !giftBox) return;
    const delay = 6000 + Math.random() * 5000;
    setTimeout(() => {
      if (!giftBox.classList.contains('is-unlocking') && !giftBox.classList.contains('is-open')) {
        giftBox.classList.add('is-shaking');
        setTimeout(() => giftBox.classList.remove('is-shaking'), 550);
      }
      scheduleIdleShake();
    }, delay);
  }

  /* ---------------------------------------------------
     UNLOCK CANVAS: confetti + fireworks
     Self-contained particle burst used at the moment the
     countdown reaches zero. No external dependency.
  --------------------------------------------------- */
  const unlockCanvas = document.getElementById('unlock-canvas');
  const unlockCtx = unlockCanvas ? unlockCanvas.getContext('2d') : null;
  let unlockParticles = [];
  let unlockRunning = false;
  let unlockWidth = 0;
  let unlockHeight = 0;

  const CONFETTI_COLORS = ['#f4c869', '#ffe3a3', '#f2a9c4', '#9b6dd6', '#f8f6f2'];

  function resizeUnlockCanvas() {
    if (!unlockCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    unlockWidth = window.innerWidth;
    unlockHeight = window.innerHeight;
    unlockCanvas.width = unlockWidth * dpr;
    unlockCanvas.height = unlockHeight * dpr;
    unlockCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeConfettiPiece(originX, originY) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 3;
    return {
      type: 'confetti',
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.12,
      life: 1,
      decay: Math.random() * 0.004 + 0.002,
    };
  }

  function makeFirework(originX, originY) {
    const count = 40;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const sparks = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3.5 + 2.5;
      sparks.push({
        type: 'spark',
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1.5,
        color,
        life: 1,
        decay: Math.random() * 0.012 + 0.012,
        gravity: 0.04,
      });
    }
    return sparks;
  }

  function drawUnlockParticles() {
    if (!unlockCtx) return;
    unlockCtx.clearRect(0, 0, unlockWidth, unlockHeight);

    unlockParticles = unlockParticles.filter((p) => p.life > 0);

    for (const p of unlockParticles) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      unlockCtx.globalAlpha = Math.max(p.life, 0);

      if (p.type === 'confetti') {
        p.rotation += p.rotationSpeed;
        unlockCtx.save();
        unlockCtx.translate(p.x, p.y);
        unlockCtx.rotate(p.rotation);
        unlockCtx.fillStyle = p.color;
        unlockCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        unlockCtx.restore();
      } else {
        unlockCtx.beginPath();
        unlockCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        unlockCtx.fillStyle = p.color;
        unlockCtx.fill();
      }
    }

    unlockCtx.globalAlpha = 1;

    if (unlockParticles.length > 0) {
      requestAnimationFrame(drawUnlockParticles);
    } else {
      unlockRunning = false;
      if (unlockCanvas) unlockCanvas.classList.remove('is-active');
    }
  }

  function launchConfettiBurst(originX, originY, amount = 140) {
    for (let i = 0; i < amount; i++) {
      unlockParticles.push(makeConfettiPiece(originX, originY));
    }
    kickUnlockLoop();
  }

  function launchFireworks(count = 5, duration = 3200) {
    let launched = 0;
    const interval = setInterval(() => {
      const originX = unlockWidth * (0.2 + Math.random() * 0.6);
      const originY = unlockHeight * (0.15 + Math.random() * 0.35);
      unlockParticles.push(...makeFirework(originX, originY));
      kickUnlockLoop();
      launched++;
      if (launched >= count) clearInterval(interval);
    }, duration / count);
  }

  function kickUnlockLoop() {
    if (!unlockCanvas) return;
    unlockCanvas.classList.add('is-active');
    if (!unlockRunning) {
      unlockRunning = true;
      resizeUnlockCanvas();
      requestAnimationFrame(drawUnlockParticles);
    }
  }

  window.addEventListener('resize', () => {
    if (unlockCanvas) resizeUnlockCanvas();
  });

  /* ---------------------------------------------------
     PUBLIC API
  --------------------------------------------------- */
  window.BirthdayAnimations = {
    prefersReducedMotion,
    launchConfettiBurst,
    launchFireworks,
  };

  initSky();
  scheduleIdleShake();
})();
