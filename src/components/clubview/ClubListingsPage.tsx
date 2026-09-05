import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import "./Club-Listings.css";

export type CommitmentLevel = "none" | "low" | "moderate" | "high" | "serious";

/**
 * Keep your database/API response in this shape. Once fetched, pass the array
 * to <ClubListingsPage clubs={clubsFromDatabase} /> and every record becomes a card.
 */
export interface Club {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  commitment: CommitmentLevel;
  tags: string[];
  logoUrl?: string;
  logoAlt?: string;
  initials?: string;
}

interface ClubListingsPageProps {
  clubs?: Club[];
  /** Use this with React Router: onClubClick={(club) => navigate(`/clubs/${club.slug}`)} */
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

// Example data only. Replace this with your database result via the `clubs` prop.
export const SAMPLE_CLUBS: Club[] = [
  {
    id: "cal-poly-racing",
    slug: "cal-poly-racing",
    name: "Cal Poly Racing",
    initials: "CPR",
    category: "Sports · Competition",
    description: "Design, build, and race vehicles with multidisciplinary student teams.",
    rating: 4.9,
    reviewCount: 64,
    commitment: "serious",
    tags: ["Career value", "Project-based"],
  },
  {
    id: "cal-poly-entrepreneurs",
    slug: "cal-poly-entrepreneurs",
    name: "Cal Poly Entrepreneurs",
    initials: "CPE",
    category: "Major Specific · Business",
    description: "Build ideas, meet founders, and explore entrepreneurship at any level.",
    rating: 4.8,
    reviewCount: 86,
    commitment: "moderate",
    tags: ["Networking", "All majors"],
  },
  {
    id: "cal-poly-cycling",
    slug: "cal-poly-cycling",
    name: "Cal Poly Cycling",
    initials: "CPC",
    category: "Sports · Recreation",
    description: "Join group rides, build new skills, and compete in collegiate cycling.",
    rating: 4.7,
    reviewCount: 38,
    commitment: "high",
    tags: ["Beginner-friendly", "Outdoors"],
  },
  {
    id: "wish",
    slug: "women-in-software-and-hardware",
    name: "Women in Software & Hardware",
    initials: "WISH",
    category: "Major Specific · Computing",
    description: "A welcoming community for mentorship and professional growth in computing.",
    rating: 4.6,
    reviewCount: 51,
    commitment: "low",
    tags: ["Mentorship", "Community"],
  },
  {
    id: "cal-poly-robotics",
    slug: "cal-poly-robotics",
    name: "Cal Poly Robotics",
    initials: "CPR",
    category: "Engineering · Technology",
    description: "Create autonomous robots through mechanical, electrical, and software projects.",
    rating: 4.5,
    reviewCount: 72,
    commitment: "serious",
    tags: ["Project-based", "Technical"],
  },
  {
    id: "mustang-media-group",
    slug: "mustang-media-group",
    name: "Mustang Media Group",
    initials: "MMG",
    category: "Media · Creative",
    description: "Tell campus stories through journalism, radio, video, design, and live production.",
    rating: 4.4,
    reviewCount: 43,
    commitment: "moderate",
    tags: ["Portfolio building", "Creative"],
  },
  {
    id: "poly-reps",
    slug: "poly-reps",
    name: "Poly Reps",
    initials: "PR",
    category: "Leadership · Service",
    description: "Represent Cal Poly, welcome visitors, and grow as a student leader and ambassador.",
    rating: 4.3,
    reviewCount: 29,
    commitment: "high",
    tags: ["Leadership", "Service"],
  },
  {
    id: "slo-hacks",
    slug: "slo-hacks",
    name: "SLO Hacks",
    initials: "SLO",
    category: "Technology · Community",
    description: "Organize inclusive hackathons where students turn ideas into working projects.",
    rating: 4.2,
    reviewCount: 47,
    commitment: "low",
    tags: ["All majors", "Technology"],
  },
  {
    id: "cal-poly-dancesport",
    slug: "cal-poly-dancesport",
    name: "Cal Poly DanceSport",
    initials: "CPD",
    category: "Arts · Recreation",
    description: "Learn ballroom and Latin dance in a social and beginner-friendly setting.",
    rating: 4.1,
    reviewCount: 35,
    commitment: "moderate",
    tags: ["Beginner-friendly", "Social"],
  },
  {
    id: "engineers-without-borders",
    slug: "engineers-without-borders",
    name: "Engineers Without Borders",
    initials: "EWB",
    category: "Service · Engineering",
    description: "Partner with communities on sustainable engineering projects with real-world impact.",
    rating: 4.0,
    reviewCount: 58,
    commitment: "serious",
    tags: ["Service", "Engineering"],
  },
  {
    id: "photography-club",
    slug: "cal-poly-photography-club",
    name: "Cal Poly Photography Club",
    initials: "CPP",
    category: "Creative · Social",
    description: "Practice photography, join photo walks, and learn from creators at every skill level.",
    rating: 3.9,
    reviewCount: 24,
    commitment: "none",
    tags: ["Creative", "Beginner-friendly"],
  },
  {
    id: "mustang-film-society",
    slug: "mustang-film-society",
    name: "Mustang Film Society",
    initials: "MFS",
    category: "Arts · Social",
    description: "Watch, discuss, and create films with a community of curious student storytellers.",
    rating: 3.8,
    reviewCount: 31,
    commitment: "none",
    tags: ["Social", "Creative"],
  },
];

/** Default navigation function. Exported so it can also be called elsewhere. */
export function goToClubPage(club: Club) {
  window.location.assign(`/clubs/${encodeURIComponent(club.slug)}`);
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
          <p className="club-meta">{club.category}</p>
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
        <div className="club-rating-block">
          <div className="club-rating" aria-label={`${club.rating.toFixed(1)} out of 5 stars`}>
            <span>{club.rating.toFixed(1)}</span><span className="club-star" aria-hidden="true">★</span>
          </div>
          <div className="club-reviews">{club.reviewCount} verified reviews</div>
        </div>
        <span className="view-club" aria-hidden="true">View club <span>→</span></span>
      </div>
    </article>
  );
}

export default function ClubListingsPage({
  clubs = SAMPLE_CLUBS,
  onClubClick = goToClubPage,
}: ClubListingsPageProps) {
  const [query, setQuery] = useState("");
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

  const visibleClubs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? clubs.filter((club) =>
          [club.name, club.category, club.description, COMMITMENT[club.commitment].label, ...club.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : [...clubs];

    return filtered.sort((a, b) => {
      if (sortMode === "rating-desc") return b.rating - a.rating;
      if (sortMode === "rating-asc") return a.rating - b.rating;
      if (sortMode === "commitment-desc") return COMMITMENT[b.commitment].rank - COMMITMENT[a.commitment].rank;
      return COMMITMENT[a.commitment].rank - COMMITMENT[b.commitment].rank;
    });
  }, [clubs, query, sortMode]);

  const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === sortMode)?.label;

  return (
    <main className="clubs-page">
      <p className="clubs-eyebrow">Featured clubs</p>
      <div className="clubs-title-row">
        <h1>Popular across Cal Poly</h1>
        <p className="clubs-count" aria-live="polite">
          {visibleClubs.length} {visibleClubs.length === 1 ? "club" : "clubs"}{query ? " found" : ""}
        </p>
      </div>

      <div className="clubs-toolbar">
        <label className="clubs-search">
          <span className="sr-only">Search clubs</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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

      {visibleClubs.length > 0 ? (
        <section className="clubs-list" aria-label="Club listings">
          {visibleClubs.map((club) => (
            <ClubCard club={club} onSelect={onClubClick} key={club.id} />
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