import { createContext, useEffect, type ReactNode } from "react";

export type Theme = "light";
export type ResolvedTheme = "light";

export type ThemeContextType = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Remove dark class permanently and enforce light mode
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    localStorage.removeItem("proj_dash_theme_preference");
  }, []);

  const value: ThemeContextType = {
    theme: "light",
    resolvedTheme: "light",
    setTheme: () => {},
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


