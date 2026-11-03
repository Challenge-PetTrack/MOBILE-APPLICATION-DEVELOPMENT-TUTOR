import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { preferencesStorage } from "@/services/preferencesStorage";

export const lightColors = {
  background: "#f8f9fa",
  surface: "#ffffff",
  surfaceSecondary: "#f3f4f6",
  text: "#1a1a2e",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  inputBackground: "#f3f4f6",
  cardShadow: "#000",
  isDark: false,
};

export const darkColors = {
  background: "#0f0f1a",
  surface: "#1e1e2e",
  surfaceSecondary: "#2a2a3e",
  text: "#f0f0ff",
  textSecondary: "#a0a0b8",
  textMuted: "#6b6b80",
  border: "#3a3a55",
  borderLight: "#2a2a3e",
  inputBackground: "#2a2a3e",
  cardShadow: "#000",
  isDark: true,
};

export type ThemeColors = Omit<typeof lightColors, "isDark"> & { isDark: boolean };

interface ThemeContextData {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({
  colors: lightColors,
  isDark: false,
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    preferencesStorage.getTheme().then((saved) => {
      if (saved === "dark") setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await preferencesStorage.setTheme(next ? "dark" : "light");
  };

  const colors: ThemeColors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
