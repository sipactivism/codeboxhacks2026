export type CategoryId =
  | "sports"
  | "major-specific"
  | "arts"
  | "culture"
  | "niche"
  | "random";

export type BrowseCategory = CategoryId | "top-rated";

export type ClubFilters = {
  query: string;
  commitment: "all" | "low" | "medium" | "high";
  minimumRating: number;
};

export type Category = {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
};