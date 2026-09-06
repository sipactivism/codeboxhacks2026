import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { MoreHorizontal } from "lucide-react";
import { getApprovedClubRows } from "../../utils/approvedClubs";
import type { ApprovedClubRow } from "../../utils/approvedClubs";
import { RatingStars } from "../RatingStars/RatingStars";
import "./Club-Listings.css";
import type { ClubFilters } from "../../types/clubs";

export type CommitmentLevel = "none" | "low" | "moderate" | "high" | "serious";

/**
 * Client-side representation of one row returned from public.clubs.
 */
export interface Club {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  communityCommitment?: number;
  communityCommitmentCount?: number;
  commitment: CommitmentLevel;
  tags: string[];
  majors: string[];
  logoUrl?: string;
  logoAlt?: string;
  initials?: string;
  contactLinks?: Array<{
    platform: "instagram" | "discord" | "groupme" | "website";
    url: string;
  }>;
}

interface ClubListingsPageProps {
  filters: ClubFilters;
  onFiltersChange: (filters: ClubFilters) => void;
  randomCategory?: boolean;
  randomSeed?: number;
  onClubClick?: (club: Club) => void;
}

type SortMode =
  | "rating-desc"
  | "rating-asc"
  | "commitment-desc"
  | "commitment-asc";

const COMMITMENT: Record<
  CommitmentLevel,
  { label: string; detail: string; rank: number }
> = {
  none: { label: "No commitment", detail: "Drop in whenever you want", rank: 0 },
  low: { label: "Low commitment", detail: "Events every once in a while", rank: 1 },
  moderate: { label: "Moderate commitment", detail: "A few hours each week", rank: 2 },
  high: { label: "High commitment", detail: "3–5 hours each week", rank: 3 },
  serious: { label: "Serious commitment", detail: "6+ hours each week", rank: 4 },
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "rating-desc", label: "Highest rating" },
  { value: "rating-asc", label: "Lowest rating" },
  { value: "commitment-desc", label: "Highest commitment" },
  { value: "commitment-asc", label: "Lowest commitment" },
];

const CONTACT_PLATFORMS = ["instagram", "discord", "groupme", "website"] as const;

function commitmentFrom(value: unknown): CommitmentLevel {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("serious")) return "serious";
  if (normalized.includes("high")) return "high";
  if (normalized.includes("low")) return "low";
  if (normalized.includes("no commitment") || normalized.includes("none")) return "none";
  return "moderate";
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function commitmentFromAverage(value: number | undefined): CommitmentLevel | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return (["none", "low", "moderate", "high", "serious"] as CommitmentLevel[])[Math.max(0, Math.min(4, Math.round(value) - 1))];
}

function contactLinksFrom(value: unknown): NonNullable<Club["contactLinks"]> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((link) => {
    if (!link || typeof link !== "object") return [];
    const { platform, url } = link as { platform?: unknown; url?: unknown };
    if (typeof url !== "string" || !CONTACT_PLATFORMS.includes(platform as typeof CONTACT_PLATFORMS[number])) return [];
    return [{ platform: platform as NonNullable<Club["contactLinks"]>[number]["platform"], url }];
  });
}

function shuffledClubs(clubs: Club[], seed: number) {
  const randomized = [...clubs];
  let state = (seed || 1) >>> 0;
  const nextRandom = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  for (let index = randomized.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(nextRandom() * (index + 1));
    [randomized[index], randomized[randomIndex]] = [
      randomized[randomIndex],
      randomized[index],
    ];
  }
  return randomized.slice(0, 10);
}

export function clubFromRow(row: ApprovedClubRow): Club {
  const stats = row.club_statistics ?? {};
  return {
    id: String(row.id),
    slug: String(row.id),
    name: row.name,
    category: row.tags?.[0] ?? "Campus club",
    description: row.description,
    rating: optionalNumber(row.rating),
    reviewCount: optionalNumber(row.review_count ?? stats.review_count),
    commitment: commitmentFrom(stats.commitment_level),
    communityCommitment: optionalNumber(row.community_commitment),
    communityCommitmentCount: optionalNumber(row.community_commitment_count),
    tags: row.tags ?? [],
    majors: Array.isArray(stats.majors)
      ? stats.majors.filter((major): major is string => typeof major === "string")
      : [],
    logoUrl: row.image ?? undefined,
    contactLinks: contactLinksFrom(row.contact_links),
  };
}

