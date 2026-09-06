export type CategoryId =
  | "sports"
  | "major-specific"
  | "arts"
  | "culture"
  | "fun"
  | "academic";

export type BrowseCategory = CategoryId | "top-rated";

export type ClubFilters = {
  query: string;
  commitment: "all" | "low" | "medium" | "high";
  minimumRating: number;
};

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
};
