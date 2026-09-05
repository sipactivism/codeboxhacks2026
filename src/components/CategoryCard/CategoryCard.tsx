import type {
  Category,
  CategoryId,
} from "../../types/clubs";

import "./CategoryCard.css";

type CategoryCardProps = {
  category: Category;
  onOpen: (category: CategoryId) => void;
};

export function CategoryCard({
  category,
  onOpen,
}: CategoryCardProps) {
  return (
    <button
      className="category-card"
      type="button"
      onClick={() => onOpen(category.id)}
    >
      <span
        className="category-card__icon"
        aria-hidden="true"
      >
        {category.icon}
      </span>

      <strong>{category.name}</strong>

      <span className="category-card__description">
        {category.description}
      </span>
    </button>
  );
}