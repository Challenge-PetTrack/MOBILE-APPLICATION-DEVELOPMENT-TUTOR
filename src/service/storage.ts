import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  // Configurações e Sessão
  async getSession() {
    try {
      const data = await AsyncStorage.getItem("@session");
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  
  async saveSession(user: any) {
    try {
      await AsyncStorage.setItem("@session", JSON.stringify(user));
    } catch (e) { console.error(e); }
  },

  async clearSession() {
    try {
      await AsyncStorage.removeItem("@session");
    } catch (e) { console.error(e); }
  },

  async getOnboardingStatus() {
    try {
      return await AsyncStorage.getItem("@onboarding_done") === "true";
    } catch { return false; }
  },

  async setOnboardingDone() {
    try {
      await AsyncStorage.setItem("@onboarding_done", "true");
    } catch (e) { console.error(e); }
  },

  // Consultas
  async getConsultas() {
    try {
      const data = await AsyncStorage.getItem("@consultas");
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async saveConsulta(consulta: any) {
    try {
      const consultas = await this.getConsultas();
      consultas.push(consulta);
      await AsyncStorage.setItem("@consultas", JSON.stringify(consultas));
    } catch (e) { console.error(e); }
  }
};
