import { useTheme, type ThemeMode } from "../../theme/ThemeProvider";
import "./ThemeSwitch.css";

const modes: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function ThemeSwitch() {
  const { mode, setMode } = useTheme();

  return (
    <fieldset className="theme-switch" aria-label="Color theme">
      <legend className="sr-only">Color theme</legend>
      {modes.map(({ value, label }) => (
        <label className={mode === value ? "theme-switch__option is-active" : "theme-switch__option"} key={value}>
          <input
            type="radio"
            name="theme-mode"
            value={value}
            checked={mode === value}
            onChange={() => setMode(value)}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
