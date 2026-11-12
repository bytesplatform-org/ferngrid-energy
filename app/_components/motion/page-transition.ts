"use client";

/**
 * Page transitions, the sequential "leave → navigate → enter" pattern:
 *
 * 1. `TransitionLink` hands its navigation to `startPageTransition` from Link's
 *    `onNavigate` (and cancels Next's own navigation when it's taken over).
 * 2. The loader covers the page, then calls `router.push`.
 * 3. `routeCommitted` is reported by a `usePathname` watcher once React has
 *    rendered the new route; `waitForRoute` resolves and the loader reveals it.
 */
type Handler = (url: URL) => boolean;

let handler: Handler | null = null;

/** The loader registers itself as the transition handler. */
export function setTransitionHandler(h: Handler) {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}

/** True when the transition took over this navigation (the caller cancels Next's). */
export function startPageTransition(href: string) {
  if (!handler || typeof window === "undefined") return false;
  return handler(new URL(href, window.location.href));
}

const waiters = new Set<(pathname: string) => void>();

/** Reported after React commits a route (pathname changed). */
export function routeCommitted(pathname: string) {
  waiters.forEach((w) => w(pathname));
}

/** Resolves once `pathname` has rendered (true), or after `timeoutMs` (false). */
export function waitForRoute(pathname: string, timeoutMs: number) {
  return new Promise<boolean>((resolve) => {
    const done = (ok: boolean) => {
      waiters.delete(waiter);
      window.clearTimeout(timer);
      resolve(ok);
    };
    const waiter = (p: string) => p === pathname && done(true);
    const timer = window.setTimeout(() => done(false), timeoutMs);
    waiters.add(waiter);
  });
}

/**
 * Survives a full page reload mid-transition (e.g. a route that isn't built yet),
 * so the fresh loader continues the charge instead of restarting it.
 */
export const RESUME_KEY = "fg:transition";
