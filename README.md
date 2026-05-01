# Personal Website — Sparsh Adhikari
### A complete guide to how this site works

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [How a Website Works — The Basics](#2-how-a-website-works--the-basics)
3. [site.css — The Foundation](#3-sitecss--the-foundation)
4. [index.html — The Main Page](#4-indexhtml--the-main-page)
5. [index.css — Styles for the Main Page](#5-indexcss--styles-for-the-main-page)
6. [theme.js — Dark Mode](#6-themejs--dark-mode)
7. [exploring-nepal-macroeconomic.html — The Dashboard](#7-exploring-nepal-macroeconomichtml--the-dashboard)
8. [How the Chart Engine Works](#8-how-the-chart-engine-works)
9. [Retina / HiDPI Display Fix](#9-retina--hidpi-display-fix)
10. [Responsive Design (Mobile)](#10-responsive-design-mobile)
11. [Deployment — GitHub Pages](#11-deployment--github-pages)
12. [Glossary](#12-glossary)

---

## 1. Project Structure

```
Personal-website/
├── index.html                          ← Main homepage
├── exploring-nepal-macroeconomic.html  ← Interactive data dashboard
├── CNAME                               ← Custom domain for GitHub Pages
└── assets/
    ├── css/
    │   ├── site.css    ← Global styles shared by all pages
    │   └── index.css   ← Styles specific to index.html
    ├── js/
    │   └── theme.js    ← Dark/light mode toggle logic
    ├── img/
    │   ├── favicon.svg
    │   └── profile-img.jpg
    └── vendor/
        └── bootstrap-icons/  ← Icon library (arrow, moon, list, etc.)
```

**Key idea:** Separating CSS into `site.css` (shared) and `index.css` (page-specific) means the dashboard page can use the same nav, buttons and fonts without duplicating code.

---

## 2. How a Website Works — The Basics

Every webpage is built from three layers:

| Layer | Language | Job |
|-------|----------|-----|
| Structure | HTML | What is on the page (headings, paragraphs, buttons) |
| Style | CSS | How it looks (colors, fonts, spacing, layout) |
| Behaviour | JavaScript | What it does when you interact (click, hover, scroll) |

The browser reads the HTML file top-to-bottom. When it sees a `<link>` tag, it fetches and applies the CSS. When it sees a `<script>` tag, it runs the JavaScript. Everything the user sees is a combination of these three.

---

## 3. site.css — The Foundation

This file is loaded on **every page** and sets up the design system.

### CSS Variables (Design Tokens)

```css
:root {
  --bg:     #ffffff;    /* page background */
  --text:   #111111;    /* main text color */
  --amber:  #003087;    /* accent color (Georgetown blue) */
  --border: rgba(17,17,17,0.09);
  --nav-h:  56px;       /* navbar height — used everywhere for spacing */
  --ease:   cubic-bezier(0.4,0,0.2,1); /* smooth animation curve */
}
```

`--amber` is named "amber" historically but is set to Georgetown blue (`#003087`). In dark mode it becomes a lighter blue (`#5590d8`) for contrast.

Variables defined inside `:root` are accessible anywhere in the CSS with `var(--name)`. This means changing one value (like the accent color) updates the whole site.

### Dark Mode Variables

```css
[data-theme="dark"] {
  --bg:    #0d0f14;
  --text:  #f0efec;
  --amber: #5590d8;
  /* etc. */
}
```

When JavaScript adds `data-theme="dark"` to the `<html>` element, these overriding values kick in automatically. Every element that uses `var(--bg)` switches to the dark version without any additional code.

### The Navigation Bar

```css
#site-nav {
  position: fixed;       /* sticks to the top as you scroll */
  inset: 0 0 auto;       /* shorthand: top=0, right=0, bottom=auto, left=0 */
  backdrop-filter: blur(24px); /* frosted glass effect */
}
```

`position: fixed` takes the nav out of the normal page flow so it stays at the top. `backdrop-filter: blur` creates the blurred glass look by blurring whatever is behind the nav.

### The Reveal Animation

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);  /* start 16px lower than normal */
  transition: opacity 0.6s, transform 0.6s;
}
.reveal.up {
  opacity: 1;
  transform: none;  /* move back to normal position */
}
```

Elements start invisible and slightly below their target position. JavaScript uses the `IntersectionObserver` API to detect when an element enters the viewport, then adds the `.up` class, triggering the CSS transition — a fade-up animation.

---

## 4. index.html — The Main Page

### Page Sections

The page is structured as a series of `<section>` elements, each with a unique `id`:

```
#hero        ← Name, tagline, call-to-action buttons, animated graph
#about       ← Photo, bio, facts grid
#projects    ← Scrollable card rows (research, blogs, other)
#experience  ← Horizontal scrolling timeline ("chapters")
#courses     ← Course cards
#contact     ← Social/contact links
```

### Hero Section

```html
<section id="hero">
  <div class="hero-content"> ... </div>
  <div class="hero-graph" aria-hidden="true">
    <canvas id="graphCanvas"></canvas>
  </div>
</section>
```

The hero is a CSS Grid with two columns: text on the left, an animated canvas on the right. `aria-hidden="true"` tells screen readers to ignore the decorative animation.

### The Animated Network Graph (Canvas)

The `<canvas>` element is like a blank drawing surface. JavaScript draws on it with the Canvas 2D API. This is the animated dots-and-lines graphic in the hero.

**How it works:**

1. **Nodes** — 38 objects, each with an `x`, `y` position and a velocity (`vx`, `vy`).
2. **Each frame:**
   - Move every node by its velocity
   - Bounce off walls (reverse velocity when hitting an edge)
   - Draw a line between any two nodes closer than 120px, with opacity proportional to distance
   - Draw a dot at each node
3. `requestAnimationFrame(draw)` — tells the browser to call `draw()` again before the next screen repaint (~60 times/second), creating smooth animation.

```js
function resize() {
  const dpr = window.devicePixelRatio || 1; // e.g. 2 on a Retina screen
  W = canvas.offsetWidth;
  H = canvas.offsetHeight;
  canvas.width  = W * dpr;   // physical pixel buffer
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to match
}
```

`devicePixelRatio` is `2` on Retina/HiDPI screens (one CSS pixel = 2 physical pixels). Without this fix, the canvas renders at half resolution and looks blurry. By making the canvas buffer twice as large and scaling the context, we draw at full physical resolution.

### Project Cards & Horizontal Scrolling

```html
<div class="dock" id="d-academic">
  <div class="pcard"> ... </div>
  <div class="pcard"> ... </div>
</div>
```

```css
.dock {
  display: flex;
  overflow-x: auto;       /* allows horizontal scroll */
  scroll-snap-type: x mandatory; /* snaps to card boundaries */
  scrollbar-width: none;  /* hides the scrollbar visually */
}
.pcard { scroll-snap-align: start; } /* each card is a snap point */
```

The left/right arrow buttons call `scrollDock()` in JavaScript, which uses `el.scrollBy({ left: 560, behavior: 'smooth' })` to smoothly move the container.

### Modals

When you click a project card, a modal opens:

```js
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden'; // prevents background scrolling
}
```

The modal is an overlay `<div>` hidden by default (`opacity: 0; pointer-events: none`). Adding the `.open` class makes it visible. Clicking the dark background, pressing `Escape`, or clicking the X button calls `closeModal()`.

### Publisher Label on Blog Cards

```html
<div class="pcard-pub">The Annapurna Express</div>
```

```css
.pcard-pub {
  margin-top: auto;   /* pushes it to the bottom of the card */
  font-size: 0.68rem;
  font-weight: 700;
  text-align: right;
}
.pcard-pub::before {
  content: '— ';      /* adds a dash before the name via CSS, no HTML needed */
}
```

`margin-top: auto` in a flex column pushes the element to the bottom — a common flexbox trick. `::before` is a CSS pseudo-element that inserts content before the element without touching the HTML.

### Active Nav Highlighting

```js
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) cur = s.id;
  });
  navAs.forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur)
  );
}, { passive: true });
```

On every scroll event, it checks which section's top is above the current scroll position (with 120px offset for the nav height). The matching nav link gets the `.active` class, which draws the underline. `{ passive: true }` tells the browser this listener won't call `preventDefault()`, allowing smoother scroll performance.

---

## 5. index.css — Styles for the Main Page

Key patterns worth understanding:

### CSS Grid for Layout

```css
#hero { display: grid; grid-template-columns: 1fr 520px; }
.about-grid { display: grid; grid-template-columns: 300px 1fr; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; }
```

`1fr` means "take up one fraction of the remaining space". `300px 1fr` means the first column is fixed at 300px, the second takes everything else.

### `clamp()` for Fluid Typography

```css
font-size: clamp(4rem, 8vw, 9rem);
```

`clamp(min, preferred, max)` — the font size scales with the viewport (`8vw` = 8% of viewport width) but never goes below `4rem` or above `9rem`. This one line makes the heading readable on all screen sizes.

### Hover-reveal Descriptions

```css
.pcard-desc {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s, opacity 0.25s;
}
.pcard:hover .pcard-desc {
  max-height: 600px;
  opacity: 1;
}
```

You can't animate `height: auto` in CSS, so instead `max-height` is animated from `0` to a large value (`600px`). The content expands to its natural height, and the large max-height cap is never visually reached.

---

## 6. theme.js — Dark Mode

```js
(function () {  // IIFE — runs immediately, variables don't leak globally
  var btn = document.getElementById('themeToggle');

  btn.addEventListener('click', function () {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');  // remembered after page reload
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    syncIcon(); // swap moon ↔ sun icon
  });
}());
```

**`localStorage`** is a browser API that stores key-value pairs permanently (until manually cleared). The preference survives page reloads and browser restarts.

At the top of `index.html`, before any CSS loads:

```html
<script>
  if(localStorage.getItem('theme')==='dark')
    document.documentElement.setAttribute('data-theme','dark');
</script>
```

This runs synchronously in the `<head>` — before the page paints — so the dark theme is applied immediately with no flash of white.

---

## 7. exploring-nepal-macroeconomic.html — The Dashboard

This is a self-contained single-file app. All HTML, CSS, and JavaScript live in one file.

### Data Flow

```
World Bank API → fetchIndicator() → state.rows → render() → drawChart()
```

1. On page load, `loadData()` fetches all indicator data from the World Bank's public REST API.
2. Data is stored in `state.rows` — an array of `{ id, code, year, value, name, unit, source }` objects.
3. `render()` is called whenever the user changes any control. It reads `state`, filters the data, and redraws everything.

### The State Object

```js
const state = {
  rows: [],          // all fetched data
  selected: ["gdp"], // which indicators are active
  units: {},         // per-indicator unit choice (% of GDP vs USD)
  points: [],        // screen coordinates of drawn data points (for hover)
  hover: null,       // currently hovered point
};
```

Centralising all app state in one object makes it easy to reason about — when something changes, update `state`, then call `render()`.

### Indicator Definitions

```js
{ id: "fdi",
  name: "FDI net inflows",
  why: "Foreign investment flow",
  percentCode: "BX.KLT.DINV.WD.GD.ZS",  // World Bank code for % of GDP
  usdCode:     "BX.KLT.DINV.CD.WD",      // World Bank code for USD amount
  percentUnit: "% of GDP",
  usdUnit:     "current US$" }
```

Each indicator has two World Bank codes — one for percentage form, one for absolute USD. When `percentCode === usdCode` (e.g., GDP growth, inflation, reserves), the unit toggle is hidden since there's only one form.

### Dual-Axis Logic

```js
function axisConfig(rows) {
  // Group selected indicators by unit type
  const groups = {};
  ids.forEach(id => {
    groups[unitGroup(id)] ||= [];
    groups[unitGroup(id)].push(id);
  });
  // Only use dual axis if there are different unit types
  if (groupList.length > 1) {
    // left axis = largest-magnitude group
    // right axis = all others
    return { dual: true, ... };
  }
  return { dual: false, ... };
}
```

Dual axis is only triggered by genuinely different unit groups (e.g., `% of GDP` vs `current US$`). Same-unit indicators always share one axis, even if their magnitudes differ a lot (FDI vs GDP, for example).

### Compare Modes

| Mode | What it does | When to use |
|------|-------------|-------------|
| Actual values | Raw numbers | Comparing indicators with similar units |
| Index (first year = 100) | Rebases all series to 100 at the start year | Comparing growth rates regardless of unit |
| Percent change from first year | Shows cumulative % change from the start | Same as indexed but expressed as % |

### World Bank API

```js
function apiUrl(code) {
  return `https://api.worldbank.org/v2/country/NPL/indicator/${code}?format=json&per_page=200`;
}
```

`NPL` is the ISO 3-letter country code for Nepal. The API returns JSON with up to 200 data points per request. If the request fails (no internet, API down), the app falls back to hardcoded sample data.

### CSV and PNG Download

```js
function downloadCsv() {
  const csv = [header, ...rows].map(row =>
    row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")
  ).join("\n");
  download(`nepal-macro.csv`, csv, "text/csv");
}

function downloadPng() {
  const link = document.createElement("a");
  link.href = els.canvas.toDataURL("image/png"); // reads canvas as image
  link.click();
}
```

`canvas.toDataURL()` returns the canvas contents as a base64-encoded PNG string, which is set as the `href` of a temporarily created `<a>` link that's programmatically clicked. Because the canvas is rendered at physical pixel resolution (DPR fix), the downloaded PNG is crisp even on Retina screens.

---

## 8. How the Chart Engine Works

The chart is drawn entirely with the Canvas 2D API — no chart library is used. Here's the flow for a line chart:

### Step 1 — Set up dimensions

```js
const dpr  = window.devicePixelRatio || 1;
const cssW = els.canvas.clientWidth;   // CSS pixels
const cssH = els.canvas.clientHeight;
els.canvas.width  = cssW * dpr;        // physical pixels
els.canvas.height = cssH * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixel space
const w = cssW;
const h = cssH;
const pad = { top: 58, right: 40, bottom: 88, left: 116 };
```

`pad` is the space reserved for axis labels around the plot area.

### Step 2 — Compute scales

```js
function scale(values) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  const gap = (max - min) * 0.1;  // 10% breathing room
  return { min: min - gap, max: max + gap };
}

