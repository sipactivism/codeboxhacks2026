import "./AppHeader.css";

type AppHeaderProps = {
  canGoBack: boolean;
  onBack: () => void;
};

/** The persistent, keyboard-accessible navigation control for the current flow. */
export function AppHeader({ canGoBack, onBack }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <div className="app-header__brand" aria-label="ClubRate">
          <span>Club<span>Rate</span></span>
        </div>
        {canGoBack && (
          <button className="app-header__back" type="button" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </header>
  );
}
