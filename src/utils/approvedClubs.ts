import { supabase } from "./supabase";
import { storedRatingToStars } from "./ratings";

/**
 * The fields needed to render browse cards. Keeping this select narrow avoids
 * transferring unrelated club data every time someone opens the directory.
 */
export type ApprovedClubRow = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  club_statistics: Record<string, unknown> | null;
  tags: string[] | null;
  contact_links: unknown;
  /** Aggregates derived from ratings; these are not persisted on the club row. */
  rating?: number;
  review_count?: number;
  community_commitment?: number;
  community_commitment_count?: number;
};

const CACHE_TTL_MS = 60_000;

let cachedRows: ApprovedClubRow[] | null = null;
let cachedAt = 0;
let pendingRequest: Promise<ApprovedClubRow[]> | null = null;

type RatingRow = {
  club_id: number;
  rating: number | string | null;
  commitment: number | string | null;
};

function withRatingAggregates(rows: ApprovedClubRow[], ratingRows: RatingRow[]) {
  const aggregates = new Map<number, { total: number; count: number; commitmentTotal: number; commitmentCount: number }>();

  for (const ratingRow of ratingRows) {
    const rating = storedRatingToStars(ratingRow.rating);
    const current = aggregates.get(Number(ratingRow.club_id)) ?? { total: 0, count: 0, commitmentTotal: 0, commitmentCount: 0 };
    if (rating !== null) {
      current.total += rating;
      current.count += 1;
    }
    const commitment = Number(ratingRow.commitment);
    if (Number.isInteger(commitment) && commitment >= 1 && commitment <= 5) {
      current.commitmentTotal += commitment;
      current.commitmentCount += 1;
    }
    aggregates.set(Number(ratingRow.club_id), current);
  }

  return rows.map((row) => {
    const aggregate = aggregates.get(Number(row.id));
    if (!aggregate || (aggregate.count === 0 && aggregate.commitmentCount === 0)) return row;

    return {
      ...row,
      ...(aggregate.count > 0 ? { rating: aggregate.total / aggregate.count, review_count: aggregate.count } : {}),
      ...(aggregate.commitmentCount > 0 ? {
        community_commitment: aggregate.commitmentTotal / aggregate.commitmentCount,
        community_commitment_count: aggregate.commitmentCount,
      } : {}),
    };
  });
}

/**
 * Reads the public directory once per minute per browser session. Concurrent
 * callers share the same request, so navigation and repeated searches do not
 * create duplicate Supabase reads.
 */
export async function getApprovedClubRows(): Promise<ApprovedClubRow[]> {
  if (cachedRows !== null && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRows;
  }

  if (pendingRequest) return pendingRequest;

  const request = (async () => {
    const { data, error } = await supabase
      .schema("public")
      .from("clubs")
      .select("id, name, description, image, club_statistics, tags, contact_links")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    const rows = (data ?? []) as ApprovedClubRow[];
    const clubIds = rows.map((row) => row.id);
    let rowsWithRatings = rows;

    // The directory query intentionally stays narrow, so fetch the aggregate
    // source separately. This also handles older club rows whose JSON stats do
    // not contain the rating fields yet. If ratings RLS is unavailable, retain
    // the club rows and let the directory render without a rating.
    if (clubIds.length > 0) {
      const ratingsResult = await supabase
        .schema("public")
        .from("ratings")
        .select("club_id, rating, commitment")
        .in("club_id", clubIds);

      if (!ratingsResult.error) {
        rowsWithRatings = withRatingAggregates(rows, (ratingsResult.data ?? []) as RatingRow[]);
      }
    }

    cachedRows = rowsWithRatings;
    cachedAt = Date.now();
    return rowsWithRatings;
  })();

  pendingRequest = request;
  try {
    return await request;
  } finally {
    if (pendingRequest === request) pendingRequest = null;
  }
}