const y = (value, sc) =>
  pad.top + ((sc.max - value) / (sc.max - sc.min)) * plotH;
```

The `y()` function converts a data value into a pixel position. Values near `sc.max` map to `pad.top` (top of plot). Values near `sc.min` map to `pad.top + plotH` (bottom of plot). This is a linear interpolation.

### Step 3 — Draw grid lines, axis numbers, labels

```js
for (let i = 0; i <= 5; i++) {
  const gy = pad.top + (i / 5) * plotH;
  ctx.beginPath();
  ctx.moveTo(pad.left, gy);
  ctx.lineTo(w - pad.right, gy);
  ctx.stroke(); // draws one horizontal grid line
}
```

### Step 4 — Draw each data series

```js
ctx.beginPath();
series.forEach((row, i) =>
  i ? ctx.lineTo(x(row.year), yRow(row))
    : ctx.moveTo(x(row.year), yRow(row))
);
ctx.stroke();
```

`moveTo` starts the path at the first point. `lineTo` extends it to each subsequent point. `stroke()` renders the entire line at once.

### Step 5 — Hover detection

```js
els.canvas.addEventListener("mousemove", hoverChart);

function hoverChart(event) {
  const rect = els.canvas.getBoundingClientRect();
  const mouse = {
    x: event.clientX - rect.left,  // CSS pixels relative to canvas
    y: event.clientY - rect.top,
  };
  // Find nearest stored point using Pythagorean distance
  const nearest = state.points.reduce((best, point) => {
    const distance = Math.hypot(point.x - mouse.x, point.y - mouse.y);
    return distance < best.distance ? { point, distance } : best;
  }, { point: null, distance: Infinity });

  if (nearest.distance > 22) return clearHover(); // too far away
  state.hover = nearest.point;
  // position tooltip and redraw
}
```

`state.points` is populated during `drawChart()` with the screen coordinates of every dot. On mouse move, the nearest one within 22px is found and highlighted.

---

## 9. Retina / HiDPI Display Fix

This is a common gotcha with Canvas. Here's the problem and solution:

**The problem:**
- A phone screen might have `devicePixelRatio = 3` (3 physical pixels per CSS pixel)
- If you set `canvas.width = 300` (CSS pixels), the canvas has a 300×300 buffer
- The browser stretches it to fill the CSS size, which is actually 900×900 physical pixels
- Result: blurry, pixelated graphics

**The fix:**
```js
const dpr = window.devicePixelRatio || 1; // e.g. 2 or 3
canvas.width  = cssWidth  * dpr; // 300 → 600 or 900
canvas.height = cssHeight * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale all drawing coords
// Now draw as if canvas is 300×300 — but it's actually 600×600
```

`setTransform` scales every drawing operation by `dpr`, so you still write coordinates in CSS pixels but they're physically rendered at full resolution.

---

## 10. Responsive Design (Mobile)

### Breakpoints

```css
@media (max-width: 1024px) { /* tablet */ }
@media (max-width: 900px)  { /* dashboard mobile */ }
@media (max-width: 700px)  { /* phone */ }
```

A media query says: "apply these styles only when the screen width is at or below X pixels."

### Mobile Navigation

On mobile, the nav links are hidden and replaced by a hamburger button (`bi-list` icon). Clicking it toggles the `.open` class, which shows a fullscreen overlay menu.

```css
@media (max-width: 700px) {
  .nav-links { display: none; position: fixed; width: 100vw; height: 100vh; }
  .nav-links.open { display: flex; }
  .nav-toggle { display: block; }
}
```

### Scrollable Chart on Mobile

```css
.chart-wrap {
  overflow-x: auto;                  /* enables horizontal scroll */
  -webkit-overflow-scrolling: touch; /* smooth momentum scroll on iOS */
}

