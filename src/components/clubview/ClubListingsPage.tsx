import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { supabase } from "../../utils/supabase";
import "./Club-Listings.css";
import { PageContext } from "../../PageContext";
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
  commitment: CommitmentLevel;
  tags: string[];
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

type ClubRow = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  club_statistics: Record<string, unknown> | null;
  tags: string[] | null;
  contact_links: unknown;
};

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

function contactLinksFrom(value: unknown): NonNullable<Club["contactLinks"]> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((link) => {
    if (!link || typeof link !== "object") return [];
    const { platform, url } = link as { platform?: unknown; url?: unknown };
    if (typeof url !== "string" || !CONTACT_PLATFORMS.includes(platform as typeof CONTACT_PLATFORMS[number])) return [];
    return [{ platform: platform as NonNullable<Club["contactLinks"]>[number]["platform"], url }];
  });
}

function clubFromRow(row: ClubRow): Club {
  const stats = row.club_statistics ?? {};
  return {
    id: String(row.id),
    slug: String(row.id),
    name: row.name,
    category: row.tags?.[0] ?? "Campus club",
    description: row.description,
    rating: optionalNumber(stats.enjoyment_rating ?? stats.rating),
    reviewCount: optionalNumber(stats.review_count),
    commitment: commitmentFrom(stats.commitment_level),
    tags: row.tags ?? [],
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
  const commitment = COMMITMENT[club.commitment];

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
            <span className={`commitment-pill commitment--${club.commitment}`} title={commitment.detail}>
              <span className="commitment-dot" aria-hidden="true" />
              {commitment.label}
            </span>
            {club.tags.map((tag) => <span className="club-tag" key={tag}>{tag}</span>)}
          </div>
        </div>
      </div>

      <div className="club-side">
        {club.rating !== undefined ? (
          <div className="club-rating-block">
            <div className="club-rating" aria-label={`${club.rating.toFixed(1)} out of 4 stars`}>
              <span>{club.rating.toFixed(1)}</span><span className="club-star" aria-hidden="true">★</span>
            </div>
            <div
              className="club-reviews"
              aria-label={`${club.rating.toFixed(1)} out of 4 stars${club.reviewCount !== undefined ? ` from ${club.reviewCount} reviews` : ""}`}
            >
              ★★★★
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
  onClubClick,
}: ClubListingsPageProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
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
      const { data, error } = await supabase
        .schema("public")
        .from("clubs")
        .select("id, name, description, image, club_statistics, tags, contact_links")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setLoadError(error.message);
      } else {
        setClubs((data as ClubRow[]).map(clubFromRow));
      }
      setLoading(false);
    }

    loadClubs();
    return () => { active = false; };
  }, []);

  const visibleClubs = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? clubs.filter((club) =>
          [club.name, club.category, club.description, COMMITMENT[club.commitment].label, ...club.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : [...clubs];

    const commitmentFiltered = filters.commitment === "all"
      ? filtered
      : filtered.filter((club) => {
          if (filters.commitment === "low") return club.commitment === "none" || club.commitment === "low";
          if (filters.commitment === "medium") return club.commitment === "moderate";
          return club.commitment === "high" || club.commitment === "serious";
        });

    const ratingFiltered = filters.minimumRating === 0
      ? commitmentFiltered
      : commitmentFiltered.filter((club) => (club.rating ?? 0) >= filters.minimumRating);

    return ratingFiltered.sort((a, b) => {
      if (sortMode === "rating-desc") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sortMode === "rating-asc") return (a.rating ?? Number.POSITIVE_INFINITY) - (b.rating ?? Number.POSITIVE_INFINITY);
      if (sortMode === "commitment-desc") return COMMITMENT[b.commitment].rank - COMMITMENT[a.commitment].rank;
      return COMMITMENT[a.commitment].rank - COMMITMENT[b.commitment].rank;
    });
  }, [clubs, filters, sortMode]);

  const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === sortMode)?.label;

  const pageContext = useContext(PageContext);


  return (
    <main className="clubs-page">
      <div className="clubs-eyebrow hover-mouse" onClick={() => {pageContext.setPageNum(1)}}>Back home</div>
      <div className="clubs-title-row">
        <h1>Popular across Cal Poly</h1>
        <p className="clubs-count" aria-live="polite">
          {loading ? "Loading clubs…" : `${visibleClubs.length} ${visibleClubs.length === 1 ? "club" : "clubs"}${filters.query ? " found" : ""}`}
        </p>
      </div>

      <div className="clubs-toolbar">
        <label className="clubs-search">
          <span className="sr-only">Search clubs</span>
          <input
            id="club-search2"
            type="search"
            value={filters.query}
            onChange={(event) =>
              onFiltersChange({ ...filters, query: event.target.value })
            }
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
      </div>

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
