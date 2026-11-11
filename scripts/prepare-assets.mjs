#!/usr/bin/env node
/**
 * One-off asset pipeline for the FernGrid homepage.
 *
 *   node scripts/prepare-assets.mjs
 *
 * Reads from public/client-sent/ (never modified) and writes:
 *   public/images/*.webp           optimized greyscale photos
 *   public/images/og.jpg           1200×630 social card
 *   public/images/logo-*.png       logo mark crops + lockup
 *   app/icon.png, app/apple-icon.png
 *   public/hero/hero.mp4, poster.jpg  hero background video (needs ffmpeg; skipped if absent)
 *
 * See scripts/README.md.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/client-sent");
const OUT_IMG = path.join(ROOT, "public/images");
const OUT_HERO = path.join(ROOT, "public/hero");
const VIDEO = path.join(ROOT, "public/Drone_rising_over_snowy_ridge_loop.mp4");

const CARBON = { r: 0x1d, g: 0x22, b: 0x0f };
const PAPER = { r: 0xf8, g: 0xf9, b: 0xf7 };
const FERN = { r: 0x87, g: 0xa9, b: 0x6b };


/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

const FULLBLEED = 2560;
const STANDARD = 1600;

/** [source (relative to client-sent/Photos), output name, max width] */
const PHOTOS = [
  ["Home_Banner_Greyscale_n40_Brightness.png", "home-banner", FULLBLEED],
  ["About_PG_Ext_Greyscale.png", "about-pylon", FULLBLEED],
  ["Home_PG_Our_Software.jpg", "our-software", STANDARD],
  ["Home_PG_Our_Services.jpg", "our-services", STANDARD],
  ["Home_PG_Training_Services.jpg", "training-services", FULLBLEED],
  ["FEST_PG_Photo_1.jpg", "fest-1", FULLBLEED],
  ["FEST_PG_Photo_2.jpg", "fest-2", FULLBLEED],
  ["FEST_PG_Photo_3.jpg", "fest-3", FULLBLEED],
  ["FEST_PG_Photo_4.jpg", "fest-4", FULLBLEED],
  ["power_lines.jpg", "power-lines", STANDARD],
  ["powerlines.jpg", "powerlines", STANDARD],
];

async function photos() {
  mkdirSync(OUT_IMG, { recursive: true });
  for (const [src, name, maxW] of PHOTOS) {
    const out = path.join(OUT_IMG, `${name}.webp`);
    // Greyscale + a gentle contrast lift so mixed colour stock reads as one family.
    await sharp(path.join(SRC, "Photos", src), { limitInputPixels: false })
      .rotate()
      .resize({ width: maxW, withoutEnlargement: true })
      .grayscale()
      .linear(1.08, -6)
      .webp({ quality: 78, effort: 5 })
      .toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`  images/${name}.webp  ${meta.width}x${meta.height}`);
  }

  // Open Graph / social card from the Home banner.
  await sharp(path.join(SRC, "Photos/Home_Banner_Greyscale_n40_Brightness.png"), { limitInputPixels: false })
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .grayscale()
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_IMG, "og.jpg"));
  console.log("  images/og.jpg  1200x630");
}

/* ------------------------------------------------------------------ */
/* Logos + favicons                                                    */
/* ------------------------------------------------------------------ */

/** Recolour an RGBA image: keep its alpha, replace RGB with a flat colour. */
async function tint(input, color) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
  }
  return sharp(data, { raw: info }).png();
}

async function logos() {
  mkdirSync(OUT_IMG, { recursive: true });
  const lockupSrc = path.join(SRC, "Logos/logo.png");

  // Icon only: the fern-in-circle sits in the upper part of logo.png (756x574).
  // Bounds measured from the alpha channel (rows 30–327, cols 247–565) plus a
  // few px of padding. Note: sharp runs trim() before extract(), so don't chain them.
  const markBuf = await sharp(lockupSrc)
    .extract({ left: 243, top: 26, width: 327, height: 306 })
    .png()
    .toBuffer();
  const markSquare = await sharp(markBuf)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await (await tint(markSquare, CARBON)).toFile(path.join(OUT_IMG, "logo-mark.png"));
  await (await tint(markSquare, PAPER)).toFile(path.join(OUT_IMG, "logo-mark-paper.png"));
  await (await tint(await sharp(lockupSrc).trim().png().toBuffer(), CARBON)).toFile(
    path.join(OUT_IMG, "logo-lockup.png"),
  );
  console.log("  images/logo-mark.png, logo-mark-paper.png, logo-lockup.png");

  // Favicon: carbon mark on a fern disc (mirrors the client's Dark_icon).
  const icon = async (size, out) => {
    const pad = Math.round(size * 0.16);
    const disc = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="rgb(${FERN.r},${FERN.g},${FERN.b})"/></svg>`,
    );
    const mark = await (await tint(markSquare, CARBON)).resize(size - pad * 2, size - pad * 2).toBuffer();
    await sharp(disc).composite([{ input: mark, top: pad, left: pad }]).png().toFile(out);
  };
  await icon(512, path.join(ROOT, "app/icon.png"));
  await icon(180, path.join(ROOT, "app/apple-icon.png"));
  console.log("  app/icon.png, app/apple-icon.png");
}

/* ------------------------------------------------------------------ */
/* Hero background video                                               */
/* ------------------------------------------------------------------ */

const ff = (...args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });

/** The source clip is letterboxed; find the active picture area (e.g. "crop=1280:568:0:76"). */
function letterboxCrop() {
  const { stderr = "" } = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-i", VIDEO, "-vf", "cropdetect=limit=24:round=2", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const counts = new Map();
  for (const m of stderr.matchAll(/crop=(\d+:\d+:\d+:\d+)/g)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return best ? `crop=${best}` : "null";
}

function heroVideo() {
  if (spawnSync("ffmpeg", ["-version"]).status !== 0 || !existsSync(VIDEO)) {
    console.log("  skipped (ffmpeg or source clip missing)");
    return;
  }
  mkdirSync(OUT_HERO, { recursive: true });
  // Crop the letterbox and fully desaturate (removes a faint orange lens flare).
  const vf = `${letterboxCrop()},hue=s=0`;
  ff("-i", VIDEO, "-vf", vf, "-frames:v", "1", "-q:v", "3", path.join(OUT_HERO, "poster.jpg"));
  ff(
    "-i", VIDEO, "-vf", vf, "-an", "-c:v", "libx264", "-crf", "22", "-preset", "veryfast",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(OUT_HERO, "hero.mp4"),
  );
  console.log(`  hero/hero.mp4, hero/poster.jpg  (${vf})`);
}

/* ------------------------------------------------------------------ */

console.log("Photos");
await photos();
console.log("Logos");
await logos();
console.log("Hero video");
heroVideo();
console.log("Done.");
