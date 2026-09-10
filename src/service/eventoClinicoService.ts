import api from './api';

export interface EventoClinicoDTO {
  id?: number;
  tipo?: string;
  descricao?: string;
  data?: string;
  diagnostico?: string;
  prescricao?: string;
  petId?: number;
  petNome?: string;
  tutorNome?: string;
  status?: 'pendente' | 'concluido' | 'cancelado';
}

export const eventoClinicoService = {
  getAll: () =>
    api.get<EventoClinicoDTO[]>('/evento/todos'),

  getById: (id: number) =>
    api.get<EventoClinicoDTO>(`/evento/${id}`),

  create: (data: Omit<EventoClinicoDTO, 'id'>) =>
    api.post<EventoClinicoDTO>('/evento', data),

  update: (id: number, data: Partial<EventoClinicoDTO>) =>
    api.put<EventoClinicoDTO>(`/evento/${id}`, data),

  delete: (id: number) =>
    api.delete(`/evento/${id}`),
};