function ClubLogo({ club }: { club: Club }) {
  if (club.logoUrl) {
    return (
      <div className="club-logo">
        <img src={club.logoUrl} alt={club.logoAlt ?? `${club.name} logo`} />
      </div>
    );
  }

  const fallback = club.initials ?? club.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 4);
  return <div className="club-logo club-logo--fallback" aria-label={`${club.name} logo`}>{fallback}</div>;
}

function ClubCard({ club, onSelect }: { club: Club; onSelect: (club: Club) => void }) {
  const communityLevel = commitmentFromAverage(club.communityCommitment);
  const commitment = communityLevel ? COMMITMENT[communityLevel] : undefined;
  const [showMajors, setShowMajors] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(club);
    }
  };

  return (
    <article
      className="club-card"
      role="link"
      tabIndex={0}
      aria-label={`View ${club.name}`}
      onClick={() => onSelect(club)}
      onKeyDown={handleKeyDown}
    >
      <div className="club-main">
        <ClubLogo club={club} />
        <div className="club-copy">
          <h2 className="club-name">{club.name}</h2>
          <p className="club-description">{club.description}</p>
          <div className="club-tags">
            {commitment && communityLevel ? (
              <span className={`commitment-pill commitment--${communityLevel}`} title={`${commitment.label}, based on community reviews`} aria-label={`Average community commitment: ${club.communityCommitment!.toFixed(1)} out of 5, ${commitment.label}`}>
                <span className="commitment-dot" aria-hidden="true" />
                {club.communityCommitment!.toFixed(1)} / 5 · {commitment.label}
              </span>
            ) : <span className="commitment-pill commitment--unavailable">No community commitment yet</span>}
            {club.tags.map((tag) => <span className="club-tag" key={tag}>{tag}</span>)}
            {club.majors.length > 0 && (
              <button
                className="club-major-toggle"
                type="button"
                aria-label={showMajors ? "Hide majors" : "Show majors"}
                aria-expanded={showMajors}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowMajors((current) => !current);
                }}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <MoreHorizontal size={19} aria-hidden="true" />
              </button>
            )}
            {showMajors && club.majors.map((major) => <span className="club-major" key={major}>{major}</span>)}
          </div>
        </div>
      </div>

      <div className="club-side">
        {club.rating !== undefined ? (
          <div className="club-rating-block">
            <div className="club-rating" aria-label={`${club.rating.toFixed(1)} out of 4 stars`}>
              <RatingStars value={club.rating} size={18} label={`${club.rating.toFixed(1)} out of 4 stars`} />
              <span>{club.rating.toFixed(1)}</span>
            </div>
            <div
              className="club-reviews"
              aria-label={`${club.rating.toFixed(1)} out of 4 stars${club.reviewCount !== undefined ? ` from ${club.reviewCount} reviews` : ""}`}
            >
              {club.reviewCount === 1 ? "1 review" : `${club.reviewCount ?? 0} reviews`}
            </div>
          </div>
        ) : <span className="club-rating-unavailable">No ratings yet</span>}
        <span className="view-club" aria-hidden="true">View club <span>→</span></span>
      </div>
    </article>
  );
}

