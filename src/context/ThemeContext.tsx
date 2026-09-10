import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Paleta de Cores ────────────────────────────────────────────────────────
export const lightColors = {
  background: "#f4f6f8",
  surface: "#ffffff",
  surfaceSecondary: "#f8fafc",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  inputBackground: "#f8fafc",
  cardShadow: "#0f172a",
  
  // Cores da Marca (Clínica Veterinária)
  primary: "#0d9488", // Teal profissional
  primaryLight: "#ccfbf1",
  secondary: "#0ea5e9", // Azul suave
  secondaryLight: "#e0f2fe",
  
  // Feedback
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  
  isDark: false,
};

export const darkColors = {
  background: "#0f172a",
  surface: "#1e293b",
  surfaceSecondary: "#334155",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  border: "#475569",
  borderLight: "#334155",
  inputBackground: "#1e293b",
  cardShadow: "#000000",
  
  // Cores da Marca (Clínica Veterinária)
  primary: "#14b8a6", // Teal mais claro para contraste
  primaryLight: "#115e59",
  secondary: "#38bdf8", // Azul mais claro
  secondaryLight: "#0369a1",
  
  // Feedback
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  
  isDark: true,
};

export type ThemeColors = typeof lightColors;

// ─── Context ────────────────────────────────────────────────────────────────
interface ThemeContextData {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@settings_theme").then(val => {
      if (val === "dark") setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem("@settings_theme", next ? "dark" : "light");
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeContext);
}
