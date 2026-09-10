import api from './api';

export interface TutorDTO {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
}

export const tutorService = {
  getAll: () =>
    api.get<TutorDTO[]>('/tutor/todos'),

  getById: (id: number) =>
    api.get<TutorDTO>(`/tutor/${id}`),

  create: (data: Omit<TutorDTO, 'id'>) =>
    api.post<TutorDTO>('/tutor', data),

  update: (id: number, data: Partial<TutorDTO>) =>
    api.put<TutorDTO>(`/tutor/${id}`, data),

  delete: (id: number) =>
    api.delete(`/tutor/${id}`),
};
