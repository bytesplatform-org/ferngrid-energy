# Asset pipeline

Everything under `public/images/`, `public/hero/`, `app/icon.png`, `app/apple-icon.png`
and `lib/hero-frames.ts` is generated from the client originals and committed.
`public/client-sent/` is never modified.

```bash
node scripts/prepare-assets.mjs          # everything
node scripts/prepare-assets.mjs images   # photos + logos + favicons
node scripts/prepare-assets.mjs hero     # hero video derivatives + lib/hero-frames.ts
```

Requires `ffmpeg` on `PATH` (`brew install ffmpeg`) and `sharp` (devDependency).

## What it does

**Photos** → `public/images/*.webp`: greyscale, gentle contrast lift (`linear(1.08, -6)`),
quality 78, max width 2560 for full-bleed images and 1600 for the rest. `next/image`
re-encodes per device size at request time, so no `.avif` copies are stored.

**Logos** → `logo-mark.png` (carbon), `logo-mark-paper.png` (for dark surfaces),
`logo-lockup.png`, and the favicons (carbon mark on a fern disc).

**Hero video** (`public/Drone_rising_over_snowy_ridge_8b1688bb.mp4`):

The source clip is letterboxed (black bars top and bottom). The script detects the active
picture with `cropdetect` (currently `crop=1280:568:0:76`) and fully desaturates it
(`hue=s=0`, which removes a faint orange lens flare near the end). The resulting filter is
applied to every output. These are the equivalent commands:

```bash
V=public/Drone_rising_over_snowy_ridge_8b1688bb.mp4
F="crop=1280:568:0:76,hue=s=0"
mkdir -p public/hero/frames public/hero/frames-sm

# Frame sequence for the canvas scrub (desktop + mobile)
ffmpeg -i $V -vf "$F,scale=1280:-2" -c:v libwebp -quality 72 public/hero/frames/f_%03d.webp
ffmpeg -i $V -vf "$F,scale=720:-2"  -c:v libwebp -quality 68 public/hero/frames-sm/f_%03d.webp

# Poster (first frame) and end frame (also the Open Graph image)
ffmpeg -i $V -vf "$F" -frames:v 1 -q:v 3 public/hero/poster.jpg
ffmpeg -sseof -0.5 -i $V -vf "$F" -update 1 -q:v 3 public/hero/end.jpg

# Plain looping video for HERO_MODE = "video" (no audio track)
ffmpeg -i $V -vf "$F" -an -c:v libx264 -crf 22 -preset veryfast -pix_fmt yuv420p -movflags +faststart public/hero/hero.mp4
```

Notes:

- **No `libwebp` in ffmpeg?** The current Homebrew bottle has none. The script detects that
  and instead extracts lossless PNG frames to a temp dir, then encodes them with sharp at the
  same sizes and qualities.
- **End frame:** `-sseof -0.05 -frames:v 1` decodes no frame on ffmpeg 9, so the script
  seeks back 0.5s and uses `-update 1` to keep the last decoded frame.
- **Frame count:** the script writes the actual count (190 today) to `lib/hero-frames.ts`
  as `HERO_FRAME_COUNT`, together with the frame dimensions. If the clip is replaced, re-run
  `node scripts/prepare-assets.mjs hero` and the hero picks up the new count automatically.
  The text handoff in `app/_components/hero/hero-stage.tsx` (`T`) is timed to the current
  clip's dissolve at frames ~100–114; adjust it if the new clip's dissolve lands elsewhere.
