import axios from 'axios';
import { storage } from './storage';

// Emulador Android: 10.0.2.2 aponta para localhost da máquina host
// Dispositivo físico: trocar para o IP local da máquina (ex: 192.168.x.x)
const BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de REQUEST: injeta token JWT ────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const session = await storage.getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Interceptor de RESPONSE: trata erros globais ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — limpa sessão local
      await storage.clearSession();
    }
    return Promise.reject(error);
  },
);

export default api;