import "./RandomizeButton.css";

type RandomizeButtonProps = {
  onClick: () => void;
};

export function RandomizeButton({ onClick }: RandomizeButtonProps) {
  return (
    <button className="randomize-button" type="button" onClick={onClick}>
      <img src="/images/random-dice.png" alt="" />
      Randomize
    </button>
  );
}
