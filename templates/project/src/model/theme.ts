/** Reads design tokens from CSS so the scene follows the page theme (light/dark, data-theme override). */

export function cssToken(name: string, fallback = "#888888"): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Calls `callback` when the OS scheme or the data-theme attribute changes. Returns an unsubscribe. */
export function onThemeChange(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    media.removeEventListener("change", callback);
    observer.disconnect();
  };
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
