import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Preferências locais do dispositivo (não sincronizadas com a nuvem).
 * Dados de negócio ficam no Firestore; aqui ficam apenas configurações do aparelho.
 */
const KEYS = {
  onboardingDone: "@onboarding_done",
  theme: "@settings_theme",
  notificationsEnabled: "@settings_notificacoes",
  consultaSnapshot: (uid: string) => `@consultas_snapshot_${uid}`,
} as const;

export type ThemePreference = "light" | "dark";

async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const preferencesStorage = {
  async isOnboardingDone(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.onboardingDone)) === "true";
  },

  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(KEYS.onboardingDone, "true");
  },

  async getTheme(): Promise<ThemePreference | null> {
    const value = await AsyncStorage.getItem(KEYS.theme);
    return value === "dark" || value === "light" ? value : null;
  },

  async setTheme(theme: ThemePreference): Promise<void> {
    await AsyncStorage.setItem(KEYS.theme, theme);
  },

  /** Notificações ficam habilitadas por padrão. */
  async getNotificationsEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.notificationsEnabled)) !== "false";
  },

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.notificationsEnabled, String(enabled));
  },

  /**
   * Último estado conhecido das consultas (id -> status) usado para detectar
   * mudanças vindas do backend e gerar notificações, inclusive após o app ser reaberto.
   */
  async getConsultaSnapshot(uid: string): Promise<Record<string, string> | null> {
    return getJson<Record<string, string>>(KEYS.consultaSnapshot(uid));
  },

  async setConsultaSnapshot(uid: string, snapshot: Record<string, string>): Promise<void> {
    await AsyncStorage.setItem(KEYS.consultaSnapshot(uid), JSON.stringify(snapshot));
  },
};
