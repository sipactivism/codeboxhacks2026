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
  filters: ClubFilters;
  onFiltersChange: (filters: ClubFilters) => void;
  onOpenCategory: (
    category: BrowseCategory,
    filters: ClubFilters,
  ) => void;
  onCreateClub: () => void;
};

export function HomePage({
  filters,
  onFiltersChange,
  onOpenCategory,
  onCreateClub,
}: HomePageProps) {
  return (
    <main className="home-page">
      <section className="home-page__content">
        <header className="home-page__heading">
          <h1>
            Club<span>Rate</span>
          </h1>

          <p>A brand new way to view and rate clubs.</p>
        </header>

        <SearchFilter
          filters={filters}
          onChange={onFiltersChange}
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
            Add your club
          </button>
        </div>
      </section>
    </main>
  );
}