export default function ClubListingsPage({
  filters,
  onFiltersChange,
  randomCategory = false,
  randomSeed = 0,
  onClubClick,
}: ClubListingsPageProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [submittedQuery, setSubmittedQuery] = useState(filters.query);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("rating-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadClubs() {
      try {
        const loadedClubs = (await getApprovedClubRows()).map(clubFromRow);
        if (!active) return;
        setClubs(loadedClubs);
        setLoadError(null);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "An unexpected error occurred.");
      }
      if (active) setLoading(false);
    }

    loadClubs();
    return () => { active = false; };
  }, []);

  const visibleClubs = useMemo(() => {
    const normalizedQuery = (randomCategory ? "" : submittedQuery).trim().toLowerCase();
    const filtered = normalizedQuery
      ? clubs.filter((club) => {
          const searchableFields = [
            club.name,
            club.description,
            ...club.tags,
            ...club.majors,
            club.commitment,
            ...(club.communityCommitment !== undefined && commitmentFromAverage(club.communityCommitment) ? [COMMITMENT[commitmentFromAverage(club.communityCommitment)!].label, String(club.communityCommitment)] : []),
          ];

          return searchableFields.some((field) =>
            field.toLowerCase().includes(normalizedQuery),
          );
        })
      : [...clubs];

    const randomized = randomCategory ? shuffledClubs(filtered, randomSeed) : filtered;

    const commitmentFiltered = filters.commitment === "all"
      ? randomized
      : randomized.filter((club) => {
          const communityLevel = commitmentFromAverage(club.communityCommitment);
          if (!communityLevel) return false;
          if (filters.commitment === "low") return communityLevel === "none" || communityLevel === "low";
          if (filters.commitment === "medium") return communityLevel === "moderate";
          return communityLevel === "high" || communityLevel === "serious";
        });

    const ratingFiltered = filters.minimumRating === 0
      ? commitmentFiltered
      : commitmentFiltered.filter((club) => (club.rating ?? 0) >= filters.minimumRating);

    return ratingFiltered.sort((a, b) => {
      if (sortMode === "rating-desc") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sortMode === "rating-asc") return (a.rating ?? Number.POSITIVE_INFINITY) - (b.rating ?? Number.POSITIVE_INFINITY);
      if (sortMode === "commitment-desc") return (b.communityCommitment ?? -1) - (a.communityCommitment ?? -1);
      return (a.communityCommitment ?? Number.POSITIVE_INFINITY) - (b.communityCommitment ?? Number.POSITIVE_INFINITY);
    });
  }, [clubs, filters, randomCategory, randomSeed, sortMode, submittedQuery]);

  const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === sortMode)?.label;

  return (
    <main className="clubs-page">
      <div className="clubs-title-row">
        <p className="clubs-count" aria-live="polite">
          {loading ? "Loading clubs…" : `${visibleClubs.length} ${visibleClubs.length === 1 ? "club" : "clubs"}${submittedQuery ? " found" : ""}`}
        </p>
      </div>

      <form
        className="clubs-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(filters.query);
        }}
      >
        <label className="clubs-search">
          <span className="sr-only">Search clubs</span>
          <input
            id="club-search2"
            type="search"
            value={filters.query}
            onChange={(event) =>
              onFiltersChange({ ...filters, query: event.target.value })
            }
            onBlur={() => {
              if (filters.query !== submittedQuery) {
                setSubmittedQuery(filters.query);
              }
            }}
            placeholder="Search by club, interest, or keyword…"
          />
        </label>

        <div className="clubs-sort" ref={sortRef}>
          <button
            className="clubs-sort-button"
            type="button"
            aria-label={`Sort clubs: ${selectedSortLabel}`}
            aria-haspopup="menu"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>

          {sortOpen && (
            <div className="clubs-sort-menu" role="menu">
              <p>Sort clubs</p>
              {SORT_OPTIONS.map((option) => (
                <button
                  className={`clubs-sort-option ${sortMode === option.value ? "is-active" : ""}`}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sortMode === option.value}
                  key={option.value}
                  onClick={() => { setSortMode(option.value); setSortOpen(false); }}
                >
                  {option.label}<span aria-hidden="true">✓</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {loading ? (
        <div className="clubs-empty"><h2>Loading clubs…</h2></div>
      ) : loadError ? (
        <div className="clubs-empty"><h2>Could not load clubs</h2><p>{loadError}</p></div>
      ) : visibleClubs.length > 0 ? (
        <section className="clubs-list" aria-label="Club listings">
          {visibleClubs.map((club) => (
            <ClubCard club={club} onSelect={onClubClick ?? (() => undefined)} key={club.id} />
          ))}
        </section>
      ) : (
        <div className="clubs-empty">
          <h2>No clubs found</h2>
          <p>Try another name, category, or keyword.</p>
        </div>
      )}
    </main>
  );
}
