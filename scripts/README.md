# Asset pipeline

Everything under `public/images/` and `public/hero/`, plus `app/icon.png` and
`app/apple-icon.png`, is generated from the client originals and committed. `public/client-sent/` is never modified.

```bash
node scripts/prepare-assets.mjs
```

Requires `sharp` (devDependency) and, for the hero video, `ffmpeg` on `PATH`
(`brew install ffmpeg`; the video step is skipped if it's missing).

## What it does

**Photos** → `public/images/*.webp`: greyscale, gentle contrast lift (`linear(1.08, -6)`),
quality 78, max width 2560 for full-bleed images and 1600 for the rest. `next/image`
re-encodes per device size at request time, so no `.avif` copies are stored.

**Social card** → `public/images/og.jpg`: 1200×630 crop of the Home banner (the hero image),
used as the Open Graph / Twitter image.

**Logos** → `logo-mark.png` (carbon), `logo-mark-paper.png` (for dark surfaces),
`logo-lockup.png`, and the favicons (carbon mark on a fern disc).

**Hero video** → `public/hero/hero.mp4` + `poster.jpg` from
`public/Drone_rising_over_snowy_ridge_loop.mp4` (a seamless loop: its last frame matches the
first). The script crops any letterbox it finds with `cropdetect` (this clip has none) and
desaturates (`hue=s=0`) so it matches the greyscale photography. Equivalent commands:

```bash
V=public/Drone_rising_over_snowy_ridge_loop.mp4
F="hue=s=0"
ffmpeg -i $V -vf "$F" -frames:v 1 -q:v 3 public/hero/poster.jpg
ffmpeg -i $V -vf "$F" -an -c:v libx264 -crf 22 -preset veryfast -pix_fmt yuv420p -movflags +faststart public/hero/hero.mp4
```
