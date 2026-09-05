import "./TopRatedCard.css";

type TopRatedCardProps = {
  onOpen: () => void;
};

export function TopRatedCard({
  onOpen,
}: TopRatedCardProps) {
  return (
    <button
      className="top-rated-card"
      type="button"
      onClick={onOpen}
    >
      <span>
        <strong>Top Rated</strong>

        <small>
          See the highest-rated clubs across campus
        </small>
      </span>
    </button>
  );
}
