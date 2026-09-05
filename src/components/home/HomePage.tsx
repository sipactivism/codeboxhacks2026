import { useState } from "react";

import { CategoryCard } from "../CategoryCard/CategoryCard";
import { SearchFilter } from "../SearchFilter/SearchFilter";
import { TopRatedCard } from "../TopRatedCard/TopRatedCard";

import { categories } from "../../data/categories";

import type {
  BrowseCategory,
  ClubFilters,
} from "../../types/clubs";

import "./HomePage.css";

type HomePageProps = {
  onOpenCategory: (
    category: BrowseCategory,
    filters: ClubFilters,
  ) => void;
  onCreateClub: () => void;
};

export function HomePage({
  onOpenCategory,
  onCreateClub,
}: HomePageProps) {
  const [filters, setFilters] = useState<ClubFilters>({
    query: "",
    commitment: "all",
    minimumRating: 0,
  });

  return (
    <main className="home-page">
      <section className="home-page__content">
        <header className="home-page__heading">
          <h1>
            Club<span>Rate</span>
          </h1>

          <p>Find your people at Cal Poly.</p>
        </header>

        <SearchFilter
          filters={filters}
          onChange={setFilters}
          onSubmit={() =>
            onOpenCategory("top-rated", filters)
          }
        />

        <TopRatedCard
          onOpen={() =>
            onOpenCategory("top-rated", filters)
          }
        />

        <section
          className="category-grid"
          aria-label="Club categories"
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onOpen={(categoryId) =>
                onOpenCategory(categoryId, filters)
              }
            />
          ))}
        </section>

        <div className="home-page__create">
          <button
            type="button"
            onClick={onCreateClub}
          >
            <span aria-hidden="true">＋</span>
            Create club
          </button>
        </div>
      </section>
    </main>
  );
}