import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "system" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "clubrate-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode === "system" ? "light dark" : mode;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Private browsing and embedded contexts may disable local storage.
    }
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
