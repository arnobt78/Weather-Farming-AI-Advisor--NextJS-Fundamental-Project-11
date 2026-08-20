/**
 * lib/units.ts — OpenWeather metric helpers
 *
 * Walkthrough:
 * - Current-weather and forecast use `units=metric`, so `wind.speed` is meters/second.
 * - UI and AI prompts label wind as km/h; convert once here so the number matches the label.
 */

/** Convert OpenWeather metric wind (m/s) to km/h, one decimal. */
export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6 * 10) / 10;
}
