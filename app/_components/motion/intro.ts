"use client";

/**
 * Coordinates the page loader with the elements it uncovers.
 *
 * Components register an entrance with `onIntro(fn)`. When the loader lifts it
 * builds ONE timeline and hands it to every registered entrance, so the hero,
 * header and buttons are choreographed with the loader's exit on a shared clock.
 * Registering after the loader has finished (or when there is no loader, e.g. a
 * client-side navigation) does nothing: those elements are simply visible.
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

/** True while the loader still covers the page. */
export function introPending() {
  return !finished;
}
