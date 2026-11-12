"use client";

/**
 * Coordinates the page loader with the elements it uncovers.
 *
 * Components register an entrance with `onIntro(fn)`. When the loader lifts it
 * builds ONE timeline and hands it to every registered entrance, so the hero,
 * header and buttons are choreographed with the loader's exit on a shared clock.
 * Page transitions re-arm it (`armIntro`) so the next page's entrances play on
 * the reveal. Registering while nothing covers the page (e.g. back/forward)
 * does nothing: those elements are simply visible.
 */
type Entrance = (tl: gsap.core.Timeline) => void;

const entrances = new Set<Entrance>();
let finished = false;

export function onIntro(fn: Entrance) {
  if (finished) return () => {};
  entrances.add(fn);
  return () => entrances.delete(fn);
}

/** Called by the loader: add every registered entrance to its exit timeline. */
export function playIntro(tl: gsap.core.Timeline) {
  if (finished) return;
  finished = true;
  entrances.forEach((fn) => fn(tl));
  entrances.clear();
}

/** A page transition is covering the page: the next page's entrances register again. */
export function armIntro() {
  finished = false;
  entrances.clear();
}

/** True while the loader still covers the page. */
export function introPending() {
  return !finished;
}
