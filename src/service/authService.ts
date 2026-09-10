import api from './api';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  perfil: 'tutor' | 'veterinario';
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: 'tutor' | 'veterinario';
  };
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post('/api/auth/register', data),
};
