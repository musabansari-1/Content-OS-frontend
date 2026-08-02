/**
 * Page-transition choreography for the app shell.
 *
 * A deliberately lightweight, GPU-composited directional slide:
 *
 *   - `router.push` fires immediately, so the outgoing page stays live and
 *     interactive until Next.js swaps in the new one. There is no frozen
 *     snapshot and no View Transitions capture — the app's pages are heavy
 *     with backdrop-blur, and full-page snapshotting or large live
 *     transforms force per-frame backdrop re-sampling, which is what caused
 *     the visible lag.
 *   - The direction of the navigation ("forward"/"backward") is recorded in
 *     module state and read by AppFrame while rendering the incoming page,
 *     which applies a `.page-enter-*` class to its freshly-mounted
 *     `.app-page` (see "A. Page transitions" in src/styles.css). The class
 *     is applied only to the new page's fresh element — never to the
 *     outgoing one, so the old page's animation can't restart (a visible
 *     jerk). Applying the direction via a click-time attribute would change
 *     the matched animation rule on the still-mounted old page and replay
 *     its entrance.
 *
 * The direction is overwritten by the next navigation and cleared on browser
 * back/forward (popstate), so those navigations play the neutral fade
 * entrance. Content never fades out or disappears; it just moves.
 */

/** Left-to-right order of the app's nav tabs (matches NAV_ITEMS in AppFrame). */
const APP_ROUTE_ORDER = [
  "/",
  "/workspace",
  "/calendar",
  "/integrations",
  "/billing",
];

/** Direction of the most recent in-app navigation, or null. */
let lastDirection = null;

/**
 * Whether the navbar drop-in has already played this session. Each route
 * remounts AppFrame, and the direction is null on any navigation that isn't
 * a tab click (browser back/forward, plain redirects, popstate). Without a
 * session guard the drop-in would replay and the navbar would visibly move
 * on those navigations too. Play it at most once per page-load session.
 */
let headerDropPlayed = false;

/** True if the navbar drop-in should still play (once per session). */
export function shouldPlayHeaderDrop() {
  return !headerDropPlayed;
}

/** Remember that the navbar drop-in has played. */
export function markHeaderDropPlayed() {
  headerDropPlayed = true;
}

/** "forward" (slide in from the right) or "backward" (from the left). */
function getNavDirection(fromPath, toPath) {
  const fromIdx = APP_ROUTE_ORDER.indexOf(fromPath);
  const toIdx = APP_ROUTE_ORDER.indexOf(toPath);
  if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) return "backward";
  return "forward";
}

/**
 * Direction of the last `navigateWithTransition` call, for the incoming page
 * to pick its entrance. Null on first load / direct entries.
 */
export function getPageDirection() {
  return lastDirection;
}

/** Forget the recorded direction (called after a page mounts). */
export function clearPageDirection() {
  lastDirection = null;
}

// Browser back/forward isn't driven by our helper, so drop any leftover
// direction and let those navigations play the neutral fade entrance.
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastDirection = null;
  });
}

/** True when a click should trigger an in-app transition (not a new tab, etc.). */
export function shouldApplyTransition(event) {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false; // let the browser open a new tab / new window
  }
  return true;
}

/**
 * Navigate with a directional entrance slide on the incoming page.
 * Outside the app shell or for reduced-motion users, it's a plain push.
 */
export function navigateWithTransition(router, href) {
  if (typeof window === "undefined") {
    router.push(href);
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const page = document.querySelector(".app-page");

  if (reduceMotion || !page) {
    router.push(href);
    return;
  }

  lastDirection = getNavDirection(window.location.pathname, href);

  router.push(href);

  // Move focus to the new page surface for keyboard users once it mounts
  // (no scroll jump). Retry briefly in case the route is still loading, but
  // focus each distinct page node at most once to avoid focus churn on the
  // outgoing page.
  let attempt = 0;
  let lastFocused = null;
  const focusTick = () => {
    const next = document.querySelector(".app-page");
    if (next && next !== lastFocused) {
      next.focus({ preventScroll: true });
      lastFocused = next;
    }
    attempt += 1;
    if (attempt < 8) window.setTimeout(focusTick, 100);
  };
  window.setTimeout(focusTick, 100);
}
