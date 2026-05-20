// src/services/api.ts
const BASE_URL = "http://10.0.2.2:8080"; // emulador Android
// const BASE_URL = "http://localhost:8080"; // dispositivo físico na mesma rede

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    return response.json();
  },

  post: async (endpoint: string, body: object) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    return response.json();
  },

  put: async (endpoint: string, body: object) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    return response.json();
  },
};