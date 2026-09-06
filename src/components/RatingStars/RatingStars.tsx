import { useId, useState } from "react";
import "./RatingStars.css";

const STAR_PATH = "M12 2.5l2.91 5.9 6.51.95-4.71 4.59 1.11 6.49L12 17.37l-5.82 3.06 1.11-6.49-4.71-4.59 6.51-.95L12 2.5Z";
const STAR_SIZE = 24;

type RatingStarsProps = {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  className?: string;
  onChange?: (value: number) => void;
  disabled?: boolean;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function StarGlyph({ fill, size, clipId }: { fill: number; size: number; clipId: string }) {
  const fillWidth = STAR_SIZE * clamp(fill, 0, 1);

  return (
    <svg
      className="rating-stars__star"
      width={size}
      height={size}
      viewBox={`0 0 ${STAR_SIZE} ${STAR_SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={fillWidth} height={STAR_SIZE} />
        </clipPath>
      </defs>
      <path className="rating-stars__empty" d={STAR_PATH} />
      {fillWidth > 0 && <path className="rating-stars__fill" d={STAR_PATH} clipPath={`url(#${clipId})`} />}
    </svg>
  );
}

export function RatingStars({
  value,
  max = 4,
  size = 22,
  label,
  className = "",
  onChange,
  disabled = false,
}: RatingStarsProps) {
  const clipId = useId();
  const starCount = Math.max(1, Math.round(max));
  const safeValue = clamp(Number.isFinite(value) ? value : 0, 0, starCount);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? safeValue;
  const accessibleLabel = label ?? `${safeValue} out of ${starCount} stars`;
  const classes = ["rating-stars", onChange ? "rating-stars--interactive" : "", className].filter(Boolean).join(" ");

  if (onChange) {
    return (
      <div
        className={classes}
        role="radiogroup"
        aria-label={accessibleLabel}
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: starCount }, (_, index) => {
          const fill = clamp(displayValue - index, 0, 1);
          return (
            <span
              key={index}
              className="rating-stars__interactive-star"
            >
              <StarGlyph fill={fill} size={size} clipId={`${clipId}-${index}`} />
              {[0.5, 1].map((step) => {
                const nextValue = index + step;
                return (
                  <button
                    key={step}
                    type="button"
                    role="radio"
                    aria-checked={safeValue === nextValue}
                    aria-label={`${nextValue} out of ${starCount} stars`}
                    disabled={disabled}
                    onMouseEnter={() => {
                      if (!disabled) setHoverValue(nextValue);
                    }}
                    onClick={() => onChange(nextValue)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                        event.preventDefault();
                        const followingValue = clamp(nextValue + 0.5, 0.5, starCount);
                        onChange(followingValue);
                      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                        event.preventDefault();
                        const previousValue = clamp(nextValue - 0.5, 0.5, starCount);
                        onChange(previousValue);
                      } else if (event.key === "Home") {
                        event.preventDefault();
                        onChange(0.5);
                      } else if (event.key === "End") {
                        event.preventDefault();
                        onChange(starCount);
                      }
                    }}
                  />
                );
              })}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <span className={classes} role="img" aria-label={accessibleLabel}>
      {Array.from({ length: starCount }, (_, index) => (
        <StarGlyph key={index} fill={safeValue - index} size={size} clipId={`${clipId}-${index}`} />
      ))}
    </span>
  );
}
