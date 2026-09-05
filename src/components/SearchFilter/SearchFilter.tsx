import { useState } from "react";
import type { FormEvent } from "react";

import type { ClubFilters } from "../../types/clubs";

import "./SearchFilter.css";

type SearchFilterProps = {
  filters: ClubFilters;
  onChange: (filters: ClubFilters) => void;
  onSubmit: () => void;
};

export function SearchFilter({
  filters,
  onChange,
  onSubmit,
}: SearchFilterProps) {
  const [filtersOpen, setFiltersOpen] =
    useState(false);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function clearFilters() {
    onChange({
      query: "",
      commitment: "all",
      minimumRating: 0,
    });
  }

  return (
    <form
      className="search-filter"
      onSubmit={submitForm}
    >
      <div className="search-filter__bar">
        <label
          className="sr-only"
          htmlFor="club-search"
        >
          Search clubs
        </label>

        <input
          id="club-search"
          type="search"
          placeholder="Search by club name or keyword..."
          value={filters.query}
          onChange={(event) =>
            onChange({
              ...filters,
              query: event.target.value,
            })
          }
        />

        <button
          className="search-filter__toggle"
          type="button"
          aria-label="Open club filters"
          aria-expanded={filtersOpen}
          aria-controls="club-filter-panel"
          onClick={() =>
            setFiltersOpen((current) => !current)
          }
        >
          ☷
        </button>
      </div>

      {filtersOpen && (
        <div
          className="filter-panel"
          id="club-filter-panel"
        >
          <div className="filter-panel__header">
            <strong>Filter clubs</strong>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear all
            </button>
          </div>

          <label>
            Weekly commitment

            <select
              value={filters.commitment}
              onChange={(event) =>
                onChange({
                  ...filters,
                  commitment: event.target.value as
                    ClubFilters["commitment"],
                })
              }
            >
              <option value="all">Any commitment</option>
              <option value="low">Low · 0–2 hours</option>
              <option value="medium">
                Medium · 2–5 hours
              </option>
              <option value="high">High · 5+ hours</option>
            </select>
          </label>

          <label>
            Minimum rating

            <select
              value={filters.minimumRating}
              onChange={(event) =>
                onChange({
                  ...filters,
                  minimumRating: Number(
                    event.target.value,
                  ),
                })
              }
            >
              <option value={0}>Any rating</option>
              <option value={4}>4.0 and above</option>
              <option value={4.5}>4.5 and above</option>
            </select>
          </label>

          <button
            className="filter-panel__apply"
            type="submit"
          >
            View results
          </button>
        </div>
      )}
    </form>
  );
}