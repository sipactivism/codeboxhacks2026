/** The UI displays ratings as 0.5–4 stars, while Supabase stores half-star units. */
export const MIN_STARS = 0.5;
export const MAX_STARS = 4;
export const MIN_STORED_RATING = 1;
export const MAX_STORED_RATING = 8;

export function starsToStoredRating(stars: number): number | null {
  if (!Number.isFinite(stars) || stars < MIN_STARS || stars > MAX_STARS) return null;
  const stored = stars * 2;
  return Number.isInteger(stored) ? stored : null;
}

export function storedRatingToStars(value: unknown): number | null {
  const stored = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(stored) || stored < MIN_STORED_RATING || stored > MAX_STORED_RATING) return null;
  return stored / 2;
}
