import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

export type ThemeMode = "light" | "system" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const forceLightMode = () => {};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode: ThemeMode = "light";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "light";
    root.style.colorScheme = "light";
    try {
      window.localStorage.setItem("clubrate-theme", "light");
    } catch {
      // Private browsing and embedded contexts may disable local storage.
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode: forceLightMode }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
