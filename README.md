# 2026 Neon Calendar

A futuristic neon-themed calendar web app for **November and December 2026**.
Side-by-side on desktop, stacked on mobile, with a notes sidebar and
localStorage persistence.

## Features

- **Two-month view** — November and December 2026 side by side
- **Neon design** — pulsing blue "2026" title, red November / green December
  titles, pulsing neon card borders
- **Per-date notes** — add notes with a `[Nov 15]` date prefix; each date with a
  note gets a blinking dot at the bottom-right of its calendar cell (red for
  November, green for December)
- **Notes sidebar** — one area per month with placeholder guidance
- **Purple neon clock** — live time at the top right
- **"Azmat Ali" signature** — bottom center
- **Responsive** — works from 270px width up
- **Accessibility** — prefers-reduced-motion support, ARIA labels, focus styles
- **Notes saved** — all notes persist in `localStorage`

## Note format

```
[Nov 15] Buy groceries
[Dec 1, 2026] Doctor appointment
```

The date prefix is optional — notes without one are still saved.

## Running

Open `index.html` in any browser. No build step required.

## Files

```
calendar_2026/
├── index.html      # Structure
├── css/style.css   # Neon styling, animations, responsive rules
├── js/script.js    # Clock, notes, localStorage, per-date dots
└── README.md
```