@media (max-width: 900px) {
  canvas { width: 660px; height: 340px; } /* fixed size, wider than phone */
  .chart-wrap::after { display: block; }  /* shows the right-edge fade hint */
}
```

On mobile, the canvas is given a fixed `660px` width — wider than most phones. The wrapping div scrolls horizontally to reveal the full chart, while the right-edge gradient fade hints that there's more content.

---

## 11. Deployment — GitHub Pages

The site is hosted on **GitHub Pages** — a free static site hosting service by GitHub.

**How it works:**
1. Code lives in a GitHub repository
2. GitHub Pages serves the files as a website
3. Pushing to the `main` branch automatically deploys the update (usually within 1–2 minutes)

**The `CNAME` file** contains the custom domain name. GitHub Pages reads this file to know which domain to respond to.

**The deploy workflow:**
```bash
git add <files>
git commit -m "description of change"
git push
# Site updates automatically ~1 minute later
```

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **HTML** | HyperText Markup Language — the structure/content of a page |
| **CSS** | Cascading Style Sheets — controls visual appearance |
| **JavaScript** | Programming language that runs in the browser |
| **DOM** | Document Object Model — the live tree of HTML elements that JavaScript can manipulate |
| **CSS variable** | A reusable value defined once (`--amber`) and referenced anywhere (`var(--amber)`) |
| **Flexbox** | CSS layout system for arranging items in a row or column |
| **CSS Grid** | CSS layout system for two-dimensional (row + column) layouts |
| **`clamp()`** | CSS function: `clamp(min, preferred, max)` — fluid value within bounds |
| **`requestAnimationFrame`** | Browser API to schedule code before the next screen repaint (~60fps) |
| **Canvas 2D API** | JavaScript API for drawing shapes, lines, and images on a `<canvas>` element |
| **`devicePixelRatio`** | Number of physical screen pixels per CSS pixel (1 on standard, 2+ on Retina) |
| **`IntersectionObserver`** | Browser API that notifies when an element enters or leaves the viewport |
| **`localStorage`** | Browser storage that persists data across sessions (used for dark mode preference) |
| **Media query** | CSS rule that applies only at certain screen sizes |
| **`scroll-snap-type`** | CSS property that makes a scroll container snap to defined alignment points |
| **IIFE** | Immediately Invoked Function Expression — a function that runs itself immediately, keeping variables private |
| **REST API** | A web service you query with a URL to get data back (used for World Bank data) |
| **Base64** | Encoding format used to represent binary (like image) data as text |
| **GitHub Pages** | Free static website hosting built into GitHub |
| **CNAME** | A DNS record (and file) that maps a custom domain to a hosted service |
