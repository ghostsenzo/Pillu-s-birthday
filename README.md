# Birthday Website 💛

A cinematic, interactive birthday website, built section by section.

---

## 1. Folder structure

```
Birthday-Website/
├── index.html
├── css/
│   ├── global.css        → design tokens, resets, shared typography
│   ├── countdown.css     → Section 1 (intro + interactive gift)
│   ├── birthday.css      → Section 2 (Happy Birthday)
│   ├── story.css         → Section 3 (Our Story)
│   ├── gallery.css       → Section 4 (Photo Gallery)
│   ├── letter.css        → Section 5 (A Letter For You)
│   └── future.css        → Section 6 (For All The Moments Yet To Come)
├── js/
│   ├── animations.js     → star field, particles, gift interactions, confetti/fireworks
│   ├── main.js            → Section 1: gift click handling + opening choreography
│   ├── birthday.js        → Section 2: entrance choreography + handoff
│   ├── story.js            → Section 3: memory timeline + handoff
│   ├── gallery.js          → Section 4: photo grid + lightbox + handoff
│   ├── letter.js            → Section 5: letter content + reveal + handoff
│   ├── future.js            → Section 6: future-moments timeline + handoff
│   └── countdown.js       → unused — see "About js/countdown.js" below
├── assets/
│   ├── images/
│   ├── music/
│   ├── videos/
│   ├── fonts/
│   └── icons/
└── README.md
```

One CSS/JS file per section, plus shared files (`global.css`, `animations.js`)
that every section uses.

---

## 2. Running it in VS Code with Live Server

1. Open the `Birthday-Website` folder in VS Code (`File → Open Folder…`).
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions panel, if you don't have it yet.
3. Right-click `index.html` in the file explorer and choose **"Open with Live Server"**.
4. Your browser will open at something like `http://127.0.0.1:5500/index.html`.
5. Any time you save a file, Live Server refreshes the page automatically.

That's it — no build step, no npm install, no bundler. It's plain HTML/CSS/JS.

---

## 3. Section 1 — Intro + interactive gift

