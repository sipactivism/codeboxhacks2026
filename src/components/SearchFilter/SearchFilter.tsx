import type { FormEvent } from "react";
import { FiSearch } from "react-icons/fi";

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
  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
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
          className="search-filter__submit"
          type="submit"
          aria-label="Search clubs"
        >
          <FiSearch aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}