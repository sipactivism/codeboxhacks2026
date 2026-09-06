import { useState } from "react";

import { CategoryCard } from "../CategoryCard/CategoryCard";
import { SearchFilter } from "../SearchFilter/SearchFilter";
import { TopRatedCard } from "../TopRatedCard/TopRatedCard";

import { categories } from "../../data/categories";
import { majorGroups } from "../../data/majors";

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
  const [majorPickerOpen, setMajorPickerOpen] = useState(false);

  function openCategory(category: BrowseCategory) {
    if (category === "major-specific") {
      setMajorPickerOpen(true);
      return;
    }

    onOpenCategory(category, filters);
  }

  function searchMajor(major: string) {
    setMajorPickerOpen(false);
    onOpenCategory("major-specific", { ...filters, query: major });
  }

  return (
    <main className="home-page">
      <section className="home-page__content">
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
              onOpen={openCategory}
            />
          ))}
        </section>

        <div className="home-page__create">
          <p className="home-page__create-prompt">Don't see your club here?</p>
          <button
            type="button"
            onClick={onCreateClub}
          >
            <span aria-hidden="true">＋</span>
            Add a club
          </button>
        </div>
      </section>

      {majorPickerOpen && (
        <div
          className="major-picker-backdrop"
          role="presentation"
          onMouseDown={() => setMajorPickerOpen(false)}
        >
          <section
            className="major-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="major-picker-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="major-picker__header">
              <div>
                <h2 id="major-picker-title">Select a major</h2>
              </div>
              <button
                className="major-picker__close"
                type="button"
                aria-label="Close major picker"
                onClick={() => setMajorPickerOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="major-picker__groups">
              {Object.entries(majorGroups).map(([group, majors]) => (
                <div className="major-picker__group" key={group}>
                  <h3>{group}</h3>
                  <div className="major-picker__options">
                    {majors.map((major) => (
                      <button
                        type="button"
                        key={major}
                        onClick={() => searchMajor(major)}
                      >
                        {major}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
