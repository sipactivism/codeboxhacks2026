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
      className={`category-card category-card--${category.id}`}
      type="button"
      onClick={() => onOpen(category.id)}
    >
      <strong>{category.name}</strong>

      <span className="category-card__description">
        {category.description}
      </span>
    </button>
  );
}
