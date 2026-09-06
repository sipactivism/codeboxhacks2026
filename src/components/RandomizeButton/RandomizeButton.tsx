import "./RandomizeButton.css";
import { Dices } from "lucide-react";

type RandomizeButtonProps = {
  onClick: () => void;
};

export function RandomizeButton({ onClick }: RandomizeButtonProps) {
  return (
    <button
      className="randomize-button"
      type="button"
      onClick={onClick}
      aria-label="Randomize clubs"
    >
      <Dices aria-hidden="true" strokeWidth={2.2} />
    </button>
  );
}