**There is no countdown anymore.** The site now opens directly into Section 1,
where a single wrapped gift sits waiting. It never opens on its own — the
person has to click or tap it (or, with the gift focused, press Enter or
Space, since it's a real `<button>`).

**What to edit:** her name lives in `js/main.js`, near the top:

```js
const birthdayConfig = {
  name: 'My Beautiful Girl',
};
```

This is read by Section 2 (`window.birthdayConfig.name`) for its own name
reveal, so you only need to change it in this one place.

**How it works:** clicking the gift runs `openGift()` in `js/main.js` once
(a `hasOpened` guard prevents it firing twice) — the same choreography as
before: brief pause → sky flashes → gift shakes harder → lid opens → golden
burst → confetti → fireworks → a `birthdayMusicCue` event (ready for a future
`music.js` to hook into) → and finally `advanceToSection2`, which hands off
to Section 2.

**The night sky** (`js/animations.js`) is a single `<canvas>` element drawing
~220 twinkling stars and ~40 slow-drifting gold dust motes, with a subtle
mouse/touch-driven parallax offset. The moon and clouds are plain HTML/CSS.
The gift itself is an SVG (body, lid, ribbon, bow as separate `<g>` groups),
animated with CSS transforms, and idly shakes every 6–11 seconds to invite a
tap.

**Accessibility:** the gift is a real `<button>` with a descriptive
`aria-label`, so it already works with mouse, touchscreen, and keyboard
(Enter/Space) without any extra wiring. Focus states are visible, and
`prefers-reduced-motion` skips the star parallax, idle shake, and
confetti/fireworks in favor of the gift opening straight away.

### About `js/countdown.js`

This file is no longer loaded by `index.html` (its `<script>` tag has been
removed) and nothing in the site calls into it anymore — the countdown timer,
`DEV_MODE` fast-forward, and the `birthdayUnlocked` event it used to dispatch
are all gone from the live experience. Her name, which used to live in this
file's `birthdayConfig`, has moved to `js/main.js` (see above).

**You don't need to do anything with it.** It's left on disk untouched rather
than deleted, in case you want to reference the old countdown implementation
later. If you'd like to tidy up, it's safe to delete `js/countdown.js`
entirely — nothing references it anymore. Whether you keep or delete it, the
site behaves identically either way, since it was already removed from
`index.html`'s script list.

**Testing is now instant** — there's no `DEV_MODE` to toggle. Just open the
site and click the gift.

---

## 4. Section 2 — Happy Birthday

Section 2 lives in `css/birthday.css` and `js/birthday.js`.

**How it connects to Section 1:** `js/main.js` dispatches
`window.dispatchEvent(new CustomEvent('advanceToSection2'))` at the end of the
gift-opening choreography. `js/birthday.js` listens for that event and owns
everything that happens next: fading Section 1 out
(`#section-countdown.is-leaving`), unlocking page scroll, fading Section 2 in
(`#section-birthday.is-active`), and running its own entrance choreography.

**Entrance choreography, in order:** the letters of "HAPPY" and "BIRTHDAY"
reveal one at a time → a small glowing heart appears and starts a gentle
heartbeat → her name (from `birthdayConfig.name`, now in `js/main.js`) fades
in word by word → the message fades up → the "Continue" button appears last.

**Background atmosphere:** a canvas layer of slow-drifting glowing dust with a
rare, faint heart particle; three soft CSS "nebula" glows; and four elegant,
non-cartoonish balloons looping slowly upward at the edges of the frame.

**Editing the message:** open `index.html` and edit the text inside
`<p class="birthday-message" id="birthday-message">`.

**Scroll lock:** while Section 1's gift hasn't been opened yet, the page can't
be scrolled down to accidentally spoil Section 2 (`html.pre-reveal` in
`css/global.css`). `js/birthday.js` removes that lock the moment the reveal
begins.

**The Continue button** dispatches `advanceToSection3`, which `js/story.js`
listens for.

---

## 5. Section 3 — Our Story

Section 3 lives in `css/story.css` and `js/story.js`.

**How it connects to Section 2:** `js/birthday.js` dispatches
`advanceToSection3` when its Continue button is pressed. `js/story.js`
listens for it and owns everything downstream: fading Section 2 out, fading
Section 3 in, rendering the timeline, and wiring up scroll-driven behavior.

**Editing the memories:** open `js/story.js` and edit the `storyMemories`
array near the top:

```js
{
  title: 'The Beginning',
  date: 'Where it all started',   // optional — use '' to hide it
  description: '...',
  photos: ['assets/images/story-01.jpg'],   // 1 or 2 paths
}
```

Add, remove, or reorder entries freely — the timeline, glowing markers, and
alternating left/right layout (on screens ≥860px) are all generated from this
array.

**Adding your own photos:** drop image files into `assets/images/` using the
filenames already referenced in `storyMemories`, or edit the paths to match
whatever filenames you'd rather use. Until a file exists, that slot shows a
soft gradient placeholder instead of a broken-image icon.

**The Continue button** dispatches `advanceToSection4`, which `js/gallery.js`
listens for.

---

## 6. Section 4 — Photo Gallery

Section 4 lives in `css/gallery.css` and `js/gallery.js`.

**How it connects to Section 3:** `js/story.js` already dispatches
`advanceToSection4` when its Continue button is pressed — that event existed
before Section 4 did, as a ready-made hook. `js/gallery.js` listens for it and
owns everything downstream: fading Section 3 out
(`#section-story.is-leaving`), fading Section 4 in
(`#section-gallery.is-active`), rendering the grid, and running the reveal
animations. No changes were needed to `story.js`, `birthday.js`, `main.js`, or
`animations.js` to make this work.

**Editing the photos:** open `js/gallery.js` and edit the `galleryPhotos`
array near the top:

```js
{
  image: 'assets/images/gallery-01.jpg',
  title: 'One of my favourite memories',   // optional — shown on the card + in the lightbox
  caption: 'A moment I\u2019ll always remember.',  // optional — lightbox only
  date: '',                                 // optional — lightbox only
  size: 'feature',                          // optional — 'feature' | 'wide' | 'tall' | omit for normal
}
```

Add, remove, or reorder entries freely. `size` controls how much room a photo
takes in the grid — `'feature'` is large (2×2), `'wide'` spans two columns,
`'tall'` spans two rows, and omitting it gives a normal 1×1 card — mix them to
keep the collage feeling intentionally composed rather than a plain grid. On
screens narrower than 640px, the grid automatically collapses to a single,
evenly-sized column regardless of `size`.

**Adding your own photos:** drop image files into `assets/images/` using the
filenames already referenced in `galleryPhotos` (`gallery-01.jpg` through
`gallery-06.jpg`), or edit the paths to match whatever filenames you'd rather
use. You don't need to add them now — until a file exists, that card shows a
soft "Add photo" placeholder instead of a broken-image icon, so the section
still looks intentional either way.

**The lightbox:** clicking any photo opens it fullscreen with a dark backdrop,
its title/caption/date (whichever you've filled in), and Previous/Next
navigation. It supports:
- **Keyboard:** `Escape` closes, `←`/`→` navigate, `Tab` cycles through the
  close/prev/next controls without leaving the dialog.
- **Mouse:** clicking the backdrop closes it; Previous/Next buttons navigate.
- **Touch:** swipe left/right on the image to move between photos.

Focus moves to the close button when the lightbox opens, and returns to
whichever photo you clicked when it closes.

**The Continue button** at the end of the gallery dispatches
`advanceToSection5` — Section 5 doesn't exist yet, so for now it just gives
real visual feedback (a small press animation) as a ready-made hook for
whenever Section 5 is built.

---

## 7. Section 5 — A Letter For You

Section 5 lives in `css/letter.css` and `js/letter.js`.

**How it connects to Section 4:** `js/gallery.js` already dispatches
`advanceToSection5` when its Continue button is pressed — that event existed
before Section 5 did, as a ready-made hook. `js/letter.js` listens for it and
owns everything downstream: fading Section 4 out
(`#section-gallery.is-leaving`), fading Section 5 in
(`#section-letter.is-active`), rendering the letter, and running the reveal
sequence. No changes were needed to `gallery.js`, `story.js`, `birthday.js`,
`main.js`, or `animations.js` to make this work.

### Where to put your letter

Open `js/letter.js` and edit `letterConfig` near the top — it's marked with
`★ EDIT YOUR LETTER HERE ★`:

```js
const letterConfig = {
  greeting: 'My beautiful girl,',
  paragraphs: [
    'YOUR FIRST PARAGRAPH HERE...',
    'YOUR SECOND PARAGRAPH HERE...',
    'YOUR THIRD PARAGRAPH HERE...',
  ],
  finalMessage: 'Happy Birthday, my love. \u2764\uFE0F Here\u2019s to every memory...',
  signatureName: 'YOUR NAME \u2764\uFE0F',
};
```

- `greeting` — the opening line.
- `paragraphs` — add or remove as many lines as you want; the layout and the
  reveal animation both adapt automatically to any number of them.
- `finalMessage` — the closing line, shown with a slightly stronger animation
  than the paragraphs above it.
- `signatureName` — replace `YOUR NAME` with your own. It's a visible
  placeholder on purpose, so it's obvious where your name needs to go.

No default content here invents specific memories or events — the placeholder
paragraphs are exactly that, placeholders, ready for your own words.

### How the reveal works

Two intro lines ("There's something I've been wanting to tell you…") fade in
on a timer, since they're always in view when the section opens. After that,
the letter card, greeting, each paragraph, the final line, the heart, the
signature, and the Continue button all reveal the first time they scroll into
view (`IntersectionObserver`), with a small stagger. This means a short
letter cascades in almost immediately, while a longer one reveals naturally
as the reader keeps scrolling — the "keep reading" effect from the brief,
without any special scroll-jacking.

The card also has a very subtle pointer-driven tilt on desktop (skipped on
touch devices and under `prefers-reduced-motion`), and a slow light sheen
that sweeps across it every few seconds.

### The Continue button

Dispatches `advanceToSection6` — Section 6 doesn't exist yet, so it currently
gives real visual feedback (a small press animation) as a ready-made hook for
whenever Section 6 is built.

---

## 8. Section 6 — For All The Moments Yet To Come

Section 6 lives in `css/future.css` and `js/future.js`.

**How it connects to Section 5:** `js/letter.js` already dispatches
`advanceToSection6` when its Continue button is pressed — that event existed
before Section 6 did, as a ready-made hook. `js/future.js` listens for it and
owns everything downstream: fading Section 5 out
(`#section-letter.is-leaving`), fading Section 6 in
(`#section-future.is-active`), rendering the timeline, and running the reveal
animations. No changes were needed to `letter.js`, `gallery.js`, `story.js`,
`birthday.js`, `main.js`, or `animations.js` to make this work.

### How to edit the future moments

Open `js/future.js` and edit the `futureMoments` array near the top:

```js
{
  number: '01',
  title: 'Places We Haven\u2019t Seen Yet',
  description: 'More roads, more cities, more sunsets.',
  icon: ICONS.map,     // reuse one of ICONS.map / .mountains / .chat / .star, or add your own SVG string
  image: '',            // optional — e.g. 'assets/images/future-01.jpg'
}
```

Add, remove, or reorder entries freely — the timeline, glowing markers, and
current/dimmed highlighting are all generated from this array, so nothing
else needs to change. The four defaults are examples only (as written in the
brief) and don't claim anything about your actual relationship — edit the
`title`/`description` to whatever's true for you.

**Icons:** four simple line-icon SVG strings are provided in the `ICONS`
object (map, mountains, chat bubble, star) — reference any of them by name,
or paste in your own SVG markup as a string.

**Images are optional.** The section is designed to look complete with none
at all — every card default has `image: ''`. If you'd like a photo behind a
card, set `image` to a path like `assets/images/future-01.jpg` and drop the
file into `assets/images/`; if that path doesn't resolve, the card quietly
falls back to the icon-only design rather than showing a broken image.

### How the scroll experience works

As you scroll, each card fades up into view the first time it's reached
(`IntersectionObserver`), a vertical line down the left illuminates in step
with your scroll position (same technique as Section 3's timeline), and
whichever card is currently centered gets a highlighted "current" treatment
while ones already passed dim slightly — cards not yet reached simply haven't
revealed yet. The ambient background glow's color also shifts gently between
purple, pink, and gold as you move from chapter to chapter.

### The Continue button

Dispatches `advanceToSection7` — Section 7 doesn't exist yet, so it currently
gives real visual feedback (a small press animation) as a ready-made hook for
whenever Section 7 (the final birthday surprise) is built.

---

## 9. Next step

Once you're happy with Section 6, just say **"NEXT"** and Section 7 — the
final surprise — will be built on top of this same visual language.